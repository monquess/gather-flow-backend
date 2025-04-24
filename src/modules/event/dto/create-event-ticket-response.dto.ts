import { ApiProperty } from '@nestjs/swagger';

export class CreateEventTicketResponseDto {
	@ApiProperty({
		example: 'pi_21HDFSBS108U_secret_2SDF6DFX',
		type: String,
	})
	clientSecret: string;
}
