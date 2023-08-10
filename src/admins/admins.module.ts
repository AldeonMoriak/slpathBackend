import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { jwtConstants } from 'src/auth/constants';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { SupabaseService } from 'src/supabase/supabase.service';
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
      signOptions: { expiresIn: '6m', audience: 'admin' },
    }),
    SupabaseModule,
  ],
  controllers: [AdminsController],
  providers: [AdminsService, AdminJwtStrategy, UsersService, SupabaseService],
  exports: [TypeOrmModule, AdminsService],
})
export class AdminsModule {}
