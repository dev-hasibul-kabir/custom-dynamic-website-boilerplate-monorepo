import { createErrorResult, createSuccessResult, ServiceResult } from '@/common/interfaces';
import { Injectable, Inject } from '@nestjs/common';
import { DbService } from '@/db/db.service';
import { CreateRoleDto, UpdateRoleDto } from './dto';

@Injectable()
export class RoleService {
  constructor(@Inject(DbService) private readonly db: DbService) {}

  async save(dto: CreateRoleDto): Promise<ServiceResult> {
    // Single operation - use Prisma directly (no transaction needed)
    const data = await this.db.role.create({
      data: dto,
    });

    return createSuccessResult(data, 'Role created successfully');
  }

  async getAll(): Promise<ServiceResult> {
    // Single operation - use Prisma directly
    const data = await this.db.role.findMany({
      include: {
        permissions: true,
      },
    });

    return createSuccessResult(data, 'Roles retrieved successfully');
  }

  async getById(id: number): Promise<ServiceResult> {
    // Business logic validation
    if (!id || id <= 0) {
      return createErrorResult(
        { name: 'badRequest', message: 'Invalid role ID' },
        'Invalid role ID provided',
      );
    }

    // Single operation - use Prisma directly
    const data = await this.db.role.findFirst({
      where: { id },
      include: {
        permissions: true,
      },
    });

    // Business logic: check if role exists
    if (!data) {
      return createErrorResult({ name: 'badRequest', message: 'Role not found' }, 'Role not found');
    }

    return createSuccessResult(data, 'Role retrieved successfully');
  }

  async editById(id: number, dto: UpdateRoleDto): Promise<ServiceResult> {
    // Business logic validation
    if (!id || id <= 0) {
      return createErrorResult(
        { name: 'badRequest', message: 'Invalid role ID' },
        'Invalid role ID provided',
      );
    }

    // Single operation - use Prisma directly
    const data = await this.db.role.update({
      where: { id },
      data: dto,
    });

    return createSuccessResult(data, 'Role updated successfully');
  }

  async removeById(id: number): Promise<ServiceResult> {
    // Business logic validation
    if (!id || id <= 0) {
      return createErrorResult(
        { name: 'badRequest', message: 'Invalid role ID' },
        'Invalid role ID provided',
      );
    }

    // Single operation - use Prisma directly
    const data = await this.db.role.delete({
      where: { id },
    });

    return createSuccessResult(data, 'Role deleted successfully');
  }
}
