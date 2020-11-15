import { Article } from '../article.entity';

export default interface ArticleResponse {
  article: Article;
  message: string;
}
