import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Admin } from 'src/admins/admin.entity';
import { GetAdmin } from 'src/admins/get-admin.decorator';
import { ArticleService } from './article.service';
import { CreateArticleDTO } from './dto/create-article.dto';

@Controller('article')
export class ArticleController {
  constructor(private articlesService: ArticleService) {}
  @Post('createArticle')
  @UseInterceptors(FileInterceptor('file'))
  async createArticle(
    @UploadedFile() file,
    @Body() createArticleDTO: CreateArticleDTO,
    @GetAdmin() admin: Admin,
  ): Promise<void> {
    return this.articlesService.createArticle(createArticleDTO, admin);
  }
}
