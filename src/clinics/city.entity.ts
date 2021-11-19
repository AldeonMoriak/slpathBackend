import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Timestamp,
} from 'typeorm';
import { Province } from './province.entity';

@Entity()
export class City extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @ManyToOne(() => Province, (province) => province.city)
  province: Province;

  @Column()
  codeMapper: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP', type: 'timestamp' })
  createdDateTime: Timestamp;

  @Column()
  isCapital: boolean;

  @Column({ default: true })
  isActive: boolean;
}
