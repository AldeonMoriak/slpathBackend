import { Admin } from 'src/admins/admin.entity';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  Timestamp,
} from 'typeorm';

@Entity()
export class Interest extends BaseEntity {
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

  @ManyToOne(() => Admin, (admin) => admin.category)
  admin: Admin;

  @ManyToMany(() => Admin, (admin) => admin.categories)
  therapists: Admin[];

  @Column({ default: () => 'CURRENT_TIMESTAMP', type: 'timestamp' })
  createdDateTime: Timestamp;

  @Column({ nullable: true, type: 'timestamp', onUpdate: 'CURRENT_TIMESTAMP' })
  updateDateTime: Timestamp;
}
