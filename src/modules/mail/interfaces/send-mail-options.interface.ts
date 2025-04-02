export interface SendMailOptions {
	to: string;
	subject: string;
	templateName: string;
	context?: Record<string, unknown>;
}
