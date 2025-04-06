import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import * as path from 'path';

import { MailOptions } from '@modules/mail/interfaces/mail-options.interface';
import { AppConfig } from '@modules/config/env/app.config';
import { ConfigFactory } from './abstract-config.factory';

@Injectable()
export class MailConfigFactory implements ConfigFactory<MailOptions> {
	constructor(private readonly configService: ConfigService<AppConfig, true>) {}

	createOptions(): MailOptions {
		return {
			transport: {
				host: this.configService.get<string>('MAIL_HOST'),
				port: this.configService.get<number>('MAIL_PORT'),
				auth: {
					user: this.configService.get<string>('MAIL_USERNAME'),
					pass: this.configService.get<string>('MAIL_PASSWORD'),
				},
			},
			defaults: {
				from: {
					name: this.configService.get<string>('MAIL_FROM_NAME'),
					address: this.configService.get<string>('MAIL_FROM_ADDRESS'),
				},
			},
			template: {
				dir: path.join(process.cwd(), 'src', 'modules', 'mail', 'templates'),
			},
		};
	}
}
