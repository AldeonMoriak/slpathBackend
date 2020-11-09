import { Admin } from 'src/admins/admin.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  Timestamp,
} from 'typeorm';
import { Category } from './category.entity';
import { Tag } from './tag.entity';

@Entity()
export class Article extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  content: string;

  @Column()
  imageUrl: string;

  @Column()
  referenceUrl: string;

  @ManyToOne(() => Category, (category) => category.article)
  category: Category;

  @ManyToOne(() => Admin, (admin) => admin.article)
  admin: Admin;

  @Column({ default: () => 'CURRENT_TIMESTAMP', type: 'timestamp' })
  createdDateTime: Timestamp;

  @ManyToMany(() => Tag)
  @JoinTable()
  tags: Tag[];
}
