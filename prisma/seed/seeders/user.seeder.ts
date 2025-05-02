import { PrismaClient } from '@prisma/client';
import UserFactory from '../factories/user.factory';
import Seeder from './abstract.seeder';

class UserSeeder extends Seeder {
	constructor(prisma: PrismaClient) {
		super(prisma);
	}

	async run(): Promise<void> {
		await this.prisma.user.deleteMany();

		await this.prisma.user.createMany({
			data: new UserFactory(20).data,
		});
	}
}

export default UserSeeder;
