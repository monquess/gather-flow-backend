import { EnvironmentVariables } from '@config/env/environment-variables.config';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
	constructor(
		private readonly configService: ConfigService<EnvironmentVariables, true>
	) {
		super({
			clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
			clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
			callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
			scope: ['email', 'profile'],
		});
	}

	validate(
		_accessToken: string,
		_refreshToken: string,
		profile: Profile,
		done: VerifyCallback
	): void {
		const { emails, photos } = profile;

		if (!emails) {
			throw new BadRequestException('No email provided');
		}

		const email = emails[0].value;
		const photo = photos?.[0].value;
		const user = {
			username: email.split('@')[0],
			email,
			avatar: photo || this.configService.get<string>('DEFAULT_AVATAR_PATH'),
			verified: true,
		};

		done(null, user);
	}
}
