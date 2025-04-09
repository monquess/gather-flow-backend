import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

import * as path from 'path';

import { MailOptions } from '@modules/mail/interfaces/mail-options.interface';
import { ConfigFactory } from '../interface/config-factory.interface';
import { mailConfig, MailConfig } from '../configs/mail.config';

@Injectable()
export class MailConfigFactory implements ConfigFactory<MailOptions> {
	constructor(
		@Inject(mailConfig.KEY)
		private readonly config: ConfigType<MailConfig>
	) {}

	createOptions(): MailOptions {
		return {
			transport: {
				host: this.config.host,
				port: this.config.port,
				...this.config.auth,
			},
			defaults: {
				from: {
					...this.config.from,
				},
			},
			template: {
				dir: path.join(process.cwd(), 'src', 'modules', 'mail', 'templates'),
			},
		};
	}
}
