import {
	Inject,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

import {
	DeleteObjectCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';

import { StorageConfig, storageConfig } from '@modules/config/configs';

@Injectable()
export class S3Service {
	private client: S3Client;
	private bucket: string;
	private endpoint: string;

	constructor(
		@Inject(storageConfig.KEY)
		private readonly config: ConfigType<StorageConfig>
	) {
		this.bucket = this.config.bucket;
		this.endpoint = this.config.endpoint;

		this.client = new S3Client({
			region: this.config.region,
			credentials: {
				accessKeyId: this.config.access.id,
				secretAccessKey: this.config.access.secret,
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
