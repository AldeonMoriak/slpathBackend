import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { CurrentUser } from 'src/interfaces/current-user.interface';
import { ResponseMessage } from 'src/interfaces/response-message.interface';
import { User } from 'src/users/user.entity';
import { editFileName } from 'src/utils/edit-file-name';
import { imageFileFilter } from 'src/utils/image-file-filter';
import { AdminJwtAuthGuard } from './admin-jwt-auth.guard';
import { Admin } from './admin.entity';
import { AdminsService } from './admins.service';
import { EditAdminDTO } from './dto/edit-admin.dto';
import { EditProfileDTO } from './dto/edit-profile.dto';
import { GetAdmin } from './get-admin.decorator';

@Controller()
export class AdminsController {
  constructor(private adminsService: AdminsService) {}

  @Get('/getTherapists')
  async getAllTherapists(): Promise<User[]> {
    return this.adminsService.getAllTherapists();
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('getAdmins')
  async getAllAdmins(@GetAdmin() admin: CurrentUser): Promise<Admin[]> {
    return this.adminsService.findAll(admin);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Put('admin/editProfile')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'app/dist/uploads/profiles/',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async editAdminProfile(
    @GetAdmin() admin: CurrentUser,
    @UploadedFile() file,
    @Body() editProfileDTO: EditProfileDTO,
  ): Promise<ResponseMessage> {
    return this.adminsService.editProfile(editProfileDTO, file, admin);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Put('admin/editAdmin')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'app/dist/uploads/profiles/',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async editAdmin(
    @GetAdmin() admin: CurrentUser,
    @UploadedFile() file,
    @Body() editAdminDTO: EditAdminDTO,
  ): Promise<ResponseMessage> {
    return this.adminsService.editAdmin(editAdminDTO, file, admin);
  }

  @Get('getTherapist/:username')
  async getTherapist(
    @Param('username') username: string,
  ): Promise<{ user: Admin }> {
    const user = await this.adminsService.findOne(username);
    delete user.password;
    return {
      user: user,
    };
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('admin/getProfile')
  async getUser(@GetAdmin() admin: CurrentUser): Promise<{ user: Admin }> {
    const user = await this.adminsService.findOne(admin.username);
    delete user.password;
    return {
      user: user,
    };
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('admin/getAdmin/:id')
  async getAdmin(
    @GetAdmin() admin: CurrentUser,
    @Param(
      'id',
      new ParseIntPipe({
        exceptionFactory() {
          return new BadRequestException('لطفا یک عدد وارد کنید');
        },
      }),
    )
    id: number,
  ): Promise<{ user: Admin }> {
    const user = await this.adminsService.findOne('', id);
    delete user.password;
    return {
      user: user,
    };
  }

  @UseGuards(AdminJwtAuthGuard)
  @Put('admin/toggleAdminActivation/:id')
  async toggleAdminActivation(
    @GetAdmin() admin: CurrentUser,
    @Param(
      'id',

      new ParseIntPipe({
        exceptionFactory() {
          return new BadRequestException('لطفا یک عدد وارد کنید');
        },
      }),
    )
    id: number,
  ): Promise<ResponseMessage> {
    return this.adminsService.toggleAdminActivation(id, admin);
  }

  @Get('image/:imgpath')
  seeUploadedFile(@Param('imgpath') image: string, @Res() res: Response) {
    return res.sendFile(image, {
      root: image.includes('thumbnail')
        ? 'app/dist/uploads/thumbnails/'
        : 'app/dist/uploads/profiles/',
    });
  }
}
