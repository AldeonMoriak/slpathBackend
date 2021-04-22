import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DateTime } from 'luxon';
import * as sharp from 'sharp';
import { AdminsService } from 'src/admins/admins.service';
import { CurrentUser } from 'src/interfaces/current-user.interface';
import { ResponseMessage } from 'src/interfaces/response-message.interface';
import { Repository, Timestamp } from 'typeorm';
import { Interest } from './category.entity';
import { CreateCategoryDTO } from './dto/create-category.dto';
import { EditCategoryDTO } from './dto/edit-category.dto';
import CategoryResponse from './interfaces/category.interface';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Interest)
    private categoryRepository: Repository<Interest>,
    private adminsService: AdminsService,
  ) {}

  async findOne(id: number): Promise<Interest> {
    return this.categoryRepository.findOne(id);
  }

  async getAllCategories(): Promise<Interest[]> {
    const interests = await this.categoryRepository
      .createQueryBuilder('category')
      .select()
      .orderBy('category.createdDateTime', 'ASC')
      .getMany();

    interests.map((el) => delete el.content);
    return interests;
  }

  async createCategory(
    createCategoryDTO: CreateCategoryDTO,
    user: CurrentUser,
    file: any,
  ): Promise<ResponseMessage> {
    const admin = await this.adminsService.findOne(user.username);
    if (!admin)
      throw new UnauthorizedException('شما به این عملیات دسترسی ندارید');
    if (!file) throw new NotAcceptableException('لطفا یک عکس بارگزاری کنید!');
    const image = sharp('uploads/images/' + file.filename);
    image
      .resize({
        width: 300,
        fit: sharp.fit.contain,
        background: { r: 255, g: 255, b: 255, alpha: 0.5 },
      })
      .toFile('uploads/thumbnails/thumbnail-' + file.filename)
      .then((info) => {
        console.log(info);
      })
      .catch((err) => {
        console.log(err);
      });
    const category = new Interest();
    category.title = createCategoryDTO.title;
    category.admin = admin;
    category.description = createCategoryDTO.description;
    category.content = createCategoryDTO.content;

    category.imageUrl = file.filename;
    category.thumbnailUrl = 'thumbnail-' + file.filename;

    try {
      await category.save();
    } catch (error) {
      console.error(error);
    }
    return {
      message: 'عملیات با موفقیت انجام شد.',
    };
  }

  async editCategory(
    editCategoryDTO: EditCategoryDTO,
    user: CurrentUser,
    file?: any,
  ): Promise<CategoryResponse> {
    const admin = await this.adminsService.findOne(user.username);
    if (!admin)
      throw new UnauthorizedException('شما به این عملیات دسترسی ندارید.');
    const category = await this.categoryRepository.findOne(editCategoryDTO.id);
    if (!category) throw new NotFoundException('تخصص مورد نظر یافت نشد.');
    category.title = editCategoryDTO.title;
    if (file) {
      const image = sharp('uploads/images/' + file.filename);
      image
        .resize({
          width: 300,
          fit: sharp.fit.contain,
          background: { r: 255, g: 255, b: 255, alpha: 0.5 },
        })
        .toFile('uploads/thumbnails/thumbnail-' + file.filename)
        .then((info) => {
          console.log(info);
        })
        .catch((err) => {
          console.log(err);
        });
      category.imageUrl = file.filename;
      category.thumbnailUrl = 'thumbnail-' + file.filename;
    }

    category.description = editCategoryDTO.description;
    category.content = editCategoryDTO.content;
    const now = DateTime.utc().toISO() as unknown;

    category.updateDateTime = now as Timestamp;
    try {
      await category.save();
    } catch (error) {
      console.error(error);
    }
    return {
      message: 'عملیات با موفقیت انجام شد.',
    };
  }

  async getCategory(id: number): Promise<Interest> {
    const interest = await this.categoryRepository.findOne(id, {
      relations: ['therapists'],
    });
    if (!interest) throw new NotFoundException('مورد یافت نشد.');
    if (interest.therapists) {
      interest.therapists.map((admin) => {
        delete admin.password;
      });
    }
    return interest;
  }

  async deleteCategory(id: number): Promise<void> {
    const category = await this.categoryRepository.findOne(id);
    if (!category) throw new NotFoundException('دسته بندی مورد نظر یافت نشد.');
    await this.categoryRepository.delete(id);
  }
}
