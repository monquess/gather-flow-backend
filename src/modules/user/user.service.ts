import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

import * as bcrypt from 'bcryptjs';

import {
	FilteringOptionsDto,
	CreateUserDto,
	UpdateUserDto,
	UpdatePasswordDto,
} from './dto';
import { UserEntity } from './entities/user.entity';

import { S3Service } from '@modules/s3/s3.service';
import { PrismaService } from '@modules/prisma/prisma.service';
import { appConfig, AppConfig } from '@modules/config/configs/app.config';

@Injectable()
export class UserService {
	constructor(
		@Inject(appConfig.KEY)
		private readonly config: ConfigType<AppConfig>,
		private readonly prisma: PrismaService,
		private readonly s3Service: S3Service
	) {}

	async findAll({
		username,
		email,
	}: FilteringOptionsDto): Promise<UserEntity[]> {
		return this.prisma.user.findMany({
			where: {
				username: {
					contains: username,
					mode: 'insensitive',
				},
				email: {
					contains: email,
					mode: 'insensitive',
				},
				verified: true,
			},
		});
	}

	async findById(id: number): Promise<UserEntity> {
		return this.prisma.user.findUniqueOrThrow({ where: { id } });
	}

	async findByEmail(email: string): Promise<UserEntity> {
		return this.prisma.user.findFirstOrThrow({
			where: {
				email: {
					equals: email,
					mode: 'insensitive',
				},
			},
		});
	}

	async create(dto: CreateUserDto) {
		const salt = await bcrypt.genSalt();
		const hash = dto.password ? await bcrypt.hash(dto.password, salt) : null;

		return this.prisma.user.create({
			data: {
				...dto,
				avatar: this.config.defaults.avatar,
				password: hash,
			},
		});
	}

	async update(id: number, updateUserDto: UpdateUserDto): Promise<UserEntity> {
		return this.prisma.user.update({
			where: {
				id,
			},
			data: updateUserDto,
		});
	}

	async updatePassword(
		id: number,
		{ newPassword, currentPassword }: UpdatePasswordDto
	): Promise<UserEntity> {
		const user = await this.findById(id);

		if (user.password) {
			const passwordMatch = await bcrypt.compare(
				currentPassword,
				user.password
			);

			if (!passwordMatch) {
				throw new BadRequestException('Current password is incorrect');
			}
		}

		const salt = await bcrypt.genSalt();
		return this.prisma.user.update({
			where: {
				id,
			},
			data: {
				password: await bcrypt.hash(newPassword, salt),
			},
		});
	}

	async updateAvatar(
		id: number,
		avatar: Express.Multer.File
	): Promise<UserEntity> {
		const user = await this.findById(id);

		if (user.avatar !== this.config.defaults.avatar) {
			await this.s3Service.deleteFile(user.avatar);
		}

		const avatarData = await this.s3Service.uploadFile('avatars', avatar);

		return this.prisma.user.update({
			where: {
				id,
			},
			data: { avatar: avatarData.url },
		});
	}

	async remove(id: number): Promise<void> {
		await this.prisma.user.delete({
			where: {
				id,
			},
		});
	}
}
