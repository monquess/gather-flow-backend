import { ConfigurableModuleBuilder } from '@nestjs/common';
import { MailOptions } from './interfaces/mail-options.interface';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
	new ConfigurableModuleBuilder<MailOptions>()
		.setExtras(
			{
				isGlobal: false,
			},
			(definition, extras) => ({
				...definition,
				global: extras.isGlobal,
			})
		)
		.setClassMethodName('forRoot')
		.build();
