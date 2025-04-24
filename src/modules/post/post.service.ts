import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

import { PrismaService } from '@modules/prisma/prisma.service';
import { getPaginationMeta, Paginated } from '@common/pagination';

import { PostEntity } from './entities/post.entity';
import { PostSortingOptionsDto } from './dto';
import { SortFields } from './enum/sort-fields.enum';

@Injectable()
export class PostService {
	constructor(private readonly prisma: PrismaService) {}

	async findById(id: number, user?: User): Promise<PostEntity> {
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
				likes: {
					where: {
						userId: user?.id,
					},
				},
			},
		});

		return {
			...post,
			likes: _count.likes,
			liked: post.likes.length > 0,
		};
	}

	async findAll(
		{ sort, order }: PostSortingOptionsDto,
		page: number,
		limit: number,
		user?: User
	): Promise<Paginated<PostEntity>> {
		// prettier-ignore
		const orderBy =	sort === SortFields.LIKES ? { likes: { _count: order } } : { [sort]: order };

		const [posts, count] = await this.prisma.$transaction([
			this.prisma.post.findMany({
				include: {
					_count: {
						select: {
							likes: true,
						},
					},
					likes: {
						where: {
							userId: user?.id,
						},
					},
				},
				take: limit,
				skip: (page - 1) * limit,
				orderBy,
			}),
			this.prisma.post.count(),
		]);

		return {
			data: posts.map(({ _count, ...post }) => ({
				...post,
				likes: _count.likes,
				liked: post.likes.length > 0,
			})),
			meta: getPaginationMeta(count, page, limit),
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
