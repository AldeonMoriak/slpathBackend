import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Timestamp,
} from 'typeorm';
import { Clinic } from './clinic.entity';

export enum ClinicStatus {
  Approved,
  Disabled,
  Updated,
  OnHold,
}

@Entity()
export class AboutClinic extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column()
  address: string;

  @Column()
  imageUrl: string;

  @Column()
  phoneNumber: string;

  @ManyToOne(() => Clinic, (clinic) => clinic.aboutClinic)
  clinic: Clinic;

  @Column({ default: () => 'CURRENT_TIMESTAMP', type: 'timestamp' })
  createdDateTime: Timestamp;

  @Column({ nullable: true, type: 'timestamp', onUpdate: 'CURRENT_TIMESTAMP' })
  updateDateTime: Timestamp;

  @Column({ default: ClinicStatus.OnHold })
  status: ClinicStatus;
}
