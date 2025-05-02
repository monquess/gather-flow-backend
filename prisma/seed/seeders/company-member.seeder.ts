import { PrismaClient } from '@prisma/client';
import Seeder from './abstract.seeder';
import CompanyMemberFactory from '../factories/company-member.factory';

class CompanyMemberSeeder extends Seeder {
	constructor(prisma: PrismaClient) {
		super(prisma);
	}

	async run(): Promise<void> {
		const users = await this.prisma.user.findMany();
		const companies = await this.prisma.company.findMany();

		await this.prisma.companyMember.deleteMany();

		await this.prisma.companyMember.createMany({
			data: new CompanyMemberFactory(20, users, companies).data,
		});
	}
}

export default CompanyMemberSeeder;
