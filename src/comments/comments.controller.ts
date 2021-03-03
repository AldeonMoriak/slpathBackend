import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AdminJwtAuthGuard } from 'src/admins/admin-jwt-auth.guard';
import { CommentsService } from './comments.service';
import { Comment } from './comment.entity';
import { CreateCommentDTO } from './dto/create-comment.dto';
import { ResponseMessage } from 'src/interfaces/response-message.interface';
import { GetAdmin } from 'src/admins/get-admin.decorator';
import { CurrentUser } from 'src/interfaces/current-user.interface';

@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @UseGuards(AdminJwtAuthGuard)
  @Get('/getAll/:id')
  async getAllCommentsForArticle(@Param('id') id: number): Promise<Comment[]> {
    return this.commentsService.getAllCommentsForArticle(id);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('/toggleActive/:id')
  async toggleActive(@Param('id') id: number): Promise<ResponseMessage> {
    return this.commentsService.toggleActive(id);
  }

  @Post('/insertComment')
  async create(
    @Body() createCommentDTO: CreateCommentDTO,
    @GetAdmin() admin: CurrentUser,
  ): Promise<ResponseMessage> {
    return this.commentsService.create(createCommentDTO, admin);
  }
}
