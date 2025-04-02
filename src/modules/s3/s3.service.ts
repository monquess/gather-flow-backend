import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
	DeleteObjectCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import { EnvironmentVariables } from '@config/env/environment-variables.config';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';

@Injectable()
export class S3Service {
	private client: S3Client;
	private bucket: string;
	private endpoint: string;

	constructor(
		private readonly configService: ConfigService<EnvironmentVariables, true>
	) {
		this.bucket = this.configService.get<string>('S3_BUCKET_NAME');
		this.endpoint = this.configService.get<string>('S3_ENDPOINT');

		this.client = new S3Client({
			region: this.configService.get<string>('S3_REGION'),
			credentials: {
				accessKeyId: this.configService.get<string>('S3_ACCESS_KEY_ID'),
				secretAccessKey: this.configService.get<string>('S3_SECRET_ACCESS_KEY'),
			},
			endpoint: this.endpoint,
			forcePathStyle: true,
		});
	}

	async uploadFile(
		path: string,
		file: Express.Multer.File
	): Promise<{ key: string; url: string }> {
		try {
			const params = {
				Bucket: this.bucket,
				Key: `${path}/${new Date().toISOString()}-${uuid()}${extname(file.originalname)}`,
				Body: file.buffer,
				ContentType: file.mimetype,
			};

			await this.client.send(new PutObjectCommand(params));

			return {
				key: params.Key,
				url: this.getFileUrl(params.Key),
			};
		} catch (error) {
			throw new InternalServerErrorException(error);
		}
	}

	async deleteFile(url: string): Promise<void> {
		if (url.startsWith(`${this.endpoint}/${this.bucket}`)) {
			try {
				const params = {
					Bucket: this.bucket,
					Key: this.getKeyFromUrl(url),
				};

				await this.client.send(new DeleteObjectCommand(params));
			} catch (error) {
				throw new InternalServerErrorException(error);
			}
		}
	}

	getFileUrl(key: string): string {
		return `${this.endpoint}/${this.bucket}/${key}`;
	}

	getKeyFromUrl(url: string): string {
		return url.split(`${this.endpoint}/${this.bucket}/`)[1];
	}
}
