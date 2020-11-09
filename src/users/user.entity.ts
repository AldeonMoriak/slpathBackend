import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Timestamp,
  Unique,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity()
@Unique(['username', 'email'])
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  username: string;
  @Column()
  password: string;
  @Column()
  email: string;
  @Column({ default: true })
  isActive: boolean;
  @Column({ default: () => 'CURRENT_TIMESTAMP', type: 'timestamp' })
  createdDateTime: Timestamp;

  async validatePassword(password: string): Promise<boolean> {
    let hash: boolean;
    try {
      hash = await bcrypt.compare(password, this.password);
    } catch (error) {
      console.log(error);
    }
    return hash;
  }
}
