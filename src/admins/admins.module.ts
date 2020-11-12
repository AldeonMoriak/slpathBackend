import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { jwtConstants } from 'src/auth/constants';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { AdminJwtStrategy } from './admin-jwt.strategy';
import { Admin } from './admin.entity';
import { AdminsController } from './admins.controller';
import { AdminsService } from './admins.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin]),
    UsersModule,
    JwtModule.register({
      secret: jwtConstants.adminSecret,
      signOptions: { expiresIn: '60m', audience: 'admin' },
    }),
  ],
  controllers: [AdminsController],
  providers: [AdminsService, AdminJwtStrategy, UsersService],
  exports: [TypeOrmModule, AdminsService],
})
export class AdminsModule {}
