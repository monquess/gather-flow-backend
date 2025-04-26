import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Query,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from '@prisma/client';

import {
	CompanyFilteringOptionsDto,
	CreateEventDto,
	UpdateEventDto,
	CompanyEventFilteringOptionsDto,
	CreateCompanyDto,
	UpdateCompanyDto,
	CreateCompanyMemberDto,
	UpdateCompanyMemberRoleDto,
	CreateReviewDto,
	UpdateReviewDto,
} from './dto';
import { CompanyEntity } from './entities/company.entity';
import { CompanyMemberEntity } from './entities/company-member.entity';

import { Public, CurrentUser, UploadedImage } from '@common/decorators';
import { Paginated, PaginationOptionsDto } from '@common/pagination';
import { CacheInterceptor } from '@common/interceptors/cache.interceptor';

import {
	ApiCompanyCreate,
	ApiCompanyFindAll,
	ApiCompanyFindById,
	ApiCompanyFindEvents,
	ApiCompanyMemberCreate,
	ApiCompanyMemberRemove,
	ApiCompanyMemberUpdateRole,
	ApiCompanyRemove,
	ApiCompanyUpdate,
	ApiEventCreate,
	ApiEventRemove,
	ApiEventUpdate,
	ApiCompanyFindPosts,
	ApiCompanyPostCreate,
	ApiCompanyPostRemove,
	ApiCompanyPostUpdate,
	ApiCompanyReviewCreate,
	ApiCompanyReviewRemove,
	ApiCompanyReviewUpdate,
	ApiCompanyFindReviews,
} from './decorators/api-company.decorator';
import { CompanyService } from './company.service';

import { EventEntity } from '@modules/event/entities/event.entity';
import { PostEntity } from '@modules/post/entities/post.entity';
import { CreatePostDto, UpdatePostDto, PostSortingOptionsDto } from '@modules/post/dto';
import { EventSortingOptionsDto } from '@modules/event/dto';
import { ReviewEntity } from './entities/review.entity';

@UseInterceptors(CacheInterceptor, ClassSerializerInterceptor)
@Controller('companies')
export class CompanyController {
	constructor(private readonly companyService: CompanyService) {}

	@ApiCompanyFindAll()
	@Public()
	@Get()
	findAll(
		@Query() filteringOptions: CompanyFilteringOptionsDto,
		@Query() paginationOptions: PaginationOptionsDto
	): Promise<Paginated<CompanyEntity>> {
		return this.companyService.findAll(filteringOptions, paginationOptions);
	}

	@ApiCompanyFindEvents()
	@Public()
	@Get(':id/events')
	findEvents(
		@Param('id', ParseIntPipe) id: number,
		@Query() filteringOptions: CompanyEventFilteringOptionsDto,
		@Query() sortingOptions: EventSortingOptionsDto,
		@Query() paginationOptions: PaginationOptionsDto,
		@CurrentUser() user: User
	): Promise<Paginated<EventEntity>> {
		return this.companyService.findEvents(
			id,
			filteringOptions,
			sortingOptions,
			paginationOptions,
			user
		);
	}

	@ApiCompanyFindById()
	@Public()
	@Get(':id')
	findById(@Param('id', ParseIntPipe) id: number): Promise<CompanyEntity> {
		return this.companyService.findById(id);
	}

	@ApiCompanyCreate()
	@Post()
	create(
		@Body() createCompanyDto: CreateCompanyDto,
		@CurrentUser() user: User
	): Promise<CompanyEntity> {
		return this.companyService.create(createCompanyDto, user);
	}

	@ApiCompanyMemberCreate()
	@Post(':companyId/users/:userId')
	createCompanyMember(
		@Param('companyId', ParseIntPipe) companyId: number,
		@Param('userId', ParseIntPipe) targetUserId: number,
		@Body() createCompanyMemberDto: CreateCompanyMemberDto,
		@CurrentUser() user: User
	): Promise<CompanyMemberEntity> {
		return this.companyService.createCompanyMember(
			companyId,
			targetUserId,
			createCompanyMemberDto,
			user
		);
	}

	@ApiEventCreate()
	@UseInterceptors(FileInterceptor('poster'))
	@Post(':companyId/events')
	createEvent(
		@Param('companyId', ParseIntPipe) companyId: number,
		@Body() createEventDto: CreateEventDto,
		@CurrentUser() user: User,
		@UploadedImage() poster?: Express.Multer.File
	): Promise<EventEntity> {
		return this.companyService.createEvent(companyId, createEventDto, user, poster);
	}

	@ApiCompanyUpdate()
	@Patch(':id')
	update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateCompanyDto: UpdateCompanyDto,
		@CurrentUser() user: User
	): Promise<CompanyEntity> {
		return this.companyService.update(id, updateCompanyDto, user);
	}

	@ApiCompanyMemberUpdateRole()
	@Patch(':companyId/users/:userId/role')
	updateCompanyMemberRole(
		@Param('companyId', ParseIntPipe) companyId: number,
		@Param('userId', ParseIntPipe) targetUserId: number,
		@Body() updateCompanyMemberRoleDto: UpdateCompanyMemberRoleDto,
		@CurrentUser() user: User
	): Promise<CompanyMemberEntity> {
		return this.companyService.updateCompanyMemberRole(
			companyId,
			targetUserId,
			updateCompanyMemberRoleDto,
			user
		);
	}

	@ApiEventUpdate()
	@UseInterceptors(FileInterceptor('poster'))
	@Patch(':companyId/events/:eventId')
	updateEvent(
		@Param('companyId', ParseIntPipe) companyId: number,
		@Param('eventId', ParseIntPipe) eventId: number,
		@Body() updateEventDto: UpdateEventDto,
		@CurrentUser() user: User,
		@UploadedImage() poster?: Express.Multer.File
	): Promise<EventEntity> {
		return this.companyService.updateEvent(
			companyId,
			eventId,
			updateEventDto,
			user,
			poster
		);
	}

	@ApiCompanyRemove()
	@HttpCode(HttpStatus.NO_CONTENT)
	@Delete(':id')
	remove(
		@Param('id', ParseIntPipe) id: number,
		@CurrentUser() user: User
	): Promise<void> {
		return this.companyService.remove(id, user);
	}

	@ApiCompanyMemberRemove()
	@HttpCode(HttpStatus.NO_CONTENT)
	@Delete(':companyId/users/:userId')
	removeCompanyMember(
		@Param('companyId', ParseIntPipe) companyId: number,
		@Param('userId', ParseIntPipe) targetUserId: number,
		@CurrentUser() user: User
	): Promise<void> {
		return this.companyService.removeCompanyMember(companyId, targetUserId, user);
	}

	@ApiEventRemove()
	@HttpCode(HttpStatus.NO_CONTENT)
	@Delete(':companyId/events/:eventId')
	removeEvent(
		@Param('companyId', ParseIntPipe) companyId: number,
		@Param('eventId', ParseIntPipe) eventId: number,
		@CurrentUser() user: User
	): Promise<void> {
		return this.companyService.removeEvent(companyId, eventId, user);
	}

	@ApiCompanyFindPosts()
	@Public()
	@Get(':companyId/posts')
	findPosts(
		@Param('companyId', ParseIntPipe) companyId: number,
		@Query() sortingOptions: PostSortingOptionsDto,
		@Query() paginationOptions: PaginationOptionsDto,
		@CurrentUser() user: User
	): Promise<Paginated<PostEntity>> {
		return this.companyService.findPosts(
			companyId,
			sortingOptions,
			paginationOptions,
			user
		);
	}

	@ApiCompanyPostCreate()
	@UseInterceptors(FileInterceptor('poster'))
	@Post(':companyId/posts')
	createPost(
		@Param('companyId', ParseIntPipe) companyId: number,
		@Body() dto: CreatePostDto,
		@CurrentUser() user: User,
		@UploadedImage() poster?: Express.Multer.File
	): Promise<PostEntity> {
		return this.companyService.createPost(companyId, dto, user, poster);
	}

	@ApiCompanyPostUpdate()
	@UseInterceptors(FileInterceptor('poster'))
	@Patch(':companyId/posts/:postId')
	updatePost(
		@Param('companyId', ParseIntPipe) companyId: number,
		@Param('postId', ParseIntPipe) postId: number,
		@Body() dto: UpdatePostDto,
		@CurrentUser() user: User,
		@UploadedImage() poster?: Express.Multer.File
	): Promise<PostEntity> {
		return this.companyService.updatePost(companyId, postId, dto, user, poster);
	}

	@ApiCompanyPostRemove()
	@HttpCode(HttpStatus.NO_CONTENT)
	@Delete(':companyId/posts/:postId')
	removePost(
		@Param('companyId', ParseIntPipe) companyId: number,
		@Param('postId', ParseIntPipe) postId: number,
		@CurrentUser() user: User
	): Promise<void> {
		return this.companyService.removePost(companyId, postId, user);
	}

	@ApiCompanyFindReviews()
	@Public()
	@Get(':companyId/reviews')
	findReviews(
		@Param('companyId', ParseIntPipe) companyId: number,
		@Query() paginationOptions: PaginationOptionsDto
	): Promise<Paginated<ReviewEntity>> {
		return this.companyService.findReviews(companyId, paginationOptions);
	}

	@ApiCompanyReviewCreate()
	@Post(':companyId/reviews')
	createReview(
		@Param('companyId', ParseIntPipe) companyId: number,
		@Body() dto: CreateReviewDto,
		@CurrentUser() user: User
	): Promise<ReviewEntity> {
		return this.companyService.createReview(companyId, dto, user);
	}

	@ApiCompanyReviewUpdate()
	@Patch(':companyId/reviews')
	createRating(
		@Param('companyId', ParseIntPipe) companyId: number,
		@Body() dto: UpdateReviewDto,
		@CurrentUser() user: User
	): Promise<ReviewEntity> {
		return this.companyService.updateReview(companyId, dto, user);
	}

	@ApiCompanyReviewRemove()
	@HttpCode(HttpStatus.NO_CONTENT)
	@Delete(':companyId/reviews')
	removeReview(
		@Param('companyId', ParseIntPipe) companyId: number,
		@CurrentUser() user: User
	): Promise<void> {
		return this.companyService.removeReview(companyId, user);
	}
}
