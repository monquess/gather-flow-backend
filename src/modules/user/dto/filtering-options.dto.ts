import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class FilteringOptionsDto {
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	readonly username?: string;

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	readonly email?: string;
}
