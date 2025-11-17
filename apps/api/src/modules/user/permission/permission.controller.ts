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

import { PermissionService } from './permission.service';
import { moduleName } from '../role/role.controller';
import { ModulePermission } from '@/common/decorators';
import { PermissionGuard } from '@/common/guards';
import {
  CreatePermissionDto,
  UpdatePermissionDto,
} from './dto';

@Controller()
export class PermissionController {
  @Inject()
  private readonly permissionService: PermissionService;

  @ModulePermission(moduleName, 'create')
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Post('api/v1/permissions')
  async create(@Body() dto: CreatePermissionDto) {
    return await this.permissionService.save(dto);
  }

  @ModulePermission(moduleName, 'read')
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Get('api/v1/permission-modules')
  async readAllModuleNames() {
    return await this.permissionService.getAllModuleNames();
  }

  @ModulePermission(moduleName, 'read')
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Get('api/v1/permission-types')
  async readAllPermissionTypes() {
    return await this.permissionService.getAllPermissionTypes();
  }

  @ModulePermission(moduleName, 'read')
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Get('api/v1/permissions')
  async readAll() {
    return await this.permissionService.getAll(null);
  }

  @ModulePermission(moduleName, 'read')
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Get('api/v1/roles/:roleId/permissions')
  async readAllByRole(
    @Param('roleId') roleId: string,
  ) {
    return await this.permissionService.getAll(
      parseInt(roleId),
    );
  }

  @ModulePermission(moduleName, 'read')
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Get('api/v1/permissions/:id')
  async readById(@Param('id') id) {
    return await this.permissionService.getById(
      parseInt(id),
    );
  }

  @ModulePermission(moduleName, 'update')
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Put('api/v1/permissions/:id')
  async updateById(
    @Param('id') id,
    @Body() dto: UpdatePermissionDto,
  ) {
    return await this.permissionService.editById(
      parseInt(id),
      dto,
    );
  }

  @ModulePermission(moduleName, 'delete')
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Delete('api/v1/permissions/:id')
  async deleteById(@Param('id') id) {
    return await this.permissionService.removeById(
      parseInt(id),
    );
  }
}
