import { IsNotEmpty, IsString } from 'class-validator';

class RoleNameDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export { RoleNameDto as CreateRoleDto, RoleNameDto as UpdateRoleDto };
