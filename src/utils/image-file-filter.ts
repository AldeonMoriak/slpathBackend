import { UnauthorizedException } from '@nestjs/common';

export const imageFileFilter = (_, file: any, callback: any) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return callback(
      new UnauthorizedException('شما تنها میتوانید عکس آپلود کنید!'),
      false,
    );
  }
  callback(null, true);
};
