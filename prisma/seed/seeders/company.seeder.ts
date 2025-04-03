import { PrismaClient } from '@prisma/client';
import Seeder from './abstract.seeder';
import CompanyFactory from '../factories/company.factory';

class CompanySeeder extends Seeder {
	constructor(prisma: PrismaClient) {
		super(prisma);
	}

	async run(): Promise<void> {
		await this.prisma.company.deleteMany();

		const companyFactory = new CompanyFactory(10);

		await this.prisma.company.createMany({
			data: companyFactory.data,
		});
	}
}

export default CompanySeeder;
