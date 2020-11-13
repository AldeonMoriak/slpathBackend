import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminJwtAuthGuard } from 'src/admins/admin-jwt-auth.guard';
import { Admin } from 'src/admins/admin.entity';
import { GetAdmin } from 'src/admins/get-admin.decorator';
import { ArticleService } from './article.service';
import { CreateArticleDTO } from './dto/create-article.dto';

@Controller('article')
export class ArticleController {
  constructor(private articlesService: ArticleService) {}
  @UseGuards(AdminJwtAuthGuard)
  @Post('createArticle')
  @UseInterceptors(
    FileInterceptor('file', { dest: 'uploads/', preservePath: true }),
  )
  async createArticle(
    @UploadedFile() file,
    @Body() createArticleDTO: CreateArticleDTO,
    @GetAdmin() admin: any,
  ): Promise<void> {
    return this.articlesService.createArticle(createArticleDTO, file, admin);
  }
}
