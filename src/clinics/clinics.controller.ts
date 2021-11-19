import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express/multer';
import { diskStorage } from 'multer';
import { AdminJwtAuthGuard } from 'src/admins/admin-jwt-auth.guard';
import { AdminJwtStrategy } from 'src/admins/admin-jwt.strategy';
import { GetAdmin } from 'src/admins/get-admin.decorator';
import { CurrentUser } from 'src/interfaces/current-user.interface';
import { ResponseMessage } from 'src/interfaces/response-message.interface';
import { editFileName } from 'src/utils/edit-file-name';
import { imageFileFilter } from 'src/utils/image-file-filter';
import { Clinic } from './clinic.entity';
import { ClinicsService } from './clinics.service';
import { CreateClinicDTO } from './dto/create-clinic.dto';
import { EditClinicDTO } from './dto/edit-clinic.dto';

@Controller('clinics')
export class ClinicsController {
  constructor(private clinicsService: ClinicsService) {}

  @UseGuards(AdminJwtAuthGuard)
  @Get('getClinics')
  async getAdminAllArticles(@GetAdmin() admin: CurrentUser): Promise<Clinic[]> {
    return this.clinicsService.getAllClinicsForAdmin(admin);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('getClinicForAdmin/:id')
  async getClinicForAdmin(
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
  ): Promise<Clinic> {
    return this.clinicsService.getClinicForAdmin(admin, id);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('changeClinicStatus/:id')
  async changeClinicStatus(
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
    return this.clinicsService.changeClinicStatus(admin, id);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Post('createClinic')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        {
          name: 'file',
          maxCount: 1,
        },
        {
          name: 'certificatePicture',
          maxCount: 1,
        },
      ],
      {
        storage: diskStorage({
          destination: 'uploads/images/',
          filename: editFileName,
        }),
        fileFilter: imageFileFilter,
      },
    ),
  )
  async createClinic(
    @UploadedFiles()
    files: {
      file: Express.Multer.File[];
      certificatePicture?: Express.Multer.File[];
    },
    @GetAdmin() admin: CurrentUser,
    @Body() createClinicDTO: CreateClinicDTO,
  ): Promise<ResponseMessage> {
    return this.clinicsService.createClinic(admin, createClinicDTO, files);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('getTherapistClinics')
  async getClinicsForTherapist(
    @GetAdmin() admin: CurrentUser,
  ): Promise<Clinic[]> {
    return this.clinicsService.getClinicsForTherapist(admin);
  }
  @UseGuards(AdminJwtStrategy)
  @Get('getClinic/:id')
  async getClinicForTherapist(
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
  ): Promise<Clinic> {
    return this.clinicsService.getClinicForTherapist(admin, id);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Put('editClinic')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'uploads/images/',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async editClinic(
    @GetAdmin() admin: CurrentUser,
    @UploadedFile() file: Express.Multer.File,
    @Body() editClinicDTO: EditClinicDTO,
  ): Promise<ResponseMessage> {
    return this.clinicsService.editClinic(admin, editClinicDTO, file);
  }
}
