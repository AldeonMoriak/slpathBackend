import {
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  ValidationPipe,
  Body,
} from '@nestjs/common';
import { Roles } from 'src/admins/roles.decorator';
import { AuthService } from './auth.service';
import { LoginUserDTO } from './dto/login-user.dto';
import { SignupUserDTO } from './dto/signup-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('admin/create')
  @Roles('admin')
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
  ): Promise<{ access_token: string }> {
    return this.authService.adminLogin(loginUserDTO);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  getUser(@Request() req) {
    return req.user;
  }
}
