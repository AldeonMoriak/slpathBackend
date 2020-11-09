import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
}
