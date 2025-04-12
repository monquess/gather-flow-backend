import { Injectable } from '@nestjs/common';
import { EventStatus, Prisma } from '@prisma/client';

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

	async findAll(
		options: EventFilteringOptionsDto,
		{ page, limit }: PaginationOptionsDto
	): Promise<Paginated<EventEntity>> {
		const events = await this.searchService.search(
			{ ...options, status: EventStatus.PUBLISHED },
			page,
			limit
		);
		const where: Prisma.EventWhereInput = {
			id: {
				in: events.map((event) => event.id),
			},
		};

		const [result, count] = await this.prisma.$transaction([
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
			data: result,
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
}
