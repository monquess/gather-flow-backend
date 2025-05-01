import { PaginationOptionsDto } from '@common/pagination/pagination-options.dto';
import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { Paginated } from '@common/pagination/paginated';
import { TicketEntity } from './entities/ticket.entity';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import {
	ApiTicketFindAll,
	ApiTicketFindById,
	ApiTicketGetPdf,
} from './decorators/api-ticket.decorator';
import { TicketPdfDto } from './dto/ticket-pdf.dto';

@Controller('tickets')
export class TicketController {
	constructor(private readonly ticketService: TicketService) {}

	@ApiTicketFindAll()
	@Get()
	findAll(
		@Query() paginationOptions: PaginationOptionsDto,
		@CurrentUser() user: User
	): Promise<Paginated<TicketEntity>> {
		return this.ticketService.findAll(paginationOptions, user);
	}

	@ApiTicketFindById()
	@Get(':id')
	findById(
		@Param('id', ParseIntPipe) id: number,
		@CurrentUser() user: User
	): Promise<TicketEntity> {
		return this.ticketService.findById(id, user);
	}

	@ApiTicketGetPdf()
	@Get(':id/pdf')
	async getTicketPdf(
		@Param('id', ParseIntPipe) id: number,
		@CurrentUser() user: User
	): Promise<TicketPdfDto> {
		return this.ticketService.getTicketPdf(id, user);
	}
}
