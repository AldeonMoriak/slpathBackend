import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { AdminJwtAuthGuard } from 'src/admins/admin-jwt-auth.guard';
import { GetAdmin } from 'src/admins/get-admin.decorator';
import { CurrentUser } from 'src/interfaces/current-user.interface';
import { editFileName } from 'src/utils/edit-file-name';
import { imageFileFilter } from 'src/utils/image-file-filter';
import { Article } from './article.entity';
import { ArticleService } from './article.service';
import { CreateArticleDTO } from './dto/create-article.dto';
import { EditArticleDTO } from './dto/edit-article.dto';
import ArticleResponse from './interfaces/article.interface';

@Controller('articles')
export class ArticleController {
  constructor(private articlesService: ArticleService) {}

  @Get('getAll')
  async getAllArticles(): Promise<Article[]> {
    return this.articlesService.getAllArticles();
  }

  @Get('/getPosts/:username')
  async getAdminArticles(
    @Param('username') username: string,
  ): Promise<Article[]> {
    return this.articlesService.getAdminArticles(username);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Post('createArticle')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'uploads/images/',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async createArticle(
    @UploadedFile() file,
    @Body() createArticleDTO: CreateArticleDTO,
    @GetAdmin() admin: CurrentUser,
  ): Promise<{ message: string }> {
    try {
      return this.articlesService.createArticle(createArticleDTO, file, admin);
    } catch (error) {
      return error;
    }
  }

  @UseGuards(AdminJwtAuthGuard)
  @Post('editArticle')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'uploads/images/',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async editArticle(
    @GetAdmin() admin: CurrentUser,
    @Body() editArticleDTO: EditArticleDTO,
    @UploadedFile() file?,
  ): Promise<ArticleResponse> {
    return this.articlesService.editArticle(admin, editArticleDTO, file);
  }

  @Get('/getPost/:id')
  async getArticle(@Param('id') id): Promise<Article> {
    return this.articlesService.getArticle(id);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Delete('deleteArticle/:id')
  async deleteArticle(@Param() id: number): Promise<{ message: string }> {
    return this.articlesService.deleteArticle(id);
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
