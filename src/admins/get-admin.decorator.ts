import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Admin } from 'src/admins/admin.entity';

export const GetAdmin = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Admin => {
    const request = ctx.switchToHttp().getRequest();
    console.log(request);
    return request.admin;
  },
  // export const GetUser = createParamDecorator(
  //   (data, req): User => {
  //     console.log(req);
  //     return req.user;
  //   },
);
