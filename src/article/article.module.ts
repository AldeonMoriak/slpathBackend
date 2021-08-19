import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminsModule } from 'src/admins/admins.module';
import { CategoriesModule } from 'src/categories/categories.module';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { SupabaseService } from 'src/supabase/supabase.service';
import { TagsModule } from 'src/tags/tags.module';
import { ArticleController } from './article.controller';
import { Article } from './article.entity';
import { ArticleService } from './article.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article]),
    AdminsModule,
    TagsModule,
    CategoriesModule,
    SupabaseModule,
  ],
  controllers: [ArticleController],
  providers: [ArticleService, SupabaseService],
  exports: [ArticleService],
})
export class ArticleModule {}
