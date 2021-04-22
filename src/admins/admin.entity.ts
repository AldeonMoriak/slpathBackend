import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Article } from '../article/article.entity';
import { Interest } from '../categories/category.entity';
import { Tag } from '../tags/tag.entity';
import { User } from '../users/user.entity';

@Entity()
export class Admin extends User {
  @OneToMany(() => Interest, (category) => category.admin)
  category: Interest;

  @OneToMany(() => Article, (article) => article.admin)
  article: Article;

  @OneToMany(() => Tag, (tag) => tag.admin)
  tag: Tag;

  @ManyToOne(() => Admin, (admin) => admin.id)
  createdBy: Admin;

  @Column('text', { nullable: true })
  description?: string;

  @Column('text', { nullable: true })
  clinicAddress?: string;

  @Column({ nullable: true, length: 11 })
  mobileNumber?: string;

  @Column({ nullable: true, length: 12 })
  whatsappId?: string;

  @Column({ nullable: true })
  telegramUsername?: string;

  @Column({ nullable: true })
  instagramUsername?: string;

  @Column({ nullable: true })
  linkedinId?: string;

  @ManyToMany(() => Interest, (interest) => interest.therapists)
  @JoinTable({ name: 'therapist_interest' })
  categories: Interest[];

  @Column()
  occupation: string;
}
