import { PrismaClient } from '@prisma/client';

abstract class Seeder {
	protected prisma: PrismaClient;

	constructor(prisma: PrismaClient) {
		this.prisma = prisma;
	}

	abstract run(): Promise<void>;
}

export default Seeder;
