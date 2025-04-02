import { HttpStatus } from '@nestjs/common';
import { origins } from '@config/cors/cors.origins';

export const corsOptions = {
	origin: origins.filter((origin) => origin !== undefined),
	methods: ['GET', 'POST', 'PATCH', 'DELETE'],
	optionsSuccessStatus: HttpStatus.NO_CONTENT,
	credentials: true,
};
