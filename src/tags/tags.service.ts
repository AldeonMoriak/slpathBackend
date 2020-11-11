import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from 'src/admins/admin.entity';
import { Repository } from 'typeorm';
import { Tag } from './tag.entity';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  async findAll(): Promise<Tag[]> {
    return this.tagRepository.find();
  }

  async createTAg(title: string, admin: Admin): Promise<void> {
    const tag = new Tag();
    tag.title = title;
    tag.admin = admin;
    try {
      await tag.save();
    } catch (error) {
      console.log(error);
    }
  }
}
