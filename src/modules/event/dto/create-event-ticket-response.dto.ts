import { ApiProperty } from '@nestjs/swagger';

export class CreateEventTicketResponseDto {
	@ApiProperty({
		example: '"https://checkout.stripe.com/c/pay/a1tNQAEUd7FcHu',
		type: String,
	})
	checkoutUrl: string | null;

	@ApiProperty({
		example: 'a1tNQAEUd7FcHu',
		type: String,
	})
	sessionId: string;
}
