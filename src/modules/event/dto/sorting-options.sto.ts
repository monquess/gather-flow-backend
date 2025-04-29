import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';

import { SortOrder } from '@common/enum/sort-order.enum';
import { SortFields } from '../enum/sort-fields.enum';

export class EventSortingOptionsDto {
	@ApiProperty({
		type: String,
		enum: SortFields,
		example: SortFields.PRICE,
		default: SortFields.PUBLISHED,
		required: false,
	})
	@IsOptional()
	@IsEnum(SortFields)
	sort: SortFields = SortFields.PUBLISHED;

	@ApiProperty({
		type: String,
		enum: SortOrder,
		example: SortOrder.ASC,
		default: SortOrder.DESC,
		required: false,
	})
	@IsOptional()
	@IsEnum(SortOrder)
	order: SortOrder = SortOrder.DESC;
}
