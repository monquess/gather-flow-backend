import { PrismaClient } from '@prisma/client';
import Seeder from './abstract.seeder';
import CompanyFactory from '../factories/company.factory';

class CompanySeeder extends Seeder {
	constructor(prisma: PrismaClient) {
		super(prisma);
	}

	async run(): Promise<void> {
		await this.prisma.company.deleteMany();

		await this.prisma.company.createMany({
			data: new CompanyFactory(20).data,
		});
	}
}

export default CompanySeeder;
