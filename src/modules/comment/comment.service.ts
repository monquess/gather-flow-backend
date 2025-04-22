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
				skip: (page - 1) * limit,
				take: limit,
				include: {
					_count: {
						select: {
							replies: true,
						},
					},
				},
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

	async update(
		id: number,
		dto: UpdateCommentDto,
		user: User
	): Promise<CommentEntity> {
		const comment = await this.findById(id);

		if (comment.authorId !== user.id) {
			throw new ForbiddenException('Access denied');
		}

		return this.prisma.comment.update({
			where: {
				id,
			},
			data: dto,
		});
	}

	async remove(id: number, user: User): Promise<void> {
		const comment = await this.findById(id);

		if (comment.authorId !== user.id) {
			throw new ForbiddenException('Access denied');
		}

		await this.prisma.comment.delete({
			where: {
				id,
			},
		});
	}
}
