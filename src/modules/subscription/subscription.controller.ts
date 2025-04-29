import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseIntPipe,
	Post,
	Query,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CurrentUser, Public } from '@common/decorators';
import { CompanySubscriptionFilteringOptionsDto } from './dto/filtering-options.dto';
import { CompanySubscriptionEntity } from './entities/company-subscription.entity';
import { CreateCompanySubscriptionDto } from './dto/create-company-subscription.dto';
import { User } from '@prisma/client';

@Controller('company-subscriptions')
export class SubscriptionController {
	constructor(private readonly subscriptionService: SubscriptionService) {}

	@Public()
	@Get()
	findAll(
		@Query() filteringOptions: CompanySubscriptionFilteringOptionsDto
	): Promise<CompanySubscriptionEntity[]> {
		return this.subscriptionService.findAll(filteringOptions);
	}

	@Post()
	create(
		@Body() createCompanySubscriptionDto: CreateCompanySubscriptionDto,
		@CurrentUser() user: User
	): Promise<CompanySubscriptionEntity> {
		return this.subscriptionService.create(createCompanySubscriptionDto, user);
	}

	@HttpCode(HttpStatus.NO_CONTENT)
	@Delete(':companyId')
	remove(
		@Param('companyId', ParseIntPipe) companyId: number,
		@CurrentUser() user: User
	): Promise<void> {
		return this.subscriptionService.remove(companyId, user);
	}
}
