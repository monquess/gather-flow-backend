import { PrismaClient } from '@prisma/client';
import Seeder from './abstract.seeder';
import UserSeeder from './user.seeder';
import CompanySeeder from './company.seeder';
import CompanyMemberSeeder from './company-member.seeder';

class DatabaseSeeder extends Seeder {
	private seeders: Seeder[];

	constructor(prisma: PrismaClient) {
		super(prisma);
		this.seeders = [
			new UserSeeder(this.prisma),
			new CompanySeeder(this.prisma),
			new CompanyMemberSeeder(this.prisma),
		];
	}

	async run(): Promise<void> {
		for (const seeder of this.seeders) {
			await seeder.run();
		}
	}
}

export default DatabaseSeeder;
