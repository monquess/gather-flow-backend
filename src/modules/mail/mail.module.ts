import { Global, Module } from '@nestjs/common';
import { ConfigurableModuleClass } from './mail.module-definition';
import { MailService } from './mail.service';

@Global()
@Module({
	providers: [MailService],
	exports: [MailService],
})
export class MailModule extends ConfigurableModuleClass {}
