import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';

export class IdsQueryDto {
	@ApiProperty({
		type: String,
		example: '1,2,3',
		description: 'Comma-separated list of IDs',
	})
	@Transform(({ value }: { value: string }) => value.split(',').map((id) => Number(id)))
	@IsNotEmpty()
	@IsInt({ each: true, message: 'Each ID must be an integer' })
	readonly ids: number[];
}
