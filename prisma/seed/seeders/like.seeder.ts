import { PrismaClient } from '@prisma/client';
import Seeder from './abstract.seeder';
import LikeFactory from '../factories/like.factory';

class LikeSeeder extends Seeder {
	constructor(prisma: PrismaClient) {
		super(prisma);
	}

	async run(): Promise<void> {
		const posts = await this.prisma.post.findMany();
		const users = await this.prisma.user.findMany();

		await this.prisma.like.deleteMany();

		await this.prisma.like.createMany({
			data: new LikeFactory(posts.length * 50, posts, users).data,
		});
	}
}

export default LikeSeeder;
