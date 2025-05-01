import { PrismaClient } from '@prisma/client';
import Seeder from './abstract.seeder';
import EventFactory from '../factories/event.factory';

class EventSeeder extends Seeder {
	constructor(prisma: PrismaClient) {
		super(prisma);
	}

	async run(): Promise<void> {
		await this.prisma.event.deleteMany();

		const companies = await this.prisma.company.findMany();

		const users = await this.prisma.user.findMany();

		const eventFactory = new EventFactory(20, companies, users);

		await this.prisma.event.createMany({
			data: eventFactory.data,
		});
	}
}

export default EventSeeder;
