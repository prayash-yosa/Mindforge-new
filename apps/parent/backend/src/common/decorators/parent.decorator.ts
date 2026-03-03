import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthenticatedParent {
  parentId: string;
  linkedStudentId: string;
  role: string;
}

export const Parent = createParamDecorator(
  (data: keyof AuthenticatedParent | undefined, ctx: ExecutionContext): AuthenticatedParent | string => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthenticatedParent;
    return data ? user?.[data] : user;
  },
);
