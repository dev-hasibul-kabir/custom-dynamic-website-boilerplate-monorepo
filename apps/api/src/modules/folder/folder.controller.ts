import {
	UseGuards,
	Controller,
	Body,
	Post,
	HttpCode,
	HttpStatus,
	Get,
	Param,
	Delete,
	Put,
	Inject,
} from '@nestjs/common';
import { FolderService } from './folder.service';
import { ModulePermission } from '@/common/decorators';
import { PermissionGuard } from '@/common/guards';
import { CreateFolderDto, UpdateFolderDto } from './dto';

export const moduleName = 'folder';

@Controller('')
export class FolderController {
	@Inject()
	private readonly folderService: FolderService;

	@ModulePermission(moduleName, 'create')
	@UseGuards(PermissionGuard)
	@HttpCode(HttpStatus.OK)
	@Post('api/v1/folders')
	async create(@Body() dto: CreateFolderDto) {
		return await this.folderService.save(dto);
	}

	@ModulePermission(moduleName, 'read')
	@UseGuards(PermissionGuard)
	@HttpCode(HttpStatus.OK)
	@Get('api/v1/folders')
	async readAll() {
		return await this.folderService.getAll();
	}

	@ModulePermission(moduleName, 'read')
	@UseGuards(PermissionGuard)
	@HttpCode(HttpStatus.OK)
	@Get('api/v1/folders/:id')
	async readById(@Param('id') id: string) {
		return await this.folderService.getById(parseInt(id));
	}

	@ModulePermission(moduleName, 'update')
	@UseGuards(PermissionGuard)
	@HttpCode(HttpStatus.OK)
	@Put('api/v1/folders/:id')
	async updateById(@Param('id') id, @Body() dto: UpdateFolderDto) {
		return await this.folderService.editById(parseInt(id), dto);
	}

	@ModulePermission(moduleName, 'delete')
	@UseGuards(PermissionGuard)
	@HttpCode(HttpStatus.OK)
	@Delete('api/v1/folders/:id')
	async deleteById(@Param('id') id) {
		return await this.folderService.removeById(parseInt(id));
	}
}
