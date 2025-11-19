import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { AppActions, AppSubjects } from '@/common/authorization/ability.types';

export const GetUser = createParamDecorator((data: string | null, ctx: ExecutionContext) => {
  const request: Express.Request = ctx.switchToHttp().getRequest();

  if (data) {
    return request.user[data];
  }

  return request.user;
});

export const CHECK_ABILITY_KEY = 'check_ability';

export interface RequiredAbility {
  action: AppActions;
  subject: AppSubjects;
}

export const CheckAbility = (...requirements: RequiredAbility[]) =>
  SetMetadata(CHECK_ABILITY_KEY, requirements);
