import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminJwtAuthGuard } from 'src/admins/admin-jwt-auth.guard';
import { Admin } from 'src/admins/admin.entity';
import { GetAdmin } from 'src/admins/get-admin.decorator';
import { CreateTagDTO } from './dto/create-tag.dto';
import { EditTagDTO } from './dto/edit-tag.dto';
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
  ): Promise<void> {
    return this.tagsService.createTag(createTagDTO, admin);
  }

  @Patch('editTag')
  async editTag(@Body() editTagDTO: EditTagDTO): Promise<Tag> {
    return this.tagsService.editTag(editTagDTO);
  }

  @Delete('deleteTag/:id')
  async deleteTag(@Param() id: number): Promise<void> {
    return this.tagsService.deleteTag(id);
  }
}
