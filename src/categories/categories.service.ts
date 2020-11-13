import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminsService } from 'src/admins/admins.service';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDTO } from './dto/create-category.dto';
import { EditCategoryDTO } from './dto/edit-category.dto';

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
    return this.categoryRepository.find();
  }

  async createCategory(
    createCategoryDTO: CreateCategoryDTO,
    user: any,
  ): Promise<void> {
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
  }

  async editCategory(editCategoryDTO: EditCategoryDTO): Promise<Category> {
    const category = await this.categoryRepository.findOne(editCategoryDTO.id);
    if (!category) throw new NotFoundException('دسته بندی مورد نظر یافت نشد.');
    category.title = editCategoryDTO.title;
    try {
      await category.save();
    } catch (error) {
      console.error(error);
    }
    return category;
  }

  async deleteCategory(id: number): Promise<void> {
    const category = await this.categoryRepository.findOne(id);
    if (!category) throw new NotFoundException('دسته بندی مورد نظر یافت نشد.');
    await this.categoryRepository.delete(id);
  }
}
