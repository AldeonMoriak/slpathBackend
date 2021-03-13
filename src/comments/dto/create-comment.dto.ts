import { IsEmail, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateCommentDTO {
  @IsNotEmpty({ message: 'لطفا نام خود را وارد کنید.' })
  name: string;
  @MaxLength(184, { message: 'محتوا باید حداکثر 184 حرف باشد.' })
  @IsNotEmpty({ message: 'پاسخ نمی تواند خالی باشد' })
  content: string;
  articleId: number;

  @IsOptional()
  @IsEmail({}, { message: 'یک ایمیل معتبر وارد کنید.' })
  email?: string;

  parentId: number;
}
