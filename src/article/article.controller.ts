import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminJwtAuthGuard } from 'src/admins/admin-jwt-auth.guard';
import { diskStorage } from 'multer';
import { GetAdmin } from 'src/admins/get-admin.decorator';
import { editFileName } from 'src/utils/edit-file-name';
import { ArticleService } from './article.service';
import { CreateArticleDTO } from './dto/create-article.dto';
import { imageFileFilter } from 'src/utils/image-file-filter';
import { Response } from 'express';
import { EditArticleDTO } from './dto/edit-article.dto';
import { CurrentUser } from 'src/interfaces/current-user.interface';
import { Article } from './article.entity';

@Controller('article')
export class ArticleController {
  constructor(private articlesService: ArticleService) {}

  @Get('getAllArticles')
  async getAllArticles(): Promise<Article[]> {
    return this.articlesService.getAllArticles();
  }

  @UseGuards(AdminJwtAuthGuard)
  @Post('createArticle')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'uploads/',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async createArticle(
    @UploadedFile() file,
    @Body() createArticleDTO: CreateArticleDTO,
    @GetAdmin() admin: any,
  ): Promise<void> {
    console.log(file);
    try {
      return this.articlesService.createArticle(createArticleDTO, file, admin);
    } catch (error) {
      return error;
    }
  }

  @UseGuards(AdminJwtAuthGuard)
  @Patch('editeArticle')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'uploads/',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async editArticle(
    @UploadedFile() file,
    @Body() editArticleDTO: EditArticleDTO,
    @GetAdmin() admin: CurrentUser,
  ): Promise<Article> {
    return this.articlesService.editArticle(editArticleDTO, file, admin);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Delete('deleteArticle')
  async deleteArticle(@Body() id: number): Promise<void> {
    return this.deleteArticle(id);
  }

  @Get(':imgpath')
  seeUploadedFile(@Param('imgpath') image, @Res() res: Response) {
    return res.sendFile(image, { root: 'uploads/' });
  }
}
