import { PrismaService } from '@modules/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CompanyEntity } from './entities/company.entity';
import { FilteringOptionsDto } from './dto/filtering-options.dto';
import { getPaginationMeta } from '@common/pagination/paginated-metadata';
import { PaginationOptionsDto } from '@common/pagination/pagination-options.dto';
import { Paginated } from '@common/pagination/paginated';
import { Prisma, User } from '@prisma/client';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompanyService {
	constructor(private readonly prisma: PrismaService) {}

	async findAll(
		{ name }: FilteringOptionsDto,
		{ page, limit }: PaginationOptionsDto
	): Promise<Paginated<CompanyEntity>> {
		const where: Prisma.CompanyWhereInput = {
			name: {
				contains: name,
				mode: 'insensitive',
			},
		};

		const [companies, count] = await this.prisma.$transaction([
			this.prisma.company.findMany({
				where,
				take: limit,
				skip: limit * (page - 1),
				orderBy: { createdAt: 'asc' },
			}),
			this.prisma.company.count({ where }),
		]);

		return {
			data: companies,
			meta: getPaginationMeta(count, page, limit),
		};
	}

	async findById(id: number) {
		return this.prisma.company.findUniqueOrThrow({ where: { id } });
	}

	async create(dto: CreateCompanyDto, user: User) {
		return this.prisma.company.create({
			data: dto, // add as company member
		});
	}

	async update(id: number, dto: UpdateCompanyDto, user: User) {
		// check user membership
		return this.prisma.company.update({
			data: dto,
			where: {
				id,
			},
		});
	}

	async remove(id: number, user: User) {
		// check user membership
		await this.prisma.company.delete({ where: { id } });
	}
}
