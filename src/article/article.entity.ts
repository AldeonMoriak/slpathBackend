import { Admin } from 'src/admins/admin.entity';
import { Comment } from 'src/comments/comment.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Timestamp,
} from 'typeorm';
import { Category } from '../categories/category.entity';
import { Tag } from '../tags/tag.entity';

@Entity()
export class Article extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('text')
  content: string;

  @Column()
  imageUrl: string;

  @Column()
  thumbnailUrl: string;

  @Column({ nullable: true })
  referenceUrl?: string;

  @ManyToOne(() => Category, (category) => category.article, { nullable: true })
  category: Category;

  @ManyToOne(() => Admin, (admin) => admin.article)
  admin: Admin;

  @ManyToOne(() => Admin, (admin) => admin.article, { nullable: true })
  editor: Admin;

  @Column({ default: () => 'CURRENT_TIMESTAMP', type: 'timestamp' })
  createdDateTime: Timestamp;

  @Column({ nullable: true, type: 'timestamp' })
  updateDateTime: Timestamp;

  @ManyToMany(() => Tag, (tag) => tag.articles, {
    nullable: true,
    cascade: true,
  })
  @JoinTable()
  tags: Tag[];

  @OneToMany(() => Comment, (comment) => comment.article)
  comment: Comment;
}
