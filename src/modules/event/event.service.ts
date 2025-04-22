import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
// import { getComments } from '@prisma/client/sql';

import { PaginationOptionsDto } from '@common/pagination/pagination-options.dto';
import { Paginated } from '@common/pagination/paginated';
import { getPaginationMeta } from '@common/pagination/paginated-metadata';
import { PrismaService } from '@modules/prisma/prisma.service';
import { CommentEntity } from '@modules/comment/entities/comment.entity';
import { CreateCommentDto } from '@modules/comment/dto';

import { EventEntity } from './entities/event.entity';
import { FilteringOptionsDto } from './dto/filtering-options.dto';

@Injectable()
export class EventService {
	constructor(private readonly prisma: PrismaService) {}

	async findAll(
		{
			title,
			format,
			theme,
			visitorsVisibility,
			companyId,
			startDate,
			endDate,
		}: FilteringOptionsDto,
		{ page, limit }: PaginationOptionsDto
	): Promise<Paginated<EventEntity>> {
		const where: Prisma.EventWhereInput = {
			AND: [
				{
					title: {
						contains: title,
						mode: 'insensitive',
					},
				},
				{
					format,
				},
				{
					theme,
				},
				{
					visitorsVisibility,
				},
				{
					companyId,
				},
				{
					startDate: {
						gte: startDate,
					},
				},
				{
					endDate: {
						lte: endDate,
					},
				},
			],
		};

		const [events, count] = await this.prisma.$transaction([
			this.prisma.event.findMany({
				where,
				take: limit,
				skip: limit * (page - 1),
				orderBy: {
					createdAt: 'asc',
				},
			}),
			this.prisma.event.count({ where }),
		]);

		return {
			data: events,
			meta: getPaginationMeta(count, page, limit),
		};
	}

	async findById(id: number): Promise<EventEntity> {
		return this.prisma.event.findUniqueOrThrow({
			where: {
				id,
			},
		});
	}

	async findComments(
		eventId: number,
		{ page, limit }: PaginationOptionsDto
	): Promise<Paginated<CommentEntity>> {
		await this.findById(eventId);

		const where: Prisma.CommentWhereInput = {
			eventId,
			parent: null,
		};
		const [comments, count] = await this.prisma.$transaction([
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
			data: comments.map(({ _count, ...comment }) => ({
				...comment,
				hasReplies: _count.replies > 0,
			})),
			meta: getPaginationMeta(count, page, limit),
		};
	}

	async createComment(
		eventId: number,
		dto: CreateCommentDto,
		user: User
	): Promise<CommentEntity> {
		await this.findById(eventId);
		return this.prisma.comment.create({
			data: {
				...dto,
				eventId,
				authorId: user.id,
			},
		});
	}
}
