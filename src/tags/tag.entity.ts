import { Admin } from '../admins/admin.entity';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  Timestamp,
} from 'typeorm';
import { Article } from 'src/article/article.entity';

@Entity()
export class Tag extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @ManyToOne(() => Admin, (admin) => admin.tag)
  admin: Admin;

  @ManyToOne(() => Admin, (admin) => admin.tag)
  editor: Admin;

  @Column({ default: () => 'CURRENT_TIMESTAMP', type: 'timestamp' })
  createdDateTime: Timestamp;

  @Column({ nullable: true, type: 'timestamp' })
  updateDateTime: Timestamp;

  @ManyToMany(() => Article, (article) => article.tags, { nullable: true })
  articles: Article[];
}
