import { MinLength } from 'class-validator';
import { CreateTagDTO } from 'src/tags/dto/create-tag.dto';

export class CreateCategoryDTO extends CreateTagDTO {
  @MinLength(30, { message: 'خلاصه باید بیشتر از ۳۰ حرف باشد' })
  description: string;
  @MinLength(50, { message: 'محتوا باید بیشتر از ۵۰ حرف باشد.' })
  content: string;
}
