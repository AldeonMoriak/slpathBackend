import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AdminJwtAuthGuard } from 'src/admins/admin-jwt-auth.guard';
import { Admin } from 'src/admins/admin.entity';
import { GetAdmin } from 'src/admins/get-admin.decorator';
import { CreateTag } from './dto/create-tag.dto';
import { Tag } from './tag.entity';
import { TagsService } from './tags.service';

@UseGuards(AdminJwtAuthGuard)
@Controller('tags')
export class TagsController {
  constructor(private tagsService: TagsService) {}

  @Get('getAll')
  async findAllTags(): Promise<Tag[]> {
    return this.tagsService.findAll();
  }

  @Post('createTag')
  async createTag(
    @Body() createTag: CreateTag,
    @GetAdmin() admin: Admin,
  ): Promise<void> {
    return this.tagsService.createTAg(createTag.title, admin);
  }
}
