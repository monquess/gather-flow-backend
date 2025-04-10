/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '@modules/app.module';
import { swaggerConfig } from '@config/swagger.config';
import { corsOptions } from '@config/cors/cors.options';
import { HttpExceptionFilter } from '@common/filters/http-exception.filter';
import { PrismaExceptionFilter } from '@common/filters/prisma-exception.filter';
import { validationExceptionFactory } from '@common/pipes/validation/validation-exception.factory';

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule, {
		rawBody: true,
	});
	const prefix = 'api';

	app.set('trust proxy', true);
	app.setGlobalPrefix(prefix);
	app.enableVersioning({
		type: VersioningType.URI,
		defaultVersion: '1',
	});

	app.enableCors(corsOptions);

	app.use(cookieParser());
	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			whitelist: true,
			exceptionFactory: validationExceptionFactory,
		})
	);
	app.useGlobalFilters(new HttpExceptionFilter(), new PrismaExceptionFilter());

	const document = SwaggerModule.createDocument(app, swaggerConfig);
	SwaggerModule.setup(`${prefix}/docs`, app, document);

	await app.listen(process.env.PORT || 3000);
}
bootstrap();
