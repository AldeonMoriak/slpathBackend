export const imageFileFilter = (_, file: any, callback: any) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return callback(new Error('شما تنها میتوانید عکس آپلود کنید!'), false);
  }
  callback(null, true);
};
