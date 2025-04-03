import { faker } from '@faker-js/faker';
import { Company, CompanyMember, CompanyRole, User } from '@prisma/client';
import Factory from './abstract.factory';

class CompanyMemberFactory extends Factory<CompanyMember> {
	private users: User[];
	private companies: Company[];
	private existingPairs: Set<string>;

	constructor(
		count: number = 10,
		users: User[] = [],
		companies: Company[] = []
	) {
		super(count);
		this.users = users;
		this.companies = companies;
		this.existingPairs = new Set();
		this.create();
	}

	create() {
		for (let i = 0; i < this._count; i++) {
			const user = faker.helpers.arrayElement(this.users);
			const company = faker.helpers.arrayElement(this.companies);

			if (!user || !company) continue;

			const key = `${user.id}-${company.id}`;

			if (this.existingPairs.has(key)) continue;

			this.existingPairs.add(key);
			this._data.push({
				userId: user.id,
				companyId: company.id,
				role: faker.helpers.enumValue(CompanyRole),
			} as CompanyMember);
		}
	}
}

export default CompanyMemberFactory;
