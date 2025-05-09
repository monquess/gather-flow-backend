import { PrismaClient } from '@prisma/client';
import Seeder from './abstract.seeder';
import EventFactory from '../factories/event.factory';

class EventSeeder extends Seeder {
	constructor(prisma: PrismaClient) {
		super(prisma);
	}

	async run(): Promise<void> {
		const companies = await this.prisma.company.findMany();
		const users = await this.prisma.user.findMany();

		await this.prisma.event.deleteMany();

		await this.prisma.event.createMany({
			data: new EventFactory(companies.length * 5, companies, users).data,
		});
	}
}

export default EventSeeder;
