import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminJwtAuthGuard } from 'src/admins/admin-jwt-auth.guard';
import { CommentsService } from './comments.service';
import { Comment as CommentEntity } from './comment.entity';
import { CreateCommentDTO } from './dto/create-comment.dto';
import { ResponseMessage } from 'src/interfaces/response-message.interface';
import { GetAdmin } from 'src/admins/get-admin.decorator';
import { CurrentUser } from 'src/interfaces/current-user.interface';

@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @UseGuards(AdminJwtAuthGuard)
  @Get('/getAll/:id')
  async getAllCommentsForArticle(
    @Param(
      'id',
      new ParseIntPipe({
        exceptionFactory(error: string) {
          return new BadRequestException('لطفا یک عدد وارد کنید');
        },
      }),
    )
    id: number,
  ): Promise<CommentEntity[]> {
    const comments = await this.commentsService.getAllCommentsForArticle(id);
    return comments;
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('/toggleActive/:id')
  async toggleActive(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseMessage> {
    return this.commentsService.toggleActive(id);
  }

  @Post('/insertComment')
  async create(
    @Body() createCommentDTO: CreateCommentDTO,
    @GetAdmin() admin: CurrentUser,
  ): Promise<ResponseMessage> {
    return this.commentsService.create(createCommentDTO, admin);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Post('/insertCommentForAdmin')
  async createCommentForAdmin(
    @Body() createCommentDTO: CreateCommentDTO,
    @GetAdmin() admin: CurrentUser,
  ): Promise<ResponseMessage> {
    return this.commentsService.create(createCommentDTO, admin);
  }
}
