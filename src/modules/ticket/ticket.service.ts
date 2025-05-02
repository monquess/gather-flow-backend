import { Paginated } from '@common/pagination/paginated';
import { PaginationOptionsDto } from '@common/pagination/pagination-options.dto';
import { PrismaService } from '@modules/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { TicketEntity } from './entities/ticket.entity';
import { getPaginationMeta } from '@common/pagination/paginated-metadata';
import { Prisma, User } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import * as PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';
import { TicketPdfDto } from './dto/ticket-pdf.dto';

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
		const qrCodeData = JSON.stringify({
			ticketCode: ticket.ticketCode,
			eventId: event.id,
		});
		const qrCodeImage = await QRCode.toDataURL(qrCodeData);
		const qrCodeBuffer = Buffer.from(qrCodeImage.split(',')[1], 'base64');

		return new Promise((resolve) => {
			const doc = new PDFDocument({
				size: 'A6',
				margin: 20,
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

			doc.font('Helvetica-Bold');

			doc.fillColor('#333').fontSize(20).text(event.title, { align: 'center' });

			doc.moveDown(0.5);

			doc
				.fontSize(14)
				.text(`Date: ${event.startDate.toLocaleDateString()}`)
				.text(`Time: ${event.startDate.toLocaleTimeString()}`)
				.text(`Location: ${event.location}`)
				.text(`Ticket Code: ${ticket.ticketCode}`);

			doc
				.rect(doc.page.width - 100, doc.page.height - 100, 60, 60)
				.stroke()
				.fontSize(10)
				.text('QR Code', doc.page.width - 95, doc.page.height - 90);

			doc.image(qrCodeBuffer, doc.page.width - 100, doc.page.height - 100, {
				width: 90,
				height: 90,
			});

			doc.end();
		});
	}

	generateTicketCode(): string {
		return `TICKET-${uuidv4()}`;
	}
}
