import {
	CallHandler,
	ExecutionContext,
	Inject,
	Injectable,
	NestInterceptor,
} from '@nestjs/common';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { catchError, from, map, Observable, of, switchMap } from 'rxjs';
import { Request } from 'express';

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
			catchError(() => next.handle()),
			switchMap((cached) => {
				if (cached) {
					return of(cached);
				}
				return next
					.handle()
					.pipe(
						switchMap((response) =>
							from(this.cache.set(key, response)).pipe(map((): any => response))
						)
					);
			})
		);
	}

	trackBy(request: Request): string {
		const url = new URL(
			request.url,
			`${request.protocol}://${request.get('host')}`
		);
		url.searchParams.sort();

		return `${url.pathname}?${url.searchParams.toString()}`;
	}
}
