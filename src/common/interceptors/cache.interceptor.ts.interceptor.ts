import {
	CallHandler,
	ExecutionContext,
	Inject,
	Injectable,
	NestInterceptor,
} from '@nestjs/common';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { catchError, from, Observable, of, switchMap, tap } from 'rxjs';
import { Request } from 'express';
import * as crypto from 'crypto';
import { User } from '@prisma/client';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
	constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const request = context.switchToHttp().getRequest<Request>();

		if (request.method !== 'GET') {
			return next.handle();
		}

		const key = this.trackBy(request);

		return from(this.cache.get(key)).pipe(
			catchError(() => {
				return next.handle();
			}),
			switchMap((cached) => {
				if (cached) {
					return of(cached);
				}
				return next.handle().pipe(
					tap((response) => {
						void this.cache.set(key, response);
					})
				);
			})
		);
	}

	trackBy(request: Request): string {
		const user = request.user as User;
		const url = new URL(
			request.url,
			`${request.protocol}://${request.get('host')}`
		);
		url.searchParams.sort();
		const key = `user-${user.id}:${url.pathname}?${url.searchParams.toString()}`;

		return crypto.createHash('sha256').update(key).digest('hex');
	}
}
