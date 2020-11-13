import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminsService } from 'src/admins/admins.service';
import { CategoriesService } from 'src/categories/categories.service';
import { TagsService } from 'src/tags/tags.service';
import { Repository } from 'typeorm';
import { Article } from './article.entity';
import { CreateArticleDTO } from './dto/create-article.dto';

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
    return this.articleRepository.find();
  }

  async createArticle(
    createArticleDTO: CreateArticleDTO,
    file: any,
    user: any,
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
    console.log(file);
    const article = new Article();
    article.title = createArticleDTO.title;
    article.description = createArticleDTO.description;
    article.content = createArticleDTO.content;
    article.admin = admin;
    article.category = category;
    article.tags = tags;
    article.imageUrl = file.path;

    try {
      await article.save();
    } catch (error) {
      console.log(error);
    }
  }
}
