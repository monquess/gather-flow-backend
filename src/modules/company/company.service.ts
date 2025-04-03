import { PrismaService } from '@modules/prisma/prisma.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { CompanyEntity } from './entities/company.entity';
import { FilteringOptionsDto } from './dto/filtering-options.dto';
import { getPaginationMeta } from '@common/pagination/paginated-metadata';
import { PaginationOptionsDto } from '@common/pagination/pagination-options.dto';
import { Paginated } from '@common/pagination/paginated';
import { CompanyRole, Prisma, User } from '@prisma/client';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CreateCompanyMemberDto } from './dto/create-company-member.dto';
import { UserService } from '@modules/user/user.service';
import { CompanyMemberEntity } from './entities/company-member.entity';
import { UpdateCompanyMemberRoleDto } from './dto/update-company-member-role.dto';

@Injectable()
export class CompanyService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly userService: UserService
	) {}

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
				include: {
					users: true,
				},
			}),
			this.prisma.company.count({ where }),
		]);

		return {
			data: companies,
			meta: getPaginationMeta(count, page, limit),
		};
	}

	async findById(id: number): Promise<CompanyEntity> {
		return this.prisma.company.findUniqueOrThrow({
			where: { id },
			include: {
				users: true,
			},
		});
	}

	async create(dto: CreateCompanyDto, user: User): Promise<CompanyEntity> {
		return this.prisma.company.create({
			data: {
				...dto,
				users: {
					create: {
						userId: user.id,
						role: CompanyRole.ADMIN,
					},
				},
			},
		});
	}

	async createCompanyMember(
		companyId: number,
		targetUserId: number,
		{ role }: CreateCompanyMemberDto,
		user: User
	): Promise<CompanyMemberEntity> {
		const company = await this.findById(companyId);

		const currentUserMembership = company.users?.find(
			(u) => u.userId === user.id
		);

		if (
			!currentUserMembership ||
			currentUserMembership.role !== CompanyRole.ADMIN
		) {
			throw new ForbiddenException('Access denied');
		}

		return this.prisma.companyMember.create({
			data: {
				companyId,
				userId: targetUserId,
				role,
			},
		});
	}

	async update(
		id: number,
		dto: UpdateCompanyDto,
		user: User
	): Promise<CompanyEntity> {
		const company = await this.findById(id);

		const membership = company.users?.find((u) => u.userId === user.id);

		if (!membership || membership.role !== CompanyRole.ADMIN) {
			throw new ForbiddenException('Access denied');
		}

		return this.prisma.company.update({
			data: dto,
			where: {
				id,
			},
		});
	}

	async updateCompanyMemberRole(
		companyId: number,
		targetUserId: number,
		{ role }: UpdateCompanyMemberRoleDto,
		user: User
	): Promise<CompanyMemberEntity> {
		const company = await this.findById(companyId);

		const currentUserMembership = company.users?.find(
			(u) => u.userId === user.id
		);

		if (
			!currentUserMembership ||
			currentUserMembership.role !== CompanyRole.ADMIN
		) {
			throw new ForbiddenException('Access denied');
		}

		return this.prisma.companyMember.update({
			where: {
				userId_companyId: {
					userId: targetUserId,
					companyId,
				},
			},
			data: {
				role,
			},
		});
	}

	async remove(id: number, user: User): Promise<void> {
		const company = await this.findById(id);

		const membership = company.users?.find((u) => u.userId === user.id);

		if (!membership || membership.role !== CompanyRole.ADMIN) {
			throw new ForbiddenException('Access denied');
		}

		await this.prisma.company.delete({ where: { id } });
	}

	async removeCompanyMember(
		companyId: number,
		targetUserId: number,
		user: User
	): Promise<void> {
		const company = await this.findById(companyId);

		const currentUserMembership = company.users?.find(
			(u) => u.userId === user.id
		);

		if (
			currentUserMembership?.role !== CompanyRole.ADMIN &&
			user.id !== targetUserId
		) {
			// can't delete members except yourself if you are not admin
			throw new ForbiddenException('Access denied');
		}

		await this.prisma.companyMember.delete({
			where: {
				userId_companyId: {
					userId: targetUserId,
					companyId,
				},
			},
		});
	}
}
