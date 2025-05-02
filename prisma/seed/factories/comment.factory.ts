import { faker } from '@faker-js/faker';
import { Comment, Event, User } from '@prisma/client';
import Factory from './abstract.factory';

class CommentFactory extends Factory<Comment> {
	private events: Event[];
	private users: User[];

	constructor(count: number = 10, events: Event[] = [], users: User[] = []) {
		super(count);
		this.events = events;
		this.users = users;
		this.create();
	}

	create() {
		const event = faker.helpers.arrayElement(this.events);
		const user = faker.helpers.arrayElement(this.users);

		for (let i = 0; i < this._count; i++) {
			this._data.push({
				content: faker.lorem.sentences({ min: 1, max: 3 }),
				eventId: event.id,
				authorId: user.id,
				createdAt: faker.date.between({ from: event.createdAt, to: new Date() }),
			} as Comment);
		}
	}
}

export default CommentFactory;
