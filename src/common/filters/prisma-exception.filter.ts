import {
	Catch,
	HttpException,
	ExceptionFilter,
	ArgumentsHost,
	HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
	catch(exception: Prisma.PrismaClientKnownRequestError, _host: ArgumentsHost) {
		let status = HttpStatus.INTERNAL_SERVER_ERROR;
		let message = 'Internal server error';
		const modelName = (exception.meta?.modelName as string) || 'Record';

		if (exception.code === 'P2002') {
			status = HttpStatus.CONFLICT;
			message = `${modelName} already exists`;
		}
		if (exception.code === 'P2025') {
			status = HttpStatus.NOT_FOUND;
			message = `${modelName} not found`;
		}

		throw new HttpException(message, status);
	}
}
