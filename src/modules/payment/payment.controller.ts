import { Controller, Post, RawBodyRequest, Req } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { Public } from '@common/decorators/public.decorator';

@Controller('payments')
export class PaymentController {
	constructor(private readonly stripeService: StripeService) {}

	@Public()
	@Post('webhooks/stripe')
	handleStripeWebhook(@Req() req: RawBodyRequest<Request>): Promise<void> {
		return this.stripeService.handleStripeWebhook(req);
	}
}
