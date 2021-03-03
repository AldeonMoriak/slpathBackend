import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { CurrentUser } from 'src/interfaces/current-user.interface';
import { User } from 'src/users/user.entity';
import { editFileName } from 'src/utils/edit-file-name';
import { imageFileFilter } from 'src/utils/image-file-filter';
import { AdminJwtAuthGuard } from './admin-jwt-auth.guard';
import { Admin } from './admin.entity';
import { AdminsService } from './admins.service';
import { EditProfileDTO } from './dto/edit-profile.dto';
import { GetAdmin } from './get-admin.decorator';
import { Response } from 'express';
import { EditAdminDTO } from './dto/edit-admin.dto';
import { ResponseMessage } from 'src/interfaces/response-message.interface';

@Controller()
export class AdminsController {
  constructor(private adminsService: AdminsService) {}

  @UseGuards(AdminJwtAuthGuard)
  @Get('portal/getUsers')
  async getAllUsers(): Promise<User[]> {
    return this.adminsService.getAllUsers();
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('getAdmins')
  async getAllAdmins(): Promise<Admin[]> {
    return this.adminsService.findAll();
  }

  @UseGuards(AdminJwtAuthGuard)
  @Put('admin/editProfile')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'uploads/profiles/',
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
        destination: 'uploads/profiles/',
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
    @Param('id') id: number,
  ): Promise<{ user: Admin }> {
    const user = await this.adminsService.findOne('', id);
    delete user.password;
    return {
      user: user,
    };
  }

  @UseGuards(AdminJwtAuthGuard)
  @Delete('admin/deleteAdmin/:id')
  async deleteAdmin(
    @GetAdmin() admin: CurrentUser,
    @Param('id') id: number,
  ): Promise<ResponseMessage> {
    this.adminsService.remove(id);
    return { message: 'عملیات موفقیت آمیز بود' };
  }

  @Get('image/:imgpath')
  seeUploadedFile(@Param('imgpath') image: string, @Res() res: Response) {
    return res.sendFile(image, {
      root: image.includes('thumbnail')
        ? 'uploads/thumbnails/'
        : 'uploads/profiles/',
    });
  }
}
