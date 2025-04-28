import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';

import { authConfig, AuthConfig } from '@modules/config/configs';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
	constructor(
		@Inject(authConfig.KEY)
		private readonly config: ConfigType<AuthConfig>
	) {
		super({
			clientID: config.google.clientId,
			clientSecret: config.google.clientSecret,
			callbackURL: config.google.callbackUrl,
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
			avatar: photo,
			verified: true,
		};

		done(null, user);
	}
}
