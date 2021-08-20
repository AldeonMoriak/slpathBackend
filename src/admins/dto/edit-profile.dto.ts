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

  @IsOptional()
  @MinLength(8, { message: 'رمز عبور باید بیشتر از ۸ حرف باشد.' })
  @MaxLength(20, { message: 'رمز عبور باید کمتر از ۲۰ حرف باشد' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'رمز عبور بسیار ضعیف است و باید متشکل از یک حرف بزرگ، یک عدد و یک علامت باشد.',
  })
  password?: string;

  categories: string;

  @MinLength(20, { message: 'تعداد کاراکتر ها باید بیشتر از ۲۰ باشد' })
  @MaxLength(810, {
    message: 'حداکثر تعداد کاراکتر های درباره ما باید ۸۱۰ باشد',
  })
  description: string;

  @IsOptional()
  @Matches(/989\d{9}/i, {
    message: 'شماره واتساپ را با فرمت ۹۸۹xxxxxxxxx وارد کنید',
  })
  whatsappId?: string;

  @IsOptional()
  @Matches(/09(1[0-9]|3[1-9]|2[1-9])-?[0-9]{3}-?[0-9]{4}/i, {
    message: 'یک شماره موبایل معتبر وارد کنید',
  })
  mobileNumber?: string;

  @IsOptional()
  @IsString({ message: 'نام کاربری اینستاگرام باید از نوع رشته باشد' })
  instagramUsername?: string;

  @IsOptional()
  @IsString({ message: 'نام کاربری لینکداین باید از نوع رشته باشد' })
  linkedinId?: string;

  @IsOptional()
  @IsString({ message: 'نام باید از نوع رشته باشد' })
  telegramUsername?: string;

  @IsOptional()
  @IsString({ message: 'نام باید از نوع رشته باشد' })
  clinicAddress?: string;

  @IsOptional()
  @IsString({ message: 'عنوان شغل باید از نوع رشته باشد' })
  occupation?: string;
}
