import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminsService } from 'src/admins/admins.service';
import { Repository } from 'typeorm';
import { CreateTagDTO } from './dto/create-tag.dto';
import { EditTagDTO } from './dto/edit-tag.dto';
import { Tag } from './tag.entity';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
    private adminsService: AdminsService,
  ) {}

  async findOne(id: number): Promise<Tag> {
    return this.tagRepository.findOne(id);
  }

  async findAll(): Promise<Tag[]> {
    return this.tagRepository.find();
  }

  async createTag(createTagDTO: CreateTagDTO, user: any): Promise<void> {
    const admin = await this.adminsService.findOne(user.username);
    if (!admin)
      throw new UnauthorizedException(
        'شما مجاز به انجام این عملیات نمی باشید.',
      );
    const tag = new Tag();
    tag.title = createTagDTO.title;
    tag.admin = admin;
    try {
      await tag.save();
    } catch (error) {
      console.log(error);
    }
  }

  async editTag(editTagDTO: EditTagDTO): Promise<Tag> {
    const tag = await this.tagRepository.findOne(editTagDTO.id);
    if (!tag) throw new NotFoundException('تگ مورد نظر یافت نشد.');
    tag.title = editTagDTO.title;

    try {
      tag.save();
    } catch (error) {
      console.error(error);
    }
    return tag;
  }

  async deleteTag(id: number): Promise<void> {
    const category = await this.tagRepository.findOne(id);
    if (!category) throw new NotFoundException('تگ مورد نظر یافت نشد.');
    await this.tagRepository.delete(id);
  }
}
