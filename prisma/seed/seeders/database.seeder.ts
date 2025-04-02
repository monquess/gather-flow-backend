import { PrismaClient } from '@prisma/client';
import Seeder from './abstract.seeder';
import UserSeeder from './user.seeder';

class DatabaseSeeder extends Seeder {
	private seeders: Seeder[];

	constructor(prisma: PrismaClient) {
		super(prisma);
		this.seeders = [new UserSeeder(this.prisma)];
	}

	async run(): Promise<void> {
		for (const seeder of this.seeders) {
			await seeder.run();
		}
	}
}

export default DatabaseSeeder;
