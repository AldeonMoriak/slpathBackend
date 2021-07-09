import {
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDTO } from './dto/login-user.dto';
import { SignupUserDTO } from './dto/signup-user.dto';
import { AdminJwtAuthGuard } from '../admins/admin-jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName } from 'src/utils/edit-file-name';
import { imageFileFilter } from 'src/utils/image-file-filter';
import { GetAdmin } from 'src/admins/get-admin.decorator';
import { CurrentUser } from 'src/interfaces/current-user.interface';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('auth/login')
  async login(@Body() loginUserDTO: LoginUserDTO) {
    return this.authService.login(loginUserDTO);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Post('admin/create')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'uploads/images/',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async create(
    @UploadedFile() file,
    @Body() signupUserDTO: SignupUserDTO,
    @GetAdmin() admin: CurrentUser,
  ) {
    return this.authService.adminSignup(signupUserDTO, file, admin);
  }

  @Post('auth/signup')
  async signup(@Body() signupUserDTO: SignupUserDTO): Promise<any> {
    return this.authService.signup(signupUserDTO);
  }

  @Post('portal/login')
  async adminLogin(
    @Body() loginUserDTO: LoginUserDTO,
  ): Promise<{ message: string; access_token: string }> {
    return this.authService.adminLogin(loginUserDTO);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('user')
  getUser(@Request() req) {
    return req.user;
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('auth/logout')
  logout() {
    return { message: 'خروج با موفقیت انجام شد' };
  }
}
