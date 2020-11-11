import { IsEmpty, MinLength } from 'class-validator';

export class CreateArticleDTO {
  @IsEmpty({ message: 'لطفا یک عنوان وارد کنید.' })
  title: string;
  @MinLength(30, { message: 'خلاصه باید بیشتر از ۳۰ حرف باشد' })
  description: string;
  @MinLength(50, { message: 'محتوا باید بیشتر از ۵۰ حرف باشد.' })
  content: string;
  image: File;
  categoryId?: number;
  tags?: number[];
  referenceUrl?: string;
}
