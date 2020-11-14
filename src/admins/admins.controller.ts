import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/interfaces/current-user.interface';
import { User } from 'src/users/user.entity';
import { AdminJwtAuthGuard } from './admin-jwt-auth.guard';
import { Admin } from './admin.entity';
import { AdminsService } from './admins.service';
import { GetAdmin } from './get-admin.decorator';

@UseGuards(AdminJwtAuthGuard)
@Controller()
export class AdminsController {
  constructor(private adminsService: AdminsService) {}

  @Get('portal/getUsers')
  async getAllUsers(): Promise<User[]> {
    return this.adminsService.getAllUsers();
  }

  @Get('admin')
  async getUser(@GetAdmin() admin: CurrentUser): Promise<{ user: Admin }> {
    const user = await this.adminsService.findOne(admin.username);
    delete user.password;
    return {
      user: user,
    };
  }
}
