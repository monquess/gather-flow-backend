import { PrismaClient } from '@prisma/client';
import UserFactory from '../factories/user.factory';
import Seeder from './abstract.seeder';

class UserSeeder extends Seeder {
	constructor(prisma: PrismaClient) {
		super(prisma);
	}

	async run(): Promise<void> {
		await this.prisma.user.deleteMany();

		const userFactory = new UserFactory(10);

		await this.prisma.user.createMany({
			data: userFactory.data,
		});
	}
}

export default UserSeeder;
