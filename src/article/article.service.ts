import {
  Injectable,
  InternalServerErrorException,
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
import { Category } from 'src/categories/category.entity';
import { DateTime } from 'luxon';
import { ResponseMessage } from 'src/interfaces/response-message.interface';
import ArticleInterface from './interfaces/article.interface';
import { Comment as CommentEntity } from 'src/comments/comment.entity';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
    private adminsService: AdminsService,
    private categoriesService: CategoriesService,
    private tagsService: TagsService,
  ) {}

  async findOne(id: number): Promise<Article> {
    return this.articleRepository.findOne(id);
  }

  async getAdminArticles(username: string): Promise<Article[]> {
    const admin = await this.adminsService.findOne(username);
    if (!admin) throw new NotFoundException('نویسنده مورد نظر یافت نشد');
    const articles = await this.articleRepository
      .createQueryBuilder('article')
      .select()
      .leftJoin('article.admin', 'admin')
      .where('admin.username = :username', { username })
      .addSelect('admin.name')
      .addSelect('admin.username')
      .addSelect('admin.description')
      .addSelect('admin.profilePictureThumbnailUrl')
      .getMany();

    articles.map((article) => delete article.content);
    return articles;
  }

  async getAllAdminArticles(user: CurrentUser): Promise<Article[]> {
    const articles = await this.articleRepository
      .createQueryBuilder('article')
      .select()
      .leftJoin('article.admin', 'admin')
      .addSelect('admin.name')
      .addSelect('admin.username')
      .addSelect('admin.profilePictureThumbnailUrl')
      .where('admin.username = :username', { username: user.username })
      .leftJoin('article.editor', 'editor')
      .addSelect('editor.name')
      .getMany();

    articles.map((article) => delete article.content);
    return articles;
  }

  async getAllArticles(): Promise<Article[]> {
    const articles = await this.articleRepository
      .createQueryBuilder('article')
      .select()
      .leftJoin('article.admin', 'admin')
      .addSelect('admin.name')
      .addSelect('admin.username')
      .addSelect('admin.profilePictureThumbnailUrl')
      .getMany();

    const fetchedArticles: ArticleInterface[] = [...articles];
    await Promise.all(
      fetchedArticles.map(async (article) => {
        delete article.content;
        const commetnsCount: {
          count: number;
        } = await this.articleRepository
          .createQueryBuilder('article')
          .innerJoin('article.comment', 'comment')
          .select('COUNT(comment.id)', 'count')
          .where('article.id = :id', { id: article.id })
          .andWhere('comment.isActive = :value', { value: true })
          .getRawOne();

        article.commentCount = commetnsCount.count;
        // article.commentCount = commetnsCount;
      }),
    );
    return articles;
  }

  async getArticle(id: number): Promise<ArticleInterface> {
    console.log(id);
    const article = await this.fetchArticle(id);
    article.views = article.views + 1;
    try {
      await article.save();
    } catch (error) {
      throw new InternalServerErrorException('خطایی رخ داده است');
    }
    return article;
  }

  async getArticleForAdmin(id: number): Promise<ArticleInterface> {
    return this.fetchArticle(id);
  }

  private async fetchArticle(id: number): Promise<ArticleInterface> {
    const article = await this.articleRepository
      .createQueryBuilder('article')
      .leftJoin('article.admin', 'admin')
      .addSelect('admin.name')
      .addSelect('admin.username')
      .addSelect('admin.profilePictureThumbnailUrl')
      .leftJoinAndSelect('article.tags', 'tags')
      .leftJoinAndSelect('article.category', 'category')
      .leftJoinAndSelect(
        'article.comment',
        'comment',
        'comment.isActive = :isActive',
        { isActive: true },
      )
      .where('article.id = :id', { id })
      .andWhere('comment.parent is Null')
      .getOne();

    if (!article) throw new NotFoundException('مقاله مورد نظر یافت نشد');
    const fetchedArticle: ArticleInterface = article;
    await Promise.all(
      fetchedArticle.comment.map(async (cmt) => {
        const replies = await getConnection()
          .createQueryBuilder()
          .select('comment')
          .from(CommentEntity, 'comment')
          .where('comment.parentId = :id', { id: cmt.id })
          .getMany();

        cmt.replies = replies;
      }),
    );

    return fetchedArticle;
  }

  async createArticle(
    createArticleDTO: CreateArticleDTO,
    file: any,
    user: CurrentUser,
  ): Promise<ResponseMessage> {
    const admin = await this.adminsService.findOne(user.username);
    if (!admin)
      throw new UnauthorizedException('شما به این عملیات دسترسی ندارید');
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
  ): Promise<ResponseMessage> {
    const admin = await this.adminsService.findOne(user.username);
    if (!admin)
      throw new UnauthorizedException('شما به این عملیات دسترسی ندارید');
    const article = await this.articleRepository.findOne(editArticleDTO.id, {
      relations: ['tags', 'admin', 'editor'],
    });
    if (!article) throw new NotFoundException('مقاله مورد نظر یافت نشد.');
    if (article.admin.username !== admin.username)
      throw new UnauthorizedException('شما نویسنده این مقاله نیستید');
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
      article.imageUrl = file.filename;
      article.thumbnailUrl = 'thumbnail-' + file.filename;
      console.log(file);
    }
    article.referenceUrl = editArticleDTO.referenceUrl;
    article.title = editArticleDTO.title;
    article.category = category;
    article.description = editArticleDTO.description;
    article.content = editArticleDTO.content;
    const now = DateTime.utc().toISO() as unknown;
    article.editor = admin;

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
        throw new InternalServerErrorException(error);
      }
    }

    return {
      message: 'عملیات با موفقیت انجام شد.',
    };
  }

  async deleteArticle(id: number): Promise<ResponseMessage> {
    const article = await this.articleRepository.findOne(id);
    if (!article) throw new NotFoundException('مقاله مورد نظر یافت نشد.');
    await this.articleRepository.delete(id);
    return {
      message: 'عملیات با موفقیت انجام شد.',
    };
  }
}
