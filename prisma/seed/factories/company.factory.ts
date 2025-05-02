import { faker } from '@faker-js/faker';
import { Company, Prisma } from '@prisma/client';
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
				rating: new Prisma.Decimal(
					faker.number.float({ min: 1, max: 5, fractionDigits: 1 })
				),
				createdAt: faker.date.past({ years: 1, refDate: new Date() }),
			} as Company);
		}
	}
}

export default CompanyFactory;
