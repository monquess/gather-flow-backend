import { EventStatus, PrismaClient } from '@prisma/client';
import Seeder from './abstract.seeder';
import CommentFactory from '../factories/comment.factory';

class CommentSeeder extends Seeder {
	constructor(prisma: PrismaClient) {
		super(prisma);
	}

	async run(): Promise<void> {
		const events = await this.prisma.event.findMany({
			where: { status: EventStatus.PUBLISHED },
		});
		const users = await this.prisma.user.findMany();

		await this.prisma.comment.deleteMany();

		await this.prisma.comment.createMany({
			data: new CommentFactory(50, events, users).data,
		});
	}
}

export default CommentSeeder;
