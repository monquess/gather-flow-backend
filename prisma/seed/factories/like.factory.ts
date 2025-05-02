import { faker } from '@faker-js/faker';
import { Like, Post, User } from '@prisma/client';
import Factory from './abstract.factory';

class LikeFactory extends Factory<Like> {
	private posts: Post[];
	private users: User[];
	private existingPairs: Set<string>;

	constructor(count: number = 10, posts: Post[] = [], users: User[] = []) {
		super(count);
		this.posts = posts;
		this.users = users;
		this.existingPairs = new Set();
		this.create();
	}

	create() {
		for (let i = 0; i < this._count; i++) {
			const post = faker.helpers.arrayElement(this.posts);
			const user = faker.helpers.arrayElement(this.users);

			if (!user || !post) {
				continue;
			}

			const key = `${user.id}-${post.id}`;

			if (this.existingPairs.has(key)) {
				continue;
			}

			this.existingPairs.add(key);
			this._data.push({
				postId: post.id,
				userId: user.id,
			} as Like);
		}
	}
}

export default LikeFactory;
