import { Article } from '../article.entity';

export default interface ArticleInterface extends Article {
  commentCount?: number;
}
