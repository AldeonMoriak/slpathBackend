import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AdminJwtAuthGuard } from 'src/admins/admin-jwt-auth.guard';
import { GetAdmin } from 'src/admins/get-admin.decorator';
import { CurrentUser } from 'src/interfaces/current-user.interface';
import { ResponseMessage } from 'src/interfaces/response-message.interface';
import { editFileName } from 'src/utils/edit-file-name';
import { imageFileFilter } from 'src/utils/image-file-filter';
import { CategoriesService } from './categories.service';
import { Interest } from './category.entity';
import { CreateCategoryDTO } from './dto/create-category.dto';
import { EditCategoryDTO } from './dto/edit-category.dto';
import CategoryResponse from './interfaces/category.interface';
import { Response } from 'express';

@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get('getAll')
  async getAllCategories(): Promise<Interest[]> {
    return this.categoriesService.getAllCategories();
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('getAllForAdmin')
  async getAllCategoriesForAdmin(): Promise<Interest[]> {
    return this.categoriesService.getAllCategoriesForAdmin();
  }

  @UseGuards(AdminJwtAuthGuard)
  @Post('createCategory')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'uploads/images/',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async createCategory(
    @UploadedFile() file,
    @Body() createCategoryDTO: CreateCategoryDTO,
    @GetAdmin() admin: CurrentUser,
  ): Promise<ResponseMessage> {
    return this.categoriesService.createCategory(
      createCategoryDTO,
      admin,
      file,
    );
  }

  @UseGuards(AdminJwtAuthGuard)
  @Post('editCategory')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'uploads/images/',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async editCategory(
    @UploadedFile() file,
    @Body() editCategoryDTO: EditCategoryDTO,
    @GetAdmin() user: CurrentUser,
  ): Promise<CategoryResponse> {
    return this.categoriesService.editCategory(editCategoryDTO, user, file);
  }

  @Get('/getCategory/:id')
  async getCategory(
    @Param(
      'id',
      new ParseIntPipe({
        exceptionFactory() {
          return new BadRequestException('لطفا یک عدد وارد کنید');
        },
      }),
    )
    id: number,
  ): Promise<Interest> {
    return this.categoriesService.getCategory(id);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Put('toggleCategoryActiveness/:id')
  async toggleCategoryActiveness(
    @Param(
      'id',
      new ParseIntPipe({
        exceptionFactory() {
          return new BadRequestException('لطفا یک عدد وارد کنید');
        },
      }),
    )
    id: number,
  ): Promise<void> {
    return this.categoriesService.toggleCategoryActiveness(id);
  }

  @Get('image/:imgpath')
  seeUploadedFile(@Param('imgpath') image: string, @Res() res: Response) {
    return res.sendFile(image, {
      root: image.includes('thumbnail')
        ? 'uploads/thumbnails/'
        : 'uploads/images/',
    });
  }
}
