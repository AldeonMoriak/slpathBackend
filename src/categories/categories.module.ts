import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { AdminsModule } from 'src/admins/admins.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './category.entity';

@Module({
  imports: [AdminsModule, TypeOrmModule.forFeature([Category])],
  providers: [CategoriesService],
  controllers: [CategoriesController],
})
export class CategoriesModule {}
