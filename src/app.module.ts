import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { typeOrmConfig } from './config/typeorm.config';
import { UsersModule } from './users/users.module';
import { AdminsModule } from './admins/admins.module';

@Module({
  imports: [AuthModule, UsersModule, TypeOrmModule.forRoot(typeOrmConfig), AdminsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
