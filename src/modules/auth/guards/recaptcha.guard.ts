import {
	Injectable,
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Inject,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigType } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

import { authConfig, AuthConfig } from '@modules/config/configs';

interface RecaptchaResponse {
	success: boolean;
}

@Injectable()
export class RecaptchaGuard implements CanActivate {
	protected readonly url = 'https://www.google.com/recaptcha/api/siteverify';

	constructor(
		@Inject(authConfig.KEY)
		private readonly config: ConfigType<AuthConfig>,
		private readonly httpService: HttpService
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const { headers } = context.switchToHttp().getRequest<Request>();
		const captcha = headers['x-recaptcha-token'] as string;

		if (!captcha) {
			throw new ForbiddenException('Missing reCAPTCHA token');
		}

		const { data } = await firstValueFrom(
			this.httpService.post<RecaptchaResponse>(this.url, null, {
				params: {
					secret: this.config.recaptcha.secret,
					response: captcha,
				},
			})
		);

		if (!data.success) {
			throw new ForbiddenException('Invalid reCAPTCHA token');
		}

		return true;
	}
}
