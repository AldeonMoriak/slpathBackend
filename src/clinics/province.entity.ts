import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Timestamp,
} from 'typeorm';
import { City } from './city.entity';

@Entity()
export class Province extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  codemapper: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP', type: 'timestamp' })
  createddatetime: Timestamp;

  @Column({ default: true })
  isactive: boolean;

  @OneToMany(() => City, (city) => city.province)
  city: City;
}
