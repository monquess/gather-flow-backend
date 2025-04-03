import { faker } from '@faker-js/faker';
import {
	Company,
	Event,
	Format,
	Prisma,
	Theme,
	VisitorsVisibility,
} from '@prisma/client';
import Factory from './abstract.factory';

class EventFactory extends Factory<Event> {
	private companies: Company[];

	constructor(count: number = 10, companies: Company[] = []) {
		super(count);
		this.companies = companies;
		this.create();
	}

	create() {
		for (let i = 0; i < this._count; i++) {
			const company = faker.helpers.arrayElement(this.companies);

			const startDate = faker.date.soon({ days: 30 });
			const endDate = faker.date.soon({ days: 5, refDate: startDate });
			const publishDate = faker.date.past({ years: 1, refDate: startDate });

			this._data.push({
				title: faker.lorem.words({ min: 2, max: 5 }),
				description: faker.lorem.sentences({ min: 1, max: 3 }),
				format: faker.helpers.enumValue(Format),
				theme: faker.helpers.enumValue(Theme),
				location: faker.location.country(),
				ticketPrice: new Prisma.Decimal(
					faker.finance.amount({ min: 5, max: 500, dec: 2 })
				),
				ticketsQuantity: faker.number.int({ min: 50, max: 1000 }),
				poster: faker.image.urlPicsumPhotos({ width: 600, height: 800 }),
				visitorsVisibillity: faker.helpers.enumValue(VisitorsVisibility),
				startDate,
				endDate,
				publishDate,
				companyId: company.id,
			} as Event);
		}
	}
}

export default EventFactory;
