import {
	PipeTransform,
	Injectable,
	ArgumentMetadata,
	InternalServerErrorException,
} from '@nestjs/common';
import * as sharp from 'sharp';

@Injectable()
export class ImageTransformPipe
	implements
		PipeTransform<Express.Multer.File, Promise<Express.Multer.File | undefined>>
{
	async transform(
		image: Express.Multer.File | undefined,
		_metadata: ArgumentMetadata
	): Promise<Express.Multer.File | undefined> {
		if (!image) {
			return undefined;
		}

		try {
			const buffer = await sharp(image.buffer)
				.resize({
					width: 400,
					height: 400,
					fit: sharp.fit.cover,
				})
				.webp({ effort: 3, lossless: true })
				.toBuffer();

			return {
				...image,
				buffer: buffer,
				mimetype: 'image/webp',
				size: buffer.length,
				originalname: image.originalname.replace(/\.\w+$/, '.webp'),
			};
		} catch (error) {
			throw new InternalServerErrorException(error);
		}
	}
}
