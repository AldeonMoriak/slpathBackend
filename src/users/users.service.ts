import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SignupUserDTO } from 'src/auth/dto/signup-user.dto';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find();
    users.map((user) => delete user.password);
    return users;
  }

  findOne(username: string): Promise<User> {
    return this.userRepository.findOne({
      where: {
        username,
      },
    });
  }

  async signup(signupUserDTO: SignupUserDTO): Promise<any> {
    const { email, name, password, username } = signupUserDTO;
    const user = new User();
    user.email = email;
    user.name = name;
    user.password = await bcrypt.hash(password, await bcrypt.genSalt(10));
    user.username = username;

    try {
      await user.save();
    } catch (error) {
      if (error.errno === 1062) {
        throw new ConflictException('این کاربر قبلا ثبت نام کرده است.');
      }
      throw new InternalServerErrorException();
    }

    return {
      message: 'عملیات موفقیت آمیز بود.',
    };
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.update(id, { isActive: false });
  }
}
