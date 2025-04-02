import {
	Injectable,
	CanActivate,
	ExecutionContext,
	ForbiddenException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { EnvironmentVariables } from '@config/env/environment-variables.config';

interface RecaptchaResponse {
	success: boolean;
}

@Injectable()
export class RecaptchaGuard implements CanActivate {
	private readonly url = 'https://www.google.com/recaptcha/api/siteverify';

	constructor(
		private readonly configService: ConfigService<EnvironmentVariables, true>,
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
					secret: this.configService.get<string>('GOOGLE_RECAPTCHA_SECRET_KEY'),
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
