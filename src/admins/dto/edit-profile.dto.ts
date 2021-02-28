import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class EditProfileDTO {
  @IsOptional()
  @IsString({ message: 'نام باید از نوع رشته باشد' })
  @MinLength(4, {
    message: 'نام باید بیشتر از ۴ حرف باشد.',
  })
  @MaxLength(28, {
    message: 'نام باید کمتر از ۲۸ حرف باشد',
  })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'لطفا یک ایمیل معتبر وارد کنید' })
  email?: string;

  @MinLength(8, { message: 'رمز عبور باید بیشتر از ۸ حرف باشد.' })
  @IsOptional()
  @MaxLength(20, { message: 'رمز عبور باید کمتر از ۲۰ حرف باشد' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'رمز عبور بسیار ضعیف است و باید متشکل از یک حرف بزرگ، یک عدد و یک علامت باشد.',
  })
  password?: string;
}
