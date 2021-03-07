import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminsService } from 'src/admins/admins.service';
import { ArticleService } from 'src/article/article.service';
import { CommentInterface } from 'src/interfaces/comment.interface';
import { CurrentUser } from 'src/interfaces/current-user.interface';
import { ResponseMessage } from 'src/interfaces/response-message.interface';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { CreateCommentDTO } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    private articleService: ArticleService,
    private adminsService: AdminsService,
  ) {}

  async getAllCommentsForArticle(id: number): Promise<CommentInterface[]> {
    const comments = await this.commentRepository
      .createQueryBuilder('comment')
      .innerJoin('comment.article', 'article')
      .addSelect('article.id')
      .where('article.id = :id', { id })
      .andWhere('comment.parent is NULL')
      .getMany();

    const commentsWithReplies: CommentInterface[] = [...comments];
    await Promise.all(
      commentsWithReplies.map(async (cmt, index) => {
        // commentsWithReplies[index].replies = [];
        commentsWithReplies[
          index
        ].replies = await this.commentRepository
          .createQueryBuilder('comment')
          .innerJoin('comment.parent', 'parent')
          .addSelect('parent.id')
          .where('parent.id = :id', { id: cmt.id })
          .getMany();
      }),
    );
    return commentsWithReplies;
  }

  async toggleActive(id: number): Promise<ResponseMessage> {
    const comment = await this.commentRepository.findOne(id);
    try {
      this.commentRepository.update({ id }, { isActive: !comment.isActive });
    } catch (error) {
      throw new InternalServerErrorException('مشکلی پیش آمده است');
    }
    return { message: 'عملیات موفقیت آمیز بود' };
  }

  async create(
    createCommentDTO: CreateCommentDTO,
    user: CurrentUser,
  ): Promise<ResponseMessage> {
    const { articleId, name, content, email, parentId } = createCommentDTO;

    const article = await this.articleService.findOne(articleId);
    if (!article) throw new NotFoundException('مقاله مورد نظر یافت نشد');
    const comment = new Comment();
    comment.email = email;
    comment.article = article;
    comment.content = content;
    comment.creator = name;

    if (parentId) {
      const parent = await this.commentRepository.findOne(parentId);
      if (user) {
        const admin = await this.adminsService.findOne(user.username);
        comment.isAdmin = admin ? true : false;
        comment.isActive = admin ? true : false;
      }
      comment.parent = parent;
    }

    try {
      await comment.save();
    } catch (error) {
      throw new InternalServerErrorException('مشکلی پیش آمده است');
    }
    return { message: 'عملیات موفقیت آمیز بود.' };
  }
}
