import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminsService } from 'src/admins/admins.service';
import { CurrentUser } from 'src/interfaces/current-user.interface';
import { UsersService } from 'src/users/users.service';
import { jwtConstants } from './constants';
import { LoginUserDTO } from './dto/login-user.dto';
import { SignupUserDTO } from './dto/signup-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private adminsService: AdminsService,
  ) {}

  async signup(signupUserDTO: SignupUserDTO): Promise<any> {
    return this.usersService.signup(signupUserDTO);
  }

  async adminSignup(
    singupUserDTO: SignupUserDTO,
    file: any,
    user: CurrentUser,
  ): Promise<{ message: string } | Error> {
    return this.adminsService.signup(singupUserDTO, file, user);
  }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && user.password === pass) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async adminLogin(payload: LoginUserDTO) {
    const admin = await this.adminsService.findOne(payload.username);
    if (!admin)
      throw new UnauthorizedException('نام کاربری یا رمز عبور اشتباه است.');
    if (!admin.isActive)
      throw new UnauthorizedException('حساب کاربری غیرفعال شده است');
    if (!(await admin.validatePassword(payload.password)))
      throw new UnauthorizedException('نام کاربری یا رمز عبور اشتباه است.');

    const info = { username: admin.username, sub: admin.id, isAdmin: true };
    return {
      message: 'عملیات با موفقیت انجام شد',
      access_token: this.jwtService.sign(info, {
        secret: jwtConstants.adminSecret,
        audience: 'admin',
      }),
    };
  }

  async login(user: LoginUserDTO) {
    const payload = { username: user.username, sub: user.password };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
