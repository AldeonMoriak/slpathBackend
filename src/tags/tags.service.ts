import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminsService } from 'src/admins/admins.service';
import { CurrentUser } from 'src/interfaces/current-user.interface';
import { Repository, Timestamp } from 'typeorm';
import { CreateTagDTO } from './dto/create-tag.dto';
import { EditTagDTO } from './dto/edit-tag.dto';
import TagResponse from './interfaces/tag.interface';
import { Tag } from './tag.entity';
import { DateTime } from 'luxon';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
    private adminsService: AdminsService,
  ) {}

  async findOne(id: number): Promise<Tag> {
    return this.tagRepository.findOne({ id });
  }

  async findAll(): Promise<any[]> {
    return this.tagRepository
      .createQueryBuilder('tag')
      .select()
      .leftJoin('tag.admin', 'admin')
      .addSelect('admin.name')
      .leftJoin('tag.editor', 'editor')
      .addSelect('editor.name')
      .orderBy('tag.createdDateTime', 'DESC')
      .getMany();
  }

  async createTag(
    createTagDTO: CreateTagDTO,
    user: any,
  ): Promise<{ message: string }> {
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
    return {
      message: 'عملیات با موفقیت انجام شد.',
    };
  }

  async editTag(
    editTagDTO: EditTagDTO,
    user: CurrentUser,
  ): Promise<TagResponse> {
    const tag = await this.tagRepository.findOne(
      { id: editTagDTO.id },
      {
        relations: ['admin', 'editor'],
      },
    );

    if (!tag) throw new NotFoundException('تگ مورد نظر یافت نشد.');
    const admin = await this.adminsService.findOne(user.username);
    if (!admin)
      throw new UnauthorizedException('شما به این عملیات دسترسی ندارید.');
    tag.title = editTagDTO.title;
    tag.editor = admin;

    const now = DateTime.utc().toISO() as unknown;

    tag.updateDateTime = now as Timestamp;

    try {
      await tag.save();
    } catch (error) {
      console.error(error);
    }
    delete tag.admin.password;
    delete tag.editor.password;
    delete tag.admin.email;
    delete tag.editor.email;
    delete tag.admin.createdDateTime;
    delete tag.editor.createdDateTime;
    delete tag.admin.isActive;
    delete tag.editor.isActive;
    delete tag.admin.id;
    delete tag.editor.id;
    delete tag.admin.username;
    delete tag.editor.username;

    return {
      tag,
      message: 'عملیات با موفقیت انجام شد.',
    };
  }

  async deleteTag(id: number): Promise<{ message: string }> {
    const category = await this.tagRepository.findOne({ id });
    if (!category) throw new NotFoundException('تگ مورد نظر یافت نشد.');
    await this.tagRepository.delete(id);
    return {
      message: 'عملیات با موفقیت انجام شد.',
    };
  }
}
