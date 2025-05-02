import {
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Post,
	Query,
	RawBodyRequest,
	Req,
	Res,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { Public } from '@common/decorators/public.decorator';
import { ConfigService } from '@nestjs/config';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { ConnectStripeResponseDto } from './dto/connect-stripe-response.dto';
import { Response } from 'express';

@Controller('payments')
export class PaymentController {
	constructor(
		private readonly stripeService: StripeService,
		private readonly configService: ConfigService
	) {}

	@Public()
	@Post('webhooks/stripe')
	handleStripeWebhook(@Req() req: RawBodyRequest<Request>): Promise<void> {
		return this.stripeService.handleStripeWebhook(req);
	}

	@Get('connect-stripe/:companyId')
	redirectToStripeConnect(
		@Param('companyId', ParseIntPipe) companyId: number,
		@CurrentUser() user: User
	): Promise<ConnectStripeResponseDto> {
		return this.stripeService.getStripeConnectUrl(companyId, user);
	}

	@Public()
	@Get('stripe-callback')
	handleStripeCallback(
		@Res({ passthrough: true }) res: Response,
		@Query('code') code: string,
		@Query('state', ParseIntPipe) companyId: number
	): Promise<void> {
		return this.stripeService.handleStripeOAuthCallback(res, code, companyId);
	}
}
