import { PrismaClient } from '@prisma/client';
import Seeder from './abstract.seeder';
import ReviewFactory from '../factories/review.factory';

class ReviewSeeder extends Seeder {
	constructor(prisma: PrismaClient) {
		super(prisma);
	}

	async run(): Promise<void> {
		const companies = await this.prisma.company.findMany();
		const users = await this.prisma.user.findMany();

		await this.prisma.review.deleteMany();

		await this.prisma.review.createMany({
			data: new ReviewFactory(50, companies, users).data,
		});
	}
}

export default ReviewSeeder;
