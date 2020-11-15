import { Admin } from 'src/admins/admin.entity';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Timestamp,
} from 'typeorm';
import { Article } from '../article/article.entity';

@Entity()
export class Category extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @ManyToOne(() => Admin, (admin) => admin.category)
  admin: Admin;

  @ManyToOne(() => Admin, (admin) => admin.category)
  editor: Admin;

  @OneToMany(() => Article, (article) => article.category)
  article: Article;

  @Column({ default: () => 'CURRENT_TIMESTAMP', type: 'timestamp' })
  createdDateTime: Timestamp;

  @Column({ nullable: true, type: 'timestamp' })
  updateDateTime: Timestamp;
}
