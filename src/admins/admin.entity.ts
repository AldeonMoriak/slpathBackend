import { Article } from '../article/article.entity';
import { Category } from '../categories/category.entity';
import { Tag } from '../tags/tag.entity';
import { User } from '../users/user.entity';
import { Entity, OneToMany } from 'typeorm';

@Entity()
export class Admin extends User {
  @OneToMany(() => Category, (category) => category.admin)
  category: Category;

  @OneToMany(() => Article, (article) => article.admin)
  article: Article;

  @OneToMany(() => Tag, (tag) => tag.admin)
  tag: Tag;
}
