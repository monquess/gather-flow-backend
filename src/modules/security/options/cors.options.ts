import { HttpStatus } from '@nestjs/common';
import { CorsOptions } from 'cors';

export const origins = ['http://localhost:3000', process.env.CLIENT_URL];

export const corsOptions: CorsOptions = {
	origin: origins.filter((origin) => origin !== undefined),
	methods: ['GET', 'POST', 'PATCH', 'DELETE'],
	optionsSuccessStatus: HttpStatus.NO_CONTENT,
	credentials: true,
};
