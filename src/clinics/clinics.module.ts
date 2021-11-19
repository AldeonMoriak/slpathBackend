import { Module } from '@nestjs/common';
import { ClinicsService } from './clinics.service';
import { ClinicsController } from './clinics.controller';
import { AdminsModule } from 'src/admins/admins.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clinic } from './clinic.entity';

@Module({
  imports: [AdminsModule, TypeOrmModule.forFeature([Clinic])],
  providers: [ClinicsService],
  controllers: [ClinicsController],
})
export class ClinicsModule {}
