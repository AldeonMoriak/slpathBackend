import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { AdminsModule } from 'src/admins/admins.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Interest } from './category.entity';

@Module({
  imports: [AdminsModule, TypeOrmModule.forFeature([Interest])],
  providers: [CategoriesService],
  controllers: [CategoriesController],
  exports: [CategoriesService],
})
export class CategoriesModule {}
