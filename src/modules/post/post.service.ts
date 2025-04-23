import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

import { PrismaService } from '@modules/prisma/prisma.service';
import { getPaginationMeta, Paginated } from '@common/pagination';

import { PostEntity } from './entities/post.entity';

@Injectable()
export class PostService {
	constructor(private readonly prisma: PrismaService) {}

	async findAll(page: number, limit: number): Promise<Paginated<PostEntity>> {
		const [posts, count] = await this.prisma.$transaction([
			this.prisma.post.findMany({
				include: {
					_count: {
						select: {
							likes: true,
						},
					},
				},
				take: limit,
				skip: (page - 1) * limit,
				orderBy: {
					createdAt: 'desc',
				},
			}),
			this.prisma.post.count(),
		]);

		return {
			data: posts.map(({ _count, ...rest }) => ({
				...rest,
				likes: _count.likes,
			})),
			meta: getPaginationMeta(count, page, limit),
		};
	}

	async findById(id: number): Promise<PostEntity> {
		const { _count, ...post } = await this.prisma.post.findUniqueOrThrow({
			where: {
				id,
			},
			include: {
				_count: {
					select: {
						likes: true,
					},
				},
			},
		});

		return {
			...post,
			likes: _count.likes,
		};
	}

	async createLike(id: number, user: User): Promise<void> {
		await this.prisma.like.create({
			data: {
				userId: user.id,
				postId: id,
			},
		});
	}

	async removeLike(id: number, user: User): Promise<void> {
		await this.prisma.like.delete({
			where: {
				userId_postId: {
					userId: user.id,
					postId: id,
				},
			},
		});
	}
}
