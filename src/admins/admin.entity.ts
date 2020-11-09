import { User } from 'src/users/user.entity';
import { Entity } from 'typeorm';

@Entity()
export class Admin extends User {}
