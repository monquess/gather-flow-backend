import { PaginationOptionsDto } from '@common/pagination/pagination-options.dto';
import { PrismaService } from '@modules/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CompanyRole, EventStatus, Prisma, User } from '@prisma/client';

import { Paginated } from '@common/pagination/paginated';
import { getPaginationMeta } from '@common/pagination/paginated-metadata';

import { EventEntity } from './entities/event.entity';
import { FilteringOptionsDto } from './dto/filtering-options.dto';
import { EventSearchService } from '@modules/search/event-search.service';

@Injectable()
export class EventService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly searchService: EventSearchService
	) {}

	async findAll(
		options: FilteringOptionsDto,
		{ page, limit }: PaginationOptionsDto,
		user: User
	): Promise<Paginated<EventEntity>> {
		const events = await this.searchService.search(options, page, limit);
		const where: Prisma.EventWhereInput = {
			id: {
				in: events.map((event) => event.id),
			},
			OR: [
				{
					company: {
						users: {
							some: {
								userId: user.id,
								role: CompanyRole.ADMIN,
							},
						},
					},
					status: options.status,
				},
				{
					status: EventStatus.PUBLISHED,
				},
			],
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
