import { Controller, Get, UseGuards } from '@nestjs/common';
import { User } from 'src/users/user.entity';
import { AdminJwtAuthGuard } from './admin-jwt-auth.guard';
import { AdminsService } from './admins.service';

@UseGuards(AdminJwtAuthGuard)
@Controller()
export class AdminsController {
  constructor(private adminsService: AdminsService) {}

  @Get('portal/getUsers')
  async getAllUsers(): Promise<User[]> {
    return this.adminsService.getAllUsers();
  }
}
