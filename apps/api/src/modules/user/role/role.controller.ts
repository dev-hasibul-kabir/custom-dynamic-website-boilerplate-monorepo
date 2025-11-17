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
import { RoleService } from './role.service';
import { ModulePermission } from '@/common/decorators';
import { PermissionGuard } from '@/common/guards';
import { CreateRoleDto, UpdateRoleDto } from './dto';

export const moduleName = 'role-permission';

@Controller('')
export class RoleController {
	@Inject()
	private readonly roleService: RoleService;

	@ModulePermission(moduleName, 'create')
	@UseGuards(PermissionGuard)
	@HttpCode(HttpStatus.OK)
	@Post('api/v1/roles')
	async create(@Body() dto: CreateRoleDto) {
		return await this.roleService.save(dto);
	}

	@ModulePermission(moduleName, 'read')
	@UseGuards(PermissionGuard)
	@HttpCode(HttpStatus.OK)
	@Get('api/v1/roles')
	async readAll() {
		return await this.roleService.getAll();
	}

	@ModulePermission(moduleName, 'read')
	@UseGuards(PermissionGuard)
	@HttpCode(HttpStatus.OK)
	@Get('api/v1/roles/:id')
	async readById(@Param('id') id: string) {
		return await this.roleService.getById(parseInt(id));
	}

	@ModulePermission(moduleName, 'update')
	@UseGuards(PermissionGuard)
	@HttpCode(HttpStatus.OK)
	@Put('api/v1/roles/:id')
	async updateById(@Param('id') id, @Body() dto: UpdateRoleDto) {
		return await this.roleService.editById(parseInt(id), dto);
	}

	@ModulePermission(moduleName, 'delete')
	@UseGuards(PermissionGuard)
	@HttpCode(HttpStatus.OK)
	@Delete('api/v1/roles/:id')
	async deleteById(@Param('id') id) {
		return await this.roleService.removeById(parseInt(id));
	}
}
