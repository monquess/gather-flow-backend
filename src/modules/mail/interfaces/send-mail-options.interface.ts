import { Attachment } from 'nodemailer/lib/mailer';

export interface SendMailOptions {
	to: string;
	subject: string;
	templateName: string;
	context?: Record<string, unknown>;
	attachments?: Attachment[];
}
