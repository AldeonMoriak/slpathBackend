import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginUserDTO } from 'src/auth/dto/login-user.dto';
import { Repository } from 'typeorm';
import { Admin } from './admin.entity';

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
  ) {}
  findAll(): Promise<Admin[]> {
    return this.adminRepository.find();
  }

  findOne(username: string): Promise<Admin> {
    return this.adminRepository.findOne({
      where: {
        username,
      },
    });
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
