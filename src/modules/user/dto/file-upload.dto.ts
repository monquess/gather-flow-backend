import { ApiProperty } from '@nestjs/swagger';

export class FileUploadDto {
	@ApiProperty({
		type: String,
		format: 'binary',
	})
	readonly file: Express.Multer.File;
}
