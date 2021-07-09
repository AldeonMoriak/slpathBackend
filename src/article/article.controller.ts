import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
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
import { ResponseMessage } from 'src/interfaces/response-message.interface';
import { editFileName } from 'src/utils/edit-file-name';
import { imageFileFilter } from 'src/utils/image-file-filter';
import { Article } from './article.entity';
import { ArticleService } from './article.service';
import { CreateArticleDTO } from './dto/create-article.dto';
import { EditArticleDTO } from './dto/edit-article.dto';
import { PaginationDto } from './dto/pagination.dto';
import ArticleInterface from './interfaces/article.interface';

@Controller('articles')
export class ArticleController {
  constructor(private articlesService: ArticleService) {}

  @UseGuards(AdminJwtAuthGuard)
  @Get('getArticles')
  async getAdminAllArticles(
    @GetAdmin() admin: CurrentUser,
  ): Promise<Article[]> {
    return this.articlesService.getAllAdminArticles(admin);
  }

  @Get('getAll')
  async getAllArticles(
    @Query() paginationDTO: PaginationDto,
  ): Promise<{ data: Article[]; totalCount: number }> {
    return this.articlesService.getAllArticles(paginationDTO);
  }

  @Get('getAllFavs')
  async getAllFavArticles(
    @Query() paginationDTO: PaginationDto,
  ): Promise<{ data: Article[]; totalCount: number }> {
    return this.articlesService.getAllFavArticles(paginationDTO);
  }

  @Get('tag/:tag')
  async getAllArticlesByTag(
    @Param('tag') tag: string,
    @Query() paginationDTO: PaginationDto,
  ): Promise<Article[]> {
    return this.articlesService.getArticlesByTag(paginationDTO, tag);
  }

  @Get('/getPosts/:username')
  async getWriterArticles(
    @Param('username') username: string,
    @Query() paginationDTO: PaginationDto,
  ): Promise<{ data: ArticleInterface[]; totalCount }> {
    return this.articlesService.getWriterArticles(username, paginationDTO);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Post('createArticle')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'app/uploads/images/',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async createArticle(
    @UploadedFile() file,
    @Body() createArticleDTO: CreateArticleDTO,
    @GetAdmin() admin: CurrentUser,
  ): Promise<ResponseMessage> {
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
        destination: 'app/uploads/images/',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async editArticle(
    @GetAdmin() admin: CurrentUser,
    @Body() editArticleDTO: EditArticleDTO,
    @UploadedFile() file?,
  ): Promise<ResponseMessage> {
    return this.articlesService.editArticle(admin, editArticleDTO, file);
  }

  @Get('/getPost/:id')
  async getArticleForAdmin(
    @Param(
      'id',

      new ParseIntPipe({
        exceptionFactory() {
          return new BadRequestException('لطفا یک عدد وارد کنید');
        },
      }),
    )
    id: number,
  ): Promise<ArticleInterface> {
    return this.articlesService.getArticle(id);
  }

  @Get('/getBlogPost/:id')
  async getArticle(
    @Param(
      'id',
      new ParseIntPipe({
        exceptionFactory() {
          return new BadRequestException('لطفا یک عدد وارد کنید');
        },
      }),
    )
    id,
  ): Promise<ArticleInterface> {
    return this.articlesService.getArticleForAdmin(id);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Put('toggleArticleActivation/:id')
  async toggleArticleActivation(
    @Param(
      'id',
      new ParseIntPipe({
        exceptionFactory() {
          return new BadRequestException('لطفا یک عدد وارد کنید');
        },
      }),
    )
    id: number,
  ): Promise<ResponseMessage> {
    return this.articlesService.toggleArticleActivation(id);
  }

  @Get('image/:imgpath')
  seeUploadedFile(@Param('imgpath') image: string, @Res() res: Response) {
    return res.sendFile(image, {
      root: image.includes('thumbnail')
        ? 'app/uploads/thumbnails/'
        : 'app/uploads/images/',
    });
  }
}
