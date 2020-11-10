import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginUserDTO } from 'src/auth/dto/login-user.dto';
import { SignupUserDTO } from 'src/auth/dto/signup-user.dto';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { Admin } from './admin.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    private usersService: UsersService,
  ) {}
  findAll(): Promise<Admin[]> {
    return this.adminRepository.find();
  }

  async getAllUsers(): Promise<User[]> {
    return this.usersService.findAll();
  }

  findOne(username: string): Promise<Admin> {
    return this.adminRepository.findOne({
      where: {
        username,
      },
    });
  }

  async signup(signupUserDTO: SignupUserDTO): Promise<any> {
    const { email, name, password, username } = signupUserDTO;
    const admin = new Admin();
    admin.email = email;
    admin.name = name;
    admin.password = await bcrypt.hash(password, await bcrypt.genSalt(10));
    admin.username = username;

    try {
      await admin.save();
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
    await this.adminRepository.update(id, { isActive: false });
  }

  async validateUserPassword(loginUserDTO: LoginUserDTO): Promise<string> {
    const { username, password } = loginUserDTO;
    const admin = await this.findOne(username);

    if (admin && (await admin.validatePassword(password)))
      return admin.username;
    else return null;
  }
}
