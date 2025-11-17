import { GetUser, ModulePermission } from '@/common/decorators';
import { JwtGuard, PermissionGuard } from '@/common/guards';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { SignInUserDto, UserCreateDto, UserUpdateDto } from './dto';
import { UserService } from './user.service';

const moduleName = 'user';

@Controller()
export class UserController {
  @Inject()
  private readonly userService: UserService;

  @HttpCode(HttpStatus.OK)
  @Post('api/v1/auth/sign-in')
  async signIn(@Body() dto: SignInUserDto) {
    return await this.userService.signIn(dto);
  }

  @ModulePermission(moduleName, 'create')
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Post('api/v1/users')
  async create(@Body() dto: UserCreateDto) {
    return await this.userService.save(dto);
  }

  @ModulePermission(moduleName, 'read')
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Get('api/v1/users')
  async readAll() {
    return await this.userService.getAll();
  }

  @ModulePermission(moduleName, 'read')
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Get('api/v1/users/:id')
  async readById(@Param('id') id: string) {
    return await this.userService.getById(parseInt(id));
  }

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @Get('api/v1/user-profile')
  async readProfile(@GetUser() user: any) {
    return {
      success: true,
      data: user,
    };
  }

  @ModulePermission(moduleName, 'update')
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Put('api/v1/users/:id')
  async updateById(@Param('id') id: string, @Body() dto: UserUpdateDto) {
    return await this.userService.editById(parseInt(id), dto);
  }

  @ModulePermission(moduleName, 'delete')
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Delete('api/v1/users/:id')
  async deleteById(@Param('id') id: string) {
    return await this.userService.removeById(parseInt(id));
  }
}
