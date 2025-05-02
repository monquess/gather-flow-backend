import { faker } from '@faker-js/faker';
import { Company, Post } from '@prisma/client';
import Factory from './abstract.factory';

class PostFactory extends Factory<Post> {
	private companies: Company[];

	constructor(count: number = 10, companies: Company[] = []) {
		super(count);
		this.companies = companies;
		this.create();
	}

	create() {
		const company = faker.helpers.arrayElement(this.companies);

		for (let i = 0; i < this._count; i++) {
			this._data.push({
				title: faker.lorem.words({ min: 1, max: 5 }),
				content: faker.lorem.paragraphs({ min: 1, max: 3 }),
				poster: faker.image.urlPicsumPhotos({ width: 600, height: 800 }),
				companyId: company.id,
				createdAt: faker.date.between({ from: company.createdAt, to: new Date() }),
			} as Post);
		}
	}
}

export default PostFactory;
