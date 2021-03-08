import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment as CommentEntity } from './comment.entity';
import { ArticleModule } from 'src/article/article.module';
import { AdminsModule } from 'src/admins/admins.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentEntity]),
    ArticleModule,
    AdminsModule,
  ],
  providers: [CommentsService],
  controllers: [CommentsController],
})
export class CommentsModule {}
