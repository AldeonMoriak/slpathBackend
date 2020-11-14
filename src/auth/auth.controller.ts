import {
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  ValidationPipe,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDTO } from './dto/login-user.dto';
import { SignupUserDTO } from './dto/signup-user.dto';
import { AdminJwtAuthGuard } from '../admins/admin-jwt-auth.guard';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('auth/login')
  async login(@Body(ValidationPipe) LoginUserDTO: LoginUserDTO) {
    return this.authService.login(LoginUserDTO);
  }

  @Post('admin/create')
  async create(@Body() signupUserDTO: SignupUserDTO) {
    this.authService.adminSignup(signupUserDTO);
  }

  @Post('auth/signup')
  async signup(
    @Body(ValidationPipe) signupUserDTO: SignupUserDTO,
  ): Promise<any> {
    return this.authService.signup(signupUserDTO);
  }

  @Post('portal/login')
  async adminLogin(
    @Body(ValidationPipe) loginUserDTO: LoginUserDTO,
  ): Promise<{ message: string; access_token: string }> {
    return this.authService.adminLogin(loginUserDTO);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('user')
  getUser(@Request() req) {
    return req.user;
  }
}
