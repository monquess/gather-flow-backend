import { ApiProperty } from '@nestjs/swagger';
import { PaginatedMetadata } from './paginated-metadata';

export class Paginated<T> {
	@ApiProperty()
	data: T[];

	@ApiProperty()
	meta: PaginatedMetadata;
}
