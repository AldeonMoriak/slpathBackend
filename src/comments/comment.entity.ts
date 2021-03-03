import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Timestamp,
} from 'typeorm';
import { Article } from '../article/article.entity';

@Entity()
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  creator: string;

  @ManyToOne(() => Article, (article) => article.comment)
  article: Article;

  @Column()
  email: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP', type: 'timestamp' })
  createdDateTime: Timestamp;

  @Column('text')
  content: string;

  @ManyToOne(() => Comment, (comment) => comment.id, { nullable: true })
  parent: Comment;

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: false })
  isAdmin: boolean;
}
