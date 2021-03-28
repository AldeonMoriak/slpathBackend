import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DateTime } from 'luxon';
import { AdminsService } from 'src/admins/admins.service';
import { CurrentUser } from 'src/interfaces/current-user.interface';
import { Repository, Timestamp } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDTO } from './dto/create-category.dto';
import { EditCategoryDTO } from './dto/edit-category.dto';
import CategoryResponse from './interfaces/category.interface';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private adminsService: AdminsService,
  ) {}

  async findOne(id: number): Promise<Category> {
    return this.categoryRepository.findOne(id);
  }

  async getAllCategories(): Promise<Category[]> {
    return this.categoryRepository
      .createQueryBuilder('category')
      .select()
      .leftJoin('category.admin', 'admin')
      .addSelect('admin.name')
      .leftJoin('category.editor', 'editor')
      .addSelect('editor.name')
      .orderBy('category.createdDateTime', 'DESC')
      .getMany();
  }

  async createCategory(
    createCategoryDTO: CreateCategoryDTO,
    user: any,
  ): Promise<{ message: string }> {
    const admin = await this.adminsService.findOne(user.username);
    if (!admin)
      throw new UnauthorizedException('شما به این عملیات دسترسی ندارید');
    const category = new Category();
    category.title = createCategoryDTO.title;
    category.admin = admin;

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
  ): Promise<CategoryResponse> {
    const category = await this.categoryRepository.findOne(editCategoryDTO.id);
    if (!category) throw new NotFoundException('دسته بندی مورد نظر یافت نشد.');
    const admin = await this.adminsService.findOne(user.username);
    if (!admin)
      throw new UnauthorizedException('شما به این عملیات دسترسی ندارید.');
    category.title = editCategoryDTO.title;
    category.editor = admin;

    const now = DateTime.utc().toISO() as unknown;

    category.updateDateTime = now as Timestamp;
    try {
      await category.save();
    } catch (error) {
      console.error(error);
    }
    return {
      category,
      message: 'عملیات با موفقیت انجام شد.',
    };
  }

  async deleteCategory(id: number): Promise<void> {
    const category = await this.categoryRepository.findOne(id);
    if (!category) throw new NotFoundException('دسته بندی مورد نظر یافت نشد.');
    await this.categoryRepository.delete(id);
  }
}
