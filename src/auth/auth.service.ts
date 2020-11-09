import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminsService } from 'src/admins/admins.service';
import { UsersService } from 'src/users/users.service';
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

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && user.password === pass) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async adminLogin(payload: any) {
    const admin = await this.adminsService.findOne(payload.username);
    if (!admin)
      throw new UnauthorizedException('نام کاربری یا رمز عبور اشتباه است.');
    if (payload.password !== admin.password)
      throw new UnauthorizedException('نام کاربری یا رمز عبور اشتباه است.');
    if (!admin.isActive)
      throw new UnauthorizedException('اکانت غیرفعال شده است');

    const info = { username: admin.username, sub: admin.id, isAdmin: true };
    return {
      access_token: this.jwtService.sign(info),
    };
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
