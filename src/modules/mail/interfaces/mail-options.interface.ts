import { Transport, TransportOptions } from 'nodemailer';
import JSONTransport from 'nodemailer/lib/json-transport';
import SendmailTransport from 'nodemailer/lib/sendmail-transport';
import SESTransport from 'nodemailer/lib/ses-transport';
import SMTPPool from 'nodemailer/lib/smtp-pool';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import StreamTransport from 'nodemailer/lib/stream-transport';

export type Options =
	| SMTPPool.Options
	| SMTPTransport.Options
	| SendmailTransport.Options
	| StreamTransport.Options
	| JSONTransport.Options
	| SESTransport.Options
	| TransportOptions;

export type TransportType =
	| Options
	| SMTPPool
	| SMTPTransport
	| SendmailTransport
	| StreamTransport
	| JSONTransport
	| SESTransport
	| Transport
	| string;

export interface MailOptions {
	transport: TransportType;
	defaults: Options;
	template: {
		dir: string;
	};
}
