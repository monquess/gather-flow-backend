import { PrismaClient } from '@prisma/client';
import Seeder from './abstract.seeder';
import CompanyMemberFactory from '../factories/company-member.factory';

class CompanyMemberSeeder extends Seeder {
	constructor(prisma: PrismaClient) {
		super(prisma);
	}

	async run(): Promise<void> {
		await this.prisma.companyMember.deleteMany();

		const users = await this.prisma.user.findMany();
		const companies = await this.prisma.company.findMany();

		const companyMemberFactory = new CompanyMemberFactory(20, users, companies);

		await this.prisma.companyMember.createMany({
			data: companyMemberFactory.data,
		});
	}
}

export default CompanyMemberSeeder;
