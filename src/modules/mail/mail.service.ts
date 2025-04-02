import {
	Inject,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import * as handlebars from 'handlebars';
import * as path from 'path';
import * as fs from 'node:fs';
import { MailOptions } from './interfaces/mail-options.interface';
import { MODULE_OPTIONS_TOKEN } from './mail.module-definition';
import { SendMailOptions } from './interfaces/send-mail-options.interface';

@Injectable()
export class MailService {
	private transporter: Transporter;

	constructor(
		@Inject(MODULE_OPTIONS_TOKEN) private readonly mailOptions: MailOptions
	) {
		this.transporter = createTransport(
			mailOptions.transport,
			mailOptions.defaults
		);
	}

	private renderTemplate(
		templateName: string,
		context?: Record<string, unknown>
	): string {
		const templatePath = path.join(
			this.mailOptions.template.dir,
			`${templateName}.hbs`
		);

		if (!fs.existsSync(templatePath)) {
			throw new InternalServerErrorException();
		}

		const template = fs.readFileSync(templatePath, 'utf-8');

		return handlebars.compile(template)(context);
	}

	async sendMail({ to, subject, templateName, context }: SendMailOptions) {
		const html = this.renderTemplate(templateName, context);

		await this.transporter.sendMail({
			to,
			subject,
			html,
		});
	}
}
