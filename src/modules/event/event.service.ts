import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
// import { getComments } from '@prisma/client/sql';

import { PaginationOptionsDto } from '@common/pagination/pagination-options.dto';
import { Paginated } from '@common/pagination/paginated';
import { getPaginationMeta } from '@common/pagination/paginated-metadata';
import { PrismaService } from '@modules/prisma/prisma.service';
import { CommentEntity } from '@modules/comment/entities/comment.entity';
import { CreateCommentDto } from '@modules/comment/dto';
import { Injectable } from '@nestjs/common';
import { EventStatus } from '@prisma/client';

import { PaginationOptionsDto, Paginated, getPaginationMeta } from '@common/pagination';
import { PrismaService } from '@modules/prisma/prisma.service';
import { EventSearchService } from '@modules/search/event-search.service';

import { EventEntity } from './entities/event.entity';
import { EventFilteringOptionsDto } from './dto/filtering-options.dto';

@Injectable()
export class EventService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly searchService: EventSearchService
	) {}

	async index(): Promise<void> {
		const events = await this.prisma.event.findMany();
		console.log(events.length);
		await this.searchService.indexBulk(events);
	}

	async findById(id: number): Promise<EventEntity> {
		return this.prisma.event.findUniqueOrThrow({
			where: {
				id,
			},
		});
	}

	async findAll(
		options: EventFilteringOptionsDto,
		{ page, limit }: PaginationOptionsDto
	): Promise<Paginated<EventEntity>> {
		const [events, count] = await this.searchService.search(
			{ ...options, status: EventStatus.PUBLISHED },
			page,
			limit
		);

		const ids = events.map((event) => event.id);
		const result = await this.prisma.event.findMany({
			where: {
				id: {
					in: ids,
				},
			},
		});

		return {
			data: ids
				.map((id) => result.find((e) => e.id === id))
				.filter((e) => e !== undefined),
			meta: getPaginationMeta(count, page, limit),
		};
	}

	async findSimilar(id: number, limit: number): Promise<EventEntity[]> {
		const event = await this.findById(id);
		const similar = await this.searchService.similar(event.id.toString(), limit);

		const ids = similar.map((event) => event.id);
		const events = await this.prisma.event.findMany({
			where: {
				id: {
					in: ids,
				},
			},
		});

		return ids
			.map((id) => events.find((e) => e.id === id))
			.filter((e) => e !== undefined);
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
