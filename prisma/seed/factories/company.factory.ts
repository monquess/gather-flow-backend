import { faker } from '@faker-js/faker';
import { Company } from '@prisma/client';
import Factory from './abstract.factory';

class CompanyFactory extends Factory<Company> {
	constructor(count: number = 10) {
		super(count);
		this.create();
	}

	create() {
		for (let i = 0; i < this._count; i++) {
			this._data.push({
				name: faker.word.noun(),
				description: faker.word.words({ count: { min: 0, max: 10 } }),
				email: faker.internet.email(),
				location: faker.location.country(),
			} as Company);
		}
	}
}

export default CompanyFactory;
