import { Paginated } from '@common/pagination/paginated';
import { PaginationOptionsDto } from '@common/pagination/pagination-options.dto';
import { PrismaService } from '@modules/prisma/prisma.service';
import { Inject, Injectable } from '@nestjs/common';
import { TicketEntity } from './entities/ticket.entity';
import { getPaginationMeta } from '@common/pagination/paginated-metadata';
import { Prisma, User } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import * as PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';
import { TicketPdfDto } from './dto/ticket-pdf.dto';
import { AppConfig, appConfig } from '@modules/config/configs';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class TicketService {
	constructor(
		private readonly prisma: PrismaService,
		@Inject(appConfig.KEY)
		private readonly appConfig: ConfigType<AppConfig>
	) {}

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

	async getTicketPdf(id: number, user: User): Promise<TicketPdfDto> {
		await this.findById(id, user);

		return this.generateTicketPdf(id);
	}

	async generateTicketPdf(ticketId: number): Promise<TicketPdfDto> {
		const ticket = await this.prisma.ticket.findUniqueOrThrow({
			where: { id: ticketId },
			include: {
				event: true,
			},
		});
		const event = ticket.event;
		const qrCodeData = `${this.appConfig.clientUrl}/events/${event.id}`;
		const qrCodeImage = await QRCode.toDataURL(qrCodeData);
		const qrCodeBuffer = Buffer.from(qrCodeImage.split(',')[1], 'base64');

		return new Promise((resolve) => {
			const doc = new PDFDocument({
				size: 'A4',
			});
			const buffers: Buffer[] = [];

			doc.on('data', buffers.push.bind(buffers));
			doc.on('end', () => {
				const pdfData = Buffer.concat(buffers);
				resolve({
					filename: `${ticket.ticketCode}.pdf`,
					content: pdfData.toString('base64'),
					encoding: 'base64',
				});
			});

			const startY = 100;
			const labelX = 70;
			const valueX = 200;
			const lineHeight = 100;

			doc.font('Helvetica-Bold').fontSize(20).fillColor('#4a4a4a');

			doc.text('EVENT', labelX, startY);
			doc.text('LOCATION', labelX, startY + lineHeight);

			doc.text('TICKET CODE', valueX + 100, startY);
			doc.text('DATE', valueX + 100, startY + lineHeight);

			doc.font('Helvetica').fontSize(18).fillColor('#6e6e6e');

			doc.text(event.title, labelX, startY + 20);
			doc.text(event.location, labelX, startY + lineHeight + 20);

			doc.text(ticket.ticketCode, valueX + 100, startY + 20);
			doc.text(
				`${event.startDate.toLocaleDateString()} ${event.startDate.toLocaleTimeString()}`,
				valueX + 100,
				startY + lineHeight + 20
			);

			doc.image(qrCodeBuffer, doc.page.width - 200, doc.page.height - 200, {
				width: 150,
			});

			doc.end();
		});
	}

	generateTicketCode(): string {
		return `TICKET-${uuidv4()}`;
	}
}
