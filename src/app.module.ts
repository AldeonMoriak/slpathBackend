import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { typeOrmConfig } from './config/typeorm.config';
import { UsersModule } from './users/users.module';
import { AdminsModule } from './admins/admins.module';
import { ArticleModule } from './article/article.module';
import { CategoriesModule } from './categories/categories.module';
import { TagsModule } from './tags/tags.module';
import { CommentsModule } from './comments/comments.module';
import { SupabaseModule } from './supabase/supabase.module';
import { ClinicsModule } from './clinics/clinics.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    TypeOrmModule.forRoot(typeOrmConfig),
    AdminsModule,
    ArticleModule,
    CategoriesModule,
    TagsModule,
    CommentsModule,
    SupabaseModule,
    ClinicsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
