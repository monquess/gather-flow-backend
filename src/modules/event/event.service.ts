import { PaginationOptionsDto } from '@common/pagination/pagination-options.dto';
import { PrismaService } from '@modules/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { Paginated } from '@common/pagination/paginated';
import { getPaginationMeta } from '@common/pagination/paginated-metadata';

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
				orderBy: { createdAt: 'asc' },
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
			where: { id },
		});
	}
}
