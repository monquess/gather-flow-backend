import { PrismaClient } from '@prisma/client';
import Seeder from './abstract.seeder';
import PostFactory from '../factories/post.factory';

class PostSeeder extends Seeder {
	constructor(prisma: PrismaClient) {
		super(prisma);
	}

	async run(): Promise<void> {
		const companies = await this.prisma.company.findMany();

		await this.prisma.post.deleteMany();

		await this.prisma.post.createMany({
			data: new PostFactory(companies.length * 5, companies).data,
		});
	}
}

export default PostSeeder;
