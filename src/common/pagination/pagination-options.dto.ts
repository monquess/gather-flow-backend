import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class PaginationOptionsDto {
	@Type(() => Number)
	@IsNumber()
	@IsPositive()
	@IsOptional()
	page: number = 1;

	@Type(() => Number)
	@IsNumber()
	@IsPositive()
	@IsOptional()
	limit: number = 15;
}
