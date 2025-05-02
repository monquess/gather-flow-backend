import { PrismaClient } from '@prisma/client';
import Seeder from './abstract.seeder';
import UserSeeder from './user.seeder';
import CompanySeeder from './company.seeder';
import CompanyMemberSeeder from './company-member.seeder';
import EventSeeder from './event.seeder';
import CommentSeeder from './comment.seeder';
import ReviewSeeder from './review.seeder';
import PostSeeder from './post.seeder';
import LikeSeeder from './like.seeder';

class DatabaseSeeder extends Seeder {
	private seeders: Seeder[];

	constructor(prisma: PrismaClient) {
		super(prisma);
		this.seeders = [
			new UserSeeder(this.prisma),
			new CompanySeeder(this.prisma),
			new PostSeeder(this.prisma),
			new LikeSeeder(this.prisma),
			new CompanyMemberSeeder(this.prisma),
			new EventSeeder(this.prisma),
			new CommentSeeder(this.prisma),
			new ReviewSeeder(this.prisma),
		];
	}

	async run(): Promise<void> {
		for (const seeder of this.seeders) {
			await seeder.run();
		}
	}
}

export default DatabaseSeeder;
