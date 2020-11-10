import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/users/user.entity';
import { AdminsService } from './admins.service';

@Controller()
export class AdminsController {
  constructor(private adminsService: AdminsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('portal/getUsers')
  async getAllUsers(): Promise<User[]> {
    console.log('here');
    return this.adminsService.getAllUsers();
  }
}
