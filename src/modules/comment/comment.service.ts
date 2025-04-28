import { ForbiddenException, Injectable } from '@nestjs/common';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentEntity } from './entities/comment.entity';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '@modules/prisma/prisma.service';
import { getPaginationMeta } from '@common/pagination/paginated-metadata';
import { Paginated } from '@common/pagination/paginated';
import { PaginationOptionsDto } from '@common/pagination/pagination-options.dto';

@Injectable()
export class CommentService {
	constructor(private readonly prisma: PrismaService) {}

	async findById(id: number): Promise<CommentEntity> {
		return this.prisma.comment.findUniqueOrThrow({
			where: {
				id,
			},
			include: {
				author: {
					select: {
						id: true,
						username: true,
						avatar: true,
					},
				},
				_count: {
					select: {
						replies: true,
					},
				},
			},
			omit: {
				authorId: true,
			},
		});
	}

	async findReplies(
		id: number,
		{ page, limit }: PaginationOptionsDto
	): Promise<Paginated<CommentEntity>> {
		await this.findById(id);

		const where: Prisma.CommentWhereInput = {
			parentId: id,
		};
		const [replies, count] = await this.prisma.$transaction([
			this.prisma.comment.findMany({
				where,
				include: {
					author: {
						select: {
							id: true,
							username: true,
							avatar: true,
						},
					},
					_count: {
						select: {
							replies: true,
						},
					},
				},
				omit: {
					authorId: true,
				},
				skip: (page - 1) * limit,
				take: limit,
			}),
			this.prisma.comment.count({ where }),
		]);

		return {
			data: replies.map(({ _count, ...comment }) => ({
				...comment,
				hasReplies: _count.replies > 0,
			})),
			meta: getPaginationMeta(count, page, limit),
		};
	}

	async update(id: number, dto: UpdateCommentDto, user: User): Promise<CommentEntity> {
		await this.checkCommentOwnership(id, user);

		return this.prisma.comment.update({
			where: {
				id,
			},
			data: dto,
			include: {
				author: {
					select: {
						id: true,
						username: true,
						avatar: true,
					},
				},
			},
			omit: {
				authorId: true,
			},
		});
	}

	async remove(id: number, user: User): Promise<void> {
		await this.checkCommentOwnership(id, user);

		await this.prisma.comment.delete({
			where: {
				id,
			},
		});
	}

	private async checkCommentOwnership(id: number, user: User): Promise<void> {
		const comment = await this.findById(id);

		if (comment.author.id !== user.id) {
			throw new ForbiddenException('Access denied');
		}
	}
}
