import { Inject, Injectable } from '@nestjs/common';
import { DbService } from '@/db/db.service';
import { ConstantService } from '@/util/constant.service';
import { CreatePermissionDto, UpdatePermissionDto } from './dto';
import { createSuccessResult, createErrorResult, ServiceResult } from '@/common/interfaces';

@Injectable()
export class PermissionService {
	@Inject()
	private readonly constant: ConstantService;

	@Inject(DbService)
	private readonly db: DbService;

	async save(dto: CreatePermissionDto): Promise<ServiceResult> {
		// Single operation - use Prisma directly
		const data = await this.db.permission.create({
			data: dto,
		});

		return createSuccessResult(data, 'Permission created successfully');
	}

	async getAllModuleNames(): Promise<ServiceResult> {
		// This is a simple constant lookup, no DB operation
		const result = this.constant.getModuleNameList();

		return createSuccessResult(result, 'Module names retrieved successfully');
	}

	async getAllPermissionTypes(): Promise<ServiceResult> {
		// This is a simple constant lookup, no DB operation
		const result = this.constant.getPermissionTypeList();

		return createSuccessResult(result, 'Permission types retrieved successfully');
	}

	async getAll(roleId: number | null): Promise<ServiceResult> {
		// Single operation - use Prisma directly
		const data = !roleId
			? await this.db.permission.findMany({
					include: {
						role: true,
					},
				})
			: await this.db.permission.findMany({
					where: { roleId },
					include: {
						role: true,
					},
				});

		return createSuccessResult(data, 'Permissions retrieved successfully');
	}

	async getById(id: number): Promise<ServiceResult> {
		// Business logic validation
		if (!id || id <= 0) {
			return createErrorResult(
				{ name: 'badRequest', message: 'Invalid permission ID' },
				'Invalid permission ID provided',
			);
		}

		// Single operation - use Prisma directly
		const data = await this.db.permission.findFirst({
			where: { id },
			include: {
				role: true,
			},
		});

		// Business logic: check if permission exists
		if (!data) {
			return createErrorResult(
				{ name: 'badRequest', message: 'Permission not found' },
				'Permission not found',
			);
		}

		return createSuccessResult(data, 'Permission retrieved successfully');
	}

	async editById(id: number, dto: UpdatePermissionDto): Promise<ServiceResult> {
		// Business logic validation
		if (!id || id <= 0) {
			return createErrorResult(
				{ name: 'badRequest', message: 'Invalid permission ID' },
				'Invalid permission ID provided',
			);
		}

		// Single operation - use Prisma directly
		const data = await this.db.permission.update({
			where: { id },
			data: dto,
		});

		return createSuccessResult(data, 'Permission updated successfully');
	}

	async removeById(id: number): Promise<ServiceResult> {
		// Business logic validation
		if (!id || id <= 0) {
			return createErrorResult(
				{ name: 'badRequest', message: 'Invalid permission ID' },
				'Invalid permission ID provided',
			);
		}

		// Single operation - use Prisma directly
		const data = await this.db.permission.delete({
			where: { id },
		});

		return createSuccessResult(data, 'Permission deleted successfully');
	}
}
