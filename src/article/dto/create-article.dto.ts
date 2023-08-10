import { IsNotEmpty, MinLength } from 'class-validator';

export class CreateArticleDTO {
  @IsNotEmpty({ message: 'لطفا یک عنوان وارد کنید.' })
  title: string;
  @MinLength(30, { message: 'خلاصه باید بیشتر از ۳۰ حرف باشد' })
  description: string;
  @MinLength(50, { message: 'محتوا باید بیشتر از ۵۰ حرف باشد.' })
  content: string;
  categoryId?: string;
  tags?: string;
  referenceUrl?: string;
}
