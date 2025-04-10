import { Paginated } from '@common/pagination/paginated';
import { PaginationOptionsDto } from '@common/pagination/pagination-options.dto';
import { PrismaService } from '@modules/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { TicketEntity } from './entities/ticket.entity';
import { getPaginationMeta } from '@common/pagination/paginated-metadata';
import { Prisma, User } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TicketService {
	constructor(private readonly prisma: PrismaService) {}

	async findAll(
		{ page, limit }: PaginationOptionsDto,
		user: User
	): Promise<Paginated<TicketEntity>> {
		const where: Prisma.TicketWhereInput = {
			userId: user.id,
		};

		const [tickets, count] = await this.prisma.$transaction([
			this.prisma.ticket.findMany({
				where,
				take: limit,
				skip: limit * (page - 1),
				orderBy: { createdAt: 'asc' },
			}),
			this.prisma.ticket.count({ where }),
		]);

		return {
			data: tickets,
			meta: getPaginationMeta(count, page, limit),
		};
	}

	async findById(id: number, user: User): Promise<TicketEntity> {
		return this.prisma.ticket.findUniqueOrThrow({
			where: {
				id,
				userId: user.id,
			},
		});
	}

	generateTicketCode(): string {
		return `TICKET-${uuidv4()}`;
	}
}
