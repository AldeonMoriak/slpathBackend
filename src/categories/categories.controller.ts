import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminJwtAuthGuard } from 'src/admins/admin-jwt-auth.guard';
import { GetAdmin } from 'src/admins/get-admin.decorator';
import { CurrentUser } from 'src/interfaces/current-user.interface';
import { CategoriesService } from './categories.service';
import { Category } from './category.entity';
import { CreateCategoryDTO } from './dto/create-category.dto';
import { EditCategoryDTO } from './dto/edit-category.dto';
import CategoryResponse from './interfaces/category.interface';

@UseGuards(AdminJwtAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get('getAll')
  async getAllCategories(): Promise<Category[]> {
    return this.categoriesService.getAllCategories();
  }

  @Post('createCategory')
  async createCategory(
    @Body() createCategoryDTO: CreateCategoryDTO,
    @GetAdmin() admin: any,
  ): Promise<{ message: string }> {
    return this.categoriesService.createCategory(createCategoryDTO, admin);
  }

  @Patch('editCategory')
  async editCategory(
    @Body() editCategoryDTO: EditCategoryDTO,
    @GetAdmin() user: CurrentUser,
  ): Promise<CategoryResponse> {
    return this.categoriesService.editCategory(editCategoryDTO, user);
  }

  @Delete('deleteCategory/:id')
  async deleteCategory(@Param() id: number): Promise<void> {
    return this.categoriesService.deleteCategory(id);
  }
}
