import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminsModule } from 'src/admins/admins.module';
import { CategoriesModule } from 'src/categories/categories.module';
import { TagsModule } from 'src/tags/tags.module';
import { ArticleController } from './article.controller';
import { Article } from './article.entity';
import { ArticleService } from './article.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article]),
    AdminsModule,
    CategoriesModule,
    TagsModule,
  ],
  controllers: [ArticleController],
  providers: [ArticleService],
})
export class ArticleModule {}
