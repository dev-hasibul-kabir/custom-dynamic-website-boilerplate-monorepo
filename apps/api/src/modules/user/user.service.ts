import { createErrorResult, createSuccessResult, ServiceResult } from '@/common/interfaces';
import { HashService } from '@/util/hash.service';
import { NotificationService } from '@/util/notification.service';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma, Gender, UserStatus } from '@prisma/client';
import { DbService } from '@/db/db.service';
import { SignInUserDto, UserCreateDto, UserUpdateDto } from './dto';

type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    roles: { include: { role: true } };
    permissions: { include: { permission: true } };
  };
}>;

@Injectable()
export class UserService {
  @Inject()
  private readonly hash: HashService;

  @Inject()
  private readonly jwt: JwtService;

  @Inject()
  private readonly config: ConfigService;

  @Inject()
  private readonly notificationService: NotificationService;

  @Inject(DbService)
  private readonly db: DbService;

  private mapToProfile(user: UserWithRelations) {
    const { roles, permissions, ...rest } = user;

    const roleList = roles.map(({ role }) => role);
    const directPermissions = permissions.map(({ permission }) => permission);

    return {
      ...rest,
      roles: roleList,
      primaryRole: roleList[0] ?? null,
      directPermissions,
    };
  }

  private async getUserProfile(id: number) {
    const user = await this.db.user.findUnique({
      where: { id },
      include: {
        roles: { include: { role: true } },
        permissions: { include: { permission: true } },
      },
    });

    return user ? this.mapToProfile(user) : null;
  }

  private async syncUserRoles(userId: number, roleIds: number[]) {
    const uniqueRoleIds = Array.from(new Set(roleIds));

    await this.db.$transaction(async tx => {
      await tx.userRole.deleteMany({
        where: {
          userId,
          roleId: { notIn: uniqueRoleIds },
        },
      });

      await Promise.all(
        uniqueRoleIds.map(roleId =>
          tx.userRole.upsert({
            where: {
              userId_roleId: {
                userId,
                roleId,
              },
            },
            update: {},
            create: {
              userId,
              roleId,
            },
          }),
        ),
      );
    });
  }

  private async syncUserPermissions(userId: number, permissionIds: number[]) {
    const uniquePermissionIds = Array.from(new Set(permissionIds));

    await this.db.$transaction(async tx => {
      await tx.userPermission.deleteMany({
        where: {
          userId,
          permissionId: { notIn: uniquePermissionIds },
        },
      });

      await Promise.all(
        uniquePermissionIds.map(permissionId =>
          tx.userPermission.upsert({
            where: {
              userId_permissionId: {
                userId,
                permissionId,
              },
            },
            update: {},
            create: {
              userId,
              permissionId,
            },
          }),
        ),
      );
    });
  }

  private async validateRoleIds(roleIds: number[]) {
    const normalizedRoleIds = Array.from(new Set(roleIds));

    if (normalizedRoleIds.length === 0) {
      return { values: normalizedRoleIds };
    }

    const roles = await this.db.role.findMany({
      where: {
        id: { in: normalizedRoleIds },
      },
      select: { id: true },
    });

    if (roles.length !== normalizedRoleIds.length) {
      const existingRoleIds = roles.map(role => role.id);
      const missingRoleIds = normalizedRoleIds.filter(roleId => !existingRoleIds.includes(roleId));

      return {
        error: createErrorResult(
          { name: 'badRequest', message: `Invalid role IDs: ${missingRoleIds.join(', ')}` },
          'Invalid role selection',
        ),
      };
    }

    return { values: normalizedRoleIds };
  }

  private async validatePermissionIds(permissionIds: number[]) {
    const normalizedPermissionIds = Array.from(new Set(permissionIds));

    if (normalizedPermissionIds.length === 0) {
      return { values: normalizedPermissionIds };
    }

    const permissions = await this.db.permission.findMany({
      where: {
        id: { in: normalizedPermissionIds },
      },
      select: { id: true },
    });

    if (permissions.length !== normalizedPermissionIds.length) {
      const existingPermissionIds = permissions.map(permission => permission.id);
      const missingPermissionIds = normalizedPermissionIds.filter(
        permissionId => !existingPermissionIds.includes(permissionId),
      );

      return {
        error: createErrorResult(
          {
            name: 'badRequest',
            message: `Invalid permission IDs: ${missingPermissionIds.join(', ')}`,
          },
          'Invalid permission selection',
        ),
      };
    }

    return { values: normalizedPermissionIds };
  }

  signToken(name: string, email: string): Promise<string> {
    const payload = {
      name,
      email,
    };

    return this.jwt.signAsync(payload, {
      issuer: 'example.com',
      subject: email,
      expiresIn: '7d',
      secret: this.config.get('JWT_SECRET'),
    });
  }

  async signIn(dto: SignInUserDto): Promise<ServiceResult> {
    if (!dto.email || !dto.password) {
      return createErrorResult(
        { name: 'badRequest', message: 'Email and password are required' },
        'Email and password are required',
      );
    }

    const user = await this.db.user.findUnique({
      select: { id: true, name: true, email: true, password: true },
      where: { email: dto.email, status: 'ACTIVE' },
    });

    if (!user) {
      return createErrorResult(
        { name: 'unauthorized', message: 'Unfortunately, you entered credentials are incorrect!' },
        'Invalid email or password',
      );
    }

    const isPasswordMatched = await this.hash.matchHash(dto.password, user.password);

    if (!isPasswordMatched) {
      return createErrorResult(
        { name: 'unauthorized', message: 'Unfortunately, you entered credentials are incorrect!' },
        'Invalid email or password',
      );
    }

    const token = await this.signToken(user.name, user.email);

    const data = {
      access_type: 'Bearer',
      access_token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };

    return createSuccessResult(data, 'Hi, you are successfully signed in.');
  }

  async save(dto: UserCreateDto): Promise<ServiceResult> {
    if (!dto.email || !dto.password || !dto.name) {
      return createErrorResult(
        { name: 'badRequest', message: 'Name, email, and password are required' },
        'Name, email, and password are required',
      );
    }

    const { error, values: normalizedRoleIds } = await this.validateRoleIds(dto.roleIds);

    if (error) {
      return error;
    }

    if (!normalizedRoleIds.length) {
      return createErrorResult(
        { name: 'badRequest', message: 'At least one role is required' },
        'At least one role is required',
      );
    }

    const hashedPassword = await this.hash.generateHash(dto.password);

    const user = await this.db.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        phone: dto.phone,
        nid: dto.nid,
        dateOfBirth: dto.dateOfBirth,
        gender: dto.gender as Gender | undefined,
        address: dto.address,
        status: 'ACTIVE' as UserStatus,
      },
    });

    await this.syncUserRoles(user.id, normalizedRoleIds);

    const data = await this.getUserProfile(user.id);

    // Send email notification (non-blocking, let errors bubble if critical)
    this.notificationService.sendEmail({
      to: user.email,
      subject: `User Creation Success`,
      html: `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>User Creation Success</title>
			</head>
			<body>
				<div style="background-color: #f4f4f4; padding: 20px;">
					<div style="max-width: 600px; margin: 0 auto; background-color: #fff; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">

						<div style="text-align: center; padding: 20px;">
							<h1>User Created</h1>
						</div>

						<div style="padding: 20px;">
							<p>Hello ${dto.name},</p>
							<p>An admin user account has been successfully created in the system. Here are the details:</p>

							<h2>User Login Details:</h2>
							<ul>
								<li>Full Name: ${dto.name}</li>
								<li>Email Address: ${dto.email}</li>
								<li>Password: ${dto.password}</li>
							</ul>

							<p>If you have any questions or need further assistance, please don't hesitate to contact us.</p>

							<p>Thank you for using our admin panel.</p>

							<p>Best regards,</p>
							<p>Example</p>
						</div>
					</div>
				</div>
			</body>
			</html>
			`,
    });

    return createSuccessResult(data, 'User created successfully');
  }

  async getAll(): Promise<ServiceResult> {
    const users = await this.db.user.findMany({
      include: {
        roles: { include: { role: true } },
        permissions: { include: { permission: true } },
      },
    });

    const data = users.map(user => this.mapToProfile(user));

    return createSuccessResult(data, 'Users retrieved successfully');
  }

  async getById(id: number): Promise<ServiceResult> {
    if (!id || id <= 0) {
      return createErrorResult(
        { name: 'badRequest', message: 'Invalid user ID' },
        'Invalid user ID provided',
      );
    }

    const data = await this.getUserProfile(id);

    if (!data) {
      return createErrorResult({ name: 'badRequest', message: 'User not found' }, 'User not found');
    }

    return createSuccessResult(data, 'User retrieved successfully');
  }

  async editById(id: number, dto: UserUpdateDto): Promise<ServiceResult> {
    if (!id || id <= 0) {
      return createErrorResult(
        { name: 'badRequest', message: 'Invalid user ID' },
        'Invalid user ID provided',
      );
    }

    const updateData: Prisma.UserUpdateInput = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.nid !== undefined) updateData.nid = dto.nid;
    if (dto.dateOfBirth !== undefined) updateData.dateOfBirth = dto.dateOfBirth;
    if (dto.gender !== undefined) updateData.gender = dto.gender as Gender;
    if (dto.address !== undefined) updateData.address = dto.address;
    if (dto.status !== undefined) updateData.status = dto.status as UserStatus;

    const user = await this.db.user.update({
      where: { id },
      data: updateData,
    });

    if (dto.roleIds) {
      const { error, values } = await this.validateRoleIds(dto.roleIds);

      if (error) {
        return error;
      }

      await this.syncUserRoles(id, values);
    }

    const data = await this.getUserProfile(id);

    // Send email notification (non-blocking)
    this.notificationService.sendEmail({
      to: user.email,
      subject: `User Information Update`,
      html: `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>User Information Update</title>
			</head>
			<body>
				<div style="background-color: #f4f4f4; padding: 20px;">
					<div style="max-width: 600px; margin: 0 auto; background-color: #fff; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">

						<div style="text-align: center; padding: 20px;">
							<h1>User Information Update</h1>
						</div>

						<div style="padding: 20px;">
							<p>Hello ${dto.name},</p>
							<p>Your admin panel account information has been updated. Here are the details:</p>

							<h2>Updated Information:</h2>
							<ul>
								<li>Full Name: ${dto.name}</li>
								<li>Phone: ${dto.phone}</li>
								<li>NID: ${dto.nid}</li>
							</ul>

							<p>If you did not initiate this update or have any questions regarding your account, please contact our support team immediately.</p>

							<p>Thank you for using our admin panel.</p>

							<p>Best regards,</p>
							<p>Example</p>
						</div>
					</div>
				</div>
			</body>
			</html>
			`,
    });

    return createSuccessResult(data, 'User updated successfully');
  }

  async updateRoles(id: number, roleIds: number[]): Promise<ServiceResult> {
    if (!id || id <= 0) {
      return createErrorResult(
        { name: 'badRequest', message: 'Invalid user ID' },
        'Invalid user ID provided',
      );
    }

    const user = await this.db.user.findUnique({ where: { id } });

    if (!user) {
      return createErrorResult({ name: 'badRequest', message: 'User not found' }, 'User not found');
    }

    const { error, values } = await this.validateRoleIds(roleIds);

    if (error) {
      return error;
    }

    await this.syncUserRoles(id, values);

    const data = await this.getUserProfile(id);

    return createSuccessResult(data, 'User roles updated successfully');
  }

  async updatePermissions(id: number, permissionIds: number[]): Promise<ServiceResult> {
    if (!id || id <= 0) {
      return createErrorResult(
        { name: 'badRequest', message: 'Invalid user ID' },
        'Invalid user ID provided',
      );
    }

    const user = await this.db.user.findUnique({ where: { id } });

    if (!user) {
      return createErrorResult({ name: 'badRequest', message: 'User not found' }, 'User not found');
    }

    const { error, values } = await this.validatePermissionIds(permissionIds);

    if (error) {
      return error;
    }

    await this.syncUserPermissions(id, values);

    const data = await this.getUserProfile(id);

    return createSuccessResult(data, 'User permissions updated successfully');
  }

  async removeById(id: number): Promise<ServiceResult> {
    if (!id || id <= 0) {
      return createErrorResult(
        { name: 'badRequest', message: 'Invalid user ID' },
        'Invalid user ID provided',
      );
    }

    const data = await this.db.user.delete({
      where: { id },
    });

    this.notificationService.sendEmail({
      to: data.email,
      subject: `User Account Deletion`,
      html: `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>User Account Deletion</title>
			</head>
			<body>
				<div style="background-color: #f4f4f4; padding: 20px;">
					<div style="max-width: 600px; margin: 0 auto; background-color: #fff; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">

						<div style="text-align: center; padding: 20px;">
							<h1>User Account Deletion</h1>
						</div>

						<div style="padding: 20px;">
							<p>Hello Admin,</p>
							<p>We regret to inform you that your admin panel account has been deleted. This action was taken as per your request or due to specific circumstances.</p>

							<p>If you believe this deletion was in error or have any questions or concerns, please contact company support team immediately.</p>

							<p>We appreciate your usage of our admin panel.</p>

							<p>Best regards,</p>
							<p>Example</p>
						</div>

					</div>
				</div>
			</body>
			</html>
			`,
    });

    return createSuccessResult(data, 'User deleted successfully');
  }
}
