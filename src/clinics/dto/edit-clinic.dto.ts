import {
  IsNumber,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class EditClinicDTO {
  @IsNumber()
  id: number;
  @MinLength(30, { message: 'توضیحات باید بیشتر از ۳۰ حرف باشد' })
  description: string;

  @IsString({ message: 'نام باید از نوع رشته باشد' })
  @MinLength(4, {
    message: 'نام باید بیشتر از ۴ حرف باشد.',
  })
  @MaxLength(28, {
    message: 'نام باید کمتر از ۲۸ حرف باشد',
  })
  name: string;

  @IsString({ message: 'آدرس کلینیک باید از نوع رشته باشد' })
  address: string;

  @Matches(/09(1[0-9]|3[1-9]|2[1-9])-?[0-9]{3}-?[0-9]{4}/i, {
    message: 'یک شماره موبایل معتبر وارد کنید',
  })
  phoneNumber: string;
}
