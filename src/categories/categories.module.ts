import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { AdminsModule } from 'src/admins/admins.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Interest } from './category.entity';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { SupabaseService } from 'src/supabase/supabase.service';

@Module({
  imports: [AdminsModule, TypeOrmModule.forFeature([Interest]), SupabaseModule],
  providers: [CategoriesService, SupabaseService],
  controllers: [CategoriesController],
  exports: [CategoriesService],
})
export class CategoriesModule {}
