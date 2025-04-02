import { PrismaClient } from '@prisma/client';
import DatabaseSeeder from './seeders/database.seeder';

const prisma = new PrismaClient();

async function main() {
	const seeder = new DatabaseSeeder(prisma);
	await seeder.run();
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
