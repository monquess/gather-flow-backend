import {
	Body,
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
	CompanyEventFilteringOptionsDto,
	CreateCompanyDto,
	UpdateCompanyDto,
	CreateCompanyMemberDto,
	UpdateCompanyMemberRoleDto,
} from './dto';
import { CompanyEntity } from './entities/company.entity';
import { CompanyMemberEntity } from './entities/company-member.entity';

import { Public, CurrentUser } from '@common/decorators';
import { Paginated, PaginationOptionsDto } from '@common/pagination';

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
	ApiPostCreate,
	ApiPostRemove,
	ApiPostUpdate,
} from './decorators/api-company.decorator';
import { CompanyService } from './company.service';

import { CreateEventDto } from '@modules/company/dto/create-event.dto';
import { EventEntity } from '@modules/event/entities/event.entity';
import { UpdateEventDto } from '@modules/company/dto/update-event.dto';
import { CreatePostDto } from '@modules/post/dto/create-post.dto';
import { UpdatePostDto } from '@modules/post/dto/update-post.dto';
import { PostEntity } from '@modules/post/entities/post.entity';
import { UploadedImage } from '@common/decorators/uploaded-image.decorator';

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
		@Query() paginationOptions: PaginationOptionsDto,
		@CurrentUser() user: User
	): Promise<Paginated<EventEntity>> {
		return this.companyService.findEvents(id, filteringOptions, paginationOptions, user);
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

	@ApiPostCreate()
	@UseInterceptors(FileInterceptor('poster'))
	@Post(':id/posts')
	createPost(
		@Param('companyId', ParseIntPipe) companyId: number,
		@Body() dto: CreatePostDto,
		@CurrentUser() user: User,
		@UploadedImage() poster?: Express.Multer.File
	): Promise<PostEntity> {
		return this.companyService.createPost(companyId, dto, user, poster);
	}

	@ApiPostUpdate()
	@UseInterceptors(FileInterceptor('poster'))
	@Patch(':companyId/posts/:postId')
	updatePost(
		@Param('companyId', ParseIntPipe) companyId: number,
		@Param('postId', ParseIntPipe) postId: number,
		@Body() dto: UpdatePostDto,
		@CurrentUser() user: User,
		@UploadedImage() poster?: Express.Multer.File
	) {
		return this.companyService.updatePost(companyId, postId, dto, user, poster);
	}

	@ApiPostRemove()
	@HttpCode(HttpStatus.NO_CONTENT)
	@Delete(':companyId/posts/:postId')
	removePost(
		@Param('companyId', ParseIntPipe) companyId: number,
		@Param('postId', ParseIntPipe) postId: number,
		@CurrentUser() user: User
	) {
		return this.companyService.removePost(companyId, postId, user);
	}
}
