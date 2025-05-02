import { ApiProperty } from '@nestjs/swagger';

export class TicketPdfDto {
	@ApiProperty({
		type: String,
		example: 'ticket.pdf',
	})
	filename: string;

	@ApiProperty({
		type: String,
		example: 'application/pdf',
		format: 'base64',
	})
	content: string;

	@ApiProperty({
		type: String,
		example: 'application/pdf',
		format: 'base64',
	})
	encoding: string;
}
