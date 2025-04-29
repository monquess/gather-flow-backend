import { PrismaService } from '@modules/prisma/prisma.service';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CompanySubscriptionFilteringOptionsDto } from './dto/filtering-options.dto';
import { CompanySubscriptionEntity } from './entities/company-subscription.entity';
import { CreateCompanySubscriptionDto } from './dto/create-company-subscription.dto';
import { User } from '@prisma/client';
import { CompanyService } from '@modules/company/company.service';

@Injectable()
export class SubscriptionService {
	constructor(
		private readonly prisma: PrismaService,
		@Inject(forwardRef(() => CompanyService))
		private readonly companyService: CompanyService
	) {}

	async findAll({
		userId,
		companyId,
	}: CompanySubscriptionFilteringOptionsDto): Promise<CompanySubscriptionEntity[]> {
		return this.prisma.companySubscription.findMany({
			where: {
				userId,
				companyId,
			},
			include: {
				user: true,
			},
		});
	}

	async create(
		{ companyId }: CreateCompanySubscriptionDto,
		user: User
	): Promise<CompanySubscriptionEntity> {
		await this.companyService.findById(companyId);

		return this.prisma.companySubscription.create({
			data: {
				userId: user.id,
				companyId,
			},
		});
	}

	async remove(companyId: number, user: User): Promise<void> {
		await this.prisma.companySubscription.deleteMany({
			where: {
				userId: user.id,
				companyId,
			},
		});
	}
}
