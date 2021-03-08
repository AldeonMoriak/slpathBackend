import { Article } from '../article.entity';
import { CommentInterface } from 'src/interfaces/comment.interface';

export default interface ArticleInterface extends Article {
  commentCount?: number;
  comment: CommentInterface[];
}
