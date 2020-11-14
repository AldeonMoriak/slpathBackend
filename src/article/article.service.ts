import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminsService } from 'src/admins/admins.service';
import { CategoriesService } from 'src/categories/categories.service';
import { CurrentUser } from 'src/interfaces/current-user.interface';
import { TagsService } from 'src/tags/tags.service';
import { Repository } from 'typeorm';
import { Article } from './article.entity';
import { CreateArticleDTO } from './dto/create-article.dto';
import { EditArticleDTO } from './dto/edit-article.dto';
import * as sharp from 'sharp';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
    private adminsService: AdminsService,
    private categoriesService: CategoriesService,
    private tagsService: TagsService,
  ) {}

  async getAllArticles(): Promise<Article[]> {
    const articles = await this.articleRepository.find();
    articles.map((article) => delete article.content);
    return articles;
  }

  async createArticle(
    createArticleDTO: CreateArticleDTO,
    file: any,
    user: CurrentUser,
  ): Promise<void> {
    const admin = await this.adminsService.findOne(user.username);
    if (!admin)
      throw new UnauthorizedException('شما دسترسی به این عملیات ندارید.');
    let category = null;
    if (createArticleDTO.categoryId) {
      category = await this.categoriesService.findOne(
        createArticleDTO.categoryId,
      );
    }
    const tags = [];
    if (createArticleDTO.tags) {
      createArticleDTO.tags.map(async (tagId) => {
        const tag = await this.tagsService.findOne(tagId);
        tags.push(tag);
      });
    }
    if (!file) throw new UnauthorizedException('لطفا یک عکس بارگزاری کنید!');
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
    const article = new Article();
    article.title = createArticleDTO.title;
    article.description = createArticleDTO.description;
    article.content = createArticleDTO.content;
    article.admin = admin;
    article.category = category;
    article.tags = tags;
    article.imageUrl = file.filename;
    article.thumbnailUrl = 'thumbnail-' + file.filename;

    try {
      await article.save();
    } catch (error) {
      console.log(error);
    }
  }

  async editArticle(
    editArticleDTO: EditArticleDTO,
    file: any,
    user: CurrentUser,
  ): Promise<Article> {
    const admin = await this.adminsService.findOne(user.username);
    if (!admin)
      throw new UnauthorizedException('شما دسترسی به این عملیات ندارید.');
    const article = await this.articleRepository.findOne(editArticleDTO.id);
    if (!article) throw new NotFoundException('مقاله مورد نظر یافت نشد.');
    let category = null;
    if (editArticleDTO.categoryId) {
      category = await this.categoriesService.findOne(
        editArticleDTO.categoryId,
      );
    }
    const tags = [];
    if (editArticleDTO.tags) {
      editArticleDTO.tags.map(async (tagId) => {
        const tag = await this.tagsService.findOne(tagId);
        tags.push(tag);
      });
    }

    article.editor = admin;
    article.imageUrl = file.path;
    article.referenceUrl = editArticleDTO.referenceUrl;
    article.title = editArticleDTO.title;
    article.tags = tags;
    article.category = category;
    article.description = editArticleDTO.description;
    article.content = editArticleDTO.content;

    try {
      await article.save();
    } catch (error) {
      return error;
    }

    return article;
  }

  async deleteArticle(id: number): Promise<void> {
    const article = await this.articleRepository.findOne(id);
    if (!article) throw new NotFoundException('مقاله مورد نظر یافت نشد.');
    await this.articleRepository.delete(id);
  }
}
