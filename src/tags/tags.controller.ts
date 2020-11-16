import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminJwtAuthGuard } from 'src/admins/admin-jwt-auth.guard';
import { Admin } from 'src/admins/admin.entity';
import { GetAdmin } from 'src/admins/get-admin.decorator';
import { CurrentUser } from 'src/interfaces/current-user.interface';
import { CreateTagDTO } from './dto/create-tag.dto';
import { EditTagDTO } from './dto/edit-tag.dto';
import TagResponse from './interfaces/tag.interface';
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
    @Body() createTagDTO: CreateTagDTO,
    @GetAdmin() admin: Admin,
  ): Promise<{ message: string }> {
    return this.tagsService.createTag(createTagDTO, admin);
  }

  @Post('editTag')
  async editTag(
    @Body() editTagDTO: EditTagDTO,
    @GetAdmin() user: CurrentUser,
  ): Promise<TagResponse> {
    return this.tagsService.editTag(editTagDTO, user);
  }

  @Delete('deleteTag/:id')
  async deleteTag(@Param() id: number): Promise<{ message: string }> {
    return this.tagsService.deleteTag(id);
  }
}
