import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminsService } from 'src/admins/admins.service';
import { CategoriesService } from 'src/categories/categories.service';
import { CurrentUser } from 'src/interfaces/current-user.interface';
import { TagsService } from 'src/tags/tags.service';
import { getConnection, getManager, Repository, Timestamp } from 'typeorm';
import { Article } from './article.entity';
import { CreateArticleDTO } from './dto/create-article.dto';
import { EditArticleDTO } from './dto/edit-article.dto';
import * as sharp from 'sharp';
import ArticleResponse from './interfaces/article.interface';
import { Category } from 'src/categories/category.entity';
import { DateTime } from 'luxon';

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
    const articles = await this.articleRepository
      .createQueryBuilder('article')
      .select()
      .leftJoin('article.admin', 'admin')
      .addSelect('admin.name')
      .addSelect('admin.profilePictureThumbnailUrl')
      .leftJoin('article.editor', 'editor')
      .addSelect('editor.name')
      .getMany();

    articles.map((article) => delete article.content);
    return articles;
  }

  async getArticle(id: number): Promise<Article> {
    console.log(id);
    const article = await this.articleRepository
      .createQueryBuilder('article')
      .select()
      .where({ id: id })
      .leftJoin('article.admin', 'admin')
      .addSelect('admin.name')
      .addSelect('admin.profilePictureThumbnailUrl')
      .leftJoin('article.editor', 'editor')
      .addSelect('editor.name')
      .leftJoinAndSelect('article.tags', 'tags')
      .leftJoinAndSelect('article.category', 'category')
      .getOne();
    if (!article) throw new NotFoundException('مقاله مورد نظر یافت نشد');
    return article;
  }

  async createArticle(
    createArticleDTO: CreateArticleDTO,
    file: any,
    user: CurrentUser,
  ): Promise<{ message: string }> {
    const admin = await this.adminsService.findOne(user.username);
    if (!admin)
      throw new UnauthorizedException('شما دسترسی به این عملیات ندارید.');
    let category: Category = null;
    if (createArticleDTO.categoryId) {
      const categoryId = JSON.parse(createArticleDTO.categoryId);
      category = await this.categoriesService.findOne(categoryId);
    }
    if (!file) throw new NotAcceptableException('لطفا یک عکس بارگزاری کنید!');
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

    article.referenceUrl = createArticleDTO.referenceUrl;
    article.imageUrl = file.filename;
    article.thumbnailUrl = 'thumbnail-' + file.filename;

    const entityManager = getManager();

    try {
      // await article.save();
      await entityManager.save(article);
    } catch (error) {
      console.log(error);
    }

    if (createArticleDTO.tags) {
      const resTags: number[] = JSON.parse(createArticleDTO.tags);
      resTags.map(async (tagId) => {
        try {
          await getConnection()
            .createQueryBuilder()
            .relation(Article, 'tags')
            .of(article)
            .add(tagId);
        } catch (error) {
          console.error(error);
        }
      });
    }

    return {
      message: 'عملیات با موفقیت انجام شد.',
    };
  }

  async editArticle(
    user: CurrentUser,
    editArticleDTO: EditArticleDTO,
    file?: any,
  ): Promise<ArticleResponse> {
    const admin = await this.adminsService.findOne(user.username);
    if (!admin)
      throw new UnauthorizedException('شما دسترسی به این عملیات ندارید.');
    const article = await this.articleRepository.findOne(editArticleDTO.id, {
      relations: ['tags'],
    });
    if (!article) throw new NotFoundException('مقاله مورد نظر یافت نشد.');
    let category: Category = null;
    if (editArticleDTO.categoryId) {
      const categoryId = JSON.parse(editArticleDTO.categoryId);
      category = await this.categoriesService.findOne(categoryId);
    }
    article.editor = admin;
    if (file) {
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
      article.imageUrl = file.path;
      article.thumbnailUrl = 'thumbnail-' + file.filename;
    }
    article.referenceUrl = editArticleDTO.referenceUrl;
    article.title = editArticleDTO.title;
    article.category = category;
    article.description = editArticleDTO.description;
    article.content = editArticleDTO.content;
    const now = DateTime.utc().toISO() as unknown;

    article.updateDateTime = now as Timestamp;

    try {
      await article.save();
    } catch (error) {
      return error;
    }
    if (editArticleDTO.tags) {
      const resTags: number[] = JSON.parse(editArticleDTO.tags);
      try {
        await getConnection()
          .createQueryBuilder()
          .relation(Article, 'tags')
          .of(article)
          .remove(article.tags);
        await getConnection()
          .createQueryBuilder()
          .relation(Article, 'tags')
          .of(article)
          .add(resTags);
      } catch (error) {
        console.error(error);
      }
    }

    return {
      message: 'عملیات با موفقیت انجام شد.',
    };
  }

  async deleteArticle(id: number): Promise<{ message: string }> {
    const article = await this.articleRepository.findOne(id);
    if (!article) throw new NotFoundException('مقاله مورد نظر یافت نشد.');
    await this.articleRepository.delete(id);
    return {
      message: 'عملیات با موفقیت انجام شد.',
    };
  }
}
