import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { CommentController } from './comment.controller';

@Module({
	imports: [PrismaModule],
	controllers: [CommentController],
	providers: [CommentService],
	exports: [CommentService],
})
export class CommentModule {}
