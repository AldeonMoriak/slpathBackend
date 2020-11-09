import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { typeOrmConfig } from './config/typeorm.config';
import { UsersModule } from './users/users.module';
import { AdminsModule } from './admins/admins.module';
import { ArticleModule } from './article/article.module';

@Module({
  imports: [AuthModule, UsersModule, TypeOrmModule.forRoot(typeOrmConfig), AdminsModule, ArticleModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
