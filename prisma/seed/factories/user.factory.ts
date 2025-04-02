import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcryptjs';
import { User } from '@prisma/client';
import Factory from './abstract.factory';

class UserFactory extends Factory<User> {
	constructor(count: number = 10) {
		super(count);
		this.create();
	}

	create() {
		for (let i = 0; i < this._count; i++) {
			this._data.push({
				username: faker.internet.username(),
				email: faker.internet.email(),
				password: bcrypt.hashSync('password', 10),
				verified: faker.datatype.boolean(0.75),
				avatar: process.env.DEFAULT_AVATAR_PATH,
			} as User);
		}
	}
}

export default UserFactory;
