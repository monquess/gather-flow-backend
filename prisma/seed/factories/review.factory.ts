import { faker } from '@faker-js/faker';
import { Company, Review, User } from '@prisma/client';
import Factory from './abstract.factory';

class ReviewFactory extends Factory<Review> {
	private companies: Company[];
	private users: User[];
	private existingPairs: Set<string>;

	constructor(count: number = 10, companies: Company[] = [], users: User[] = []) {
		super(count);
		this.companies = companies;
		this.users = users;
		this.existingPairs = new Set();
		this.create();
	}

	create() {
		for (let i = 0; i < this._count; i++) {
			const company = faker.helpers.arrayElement(this.companies);
			const user = faker.helpers.arrayElement(this.users);

			if (!user || !company) {
				continue;
			}

			const key = `${user.id}-${company.id}`;

			if (this.existingPairs.has(key)) {
				continue;
			}

			this.existingPairs.add(key);
			this._data.push({
				companyId: company.id,
				authorId: user.id,
				comment: faker.lorem.sentences({ min: 1, max: 3 }),
				stars: faker.number.int({ min: 1, max: 5 }),
				createdAt: faker.date.between({ from: company.createdAt, to: new Date() }),
			} as Review);
		}
	}
}

export default ReviewFactory;
