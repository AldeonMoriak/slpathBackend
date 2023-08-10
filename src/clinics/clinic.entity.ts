import { Admin } from 'src/admins/admin.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Timestamp,
} from 'typeorm';
import { AboutClinic } from './about-clinic.entity';
import { City } from './city.entity';
import { Province } from './province.entity';

@Entity()
export class Clinic extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => City)
  @JoinColumn()
  city: City;

  @OneToOne(() => Province)
  @JoinColumn()
  province: Province;

  @Column()
  medicalCouncilNumber: string;

  @Column()
  clinicCertificate: string;

  @OneToMany(() => AboutClinic, (about) => about.clinic)
  aboutClinic: AboutClinic;

  @Column({ default: () => 'CURRENT_TIMESTAMP', type: 'timestamp' })
  createdDateTime: Timestamp;

  @ManyToOne(() => Admin, (admin) => admin.clinic)
  admin: Admin;

  @Column({ default: true })
  isActive: boolean;
}
