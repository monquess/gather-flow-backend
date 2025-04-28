import { ApiProperty } from '@nestjs/swagger';

export class ConnectStripeResponseDto {
	@ApiProperty({
		example:
			'https://connect.stripe.com/oauth/authorize?response_type=code&client_id=ca_1234567890&scope=read_write',
		type: String,
	})
	url: string;
}
