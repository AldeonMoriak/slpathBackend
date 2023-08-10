import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminsService } from 'src/admins/admins.service';
import { CurrentUser } from 'src/interfaces/current-user.interface';
import { ResponseMessage } from 'src/interfaces/response-message.interface';
import { getRepository, Repository } from 'typeorm';
import { AboutClinic } from './about-clinic.entity';
import { City } from './city.entity';
import { Clinic } from './clinic.entity';
import { CreateClinicDTO } from './dto/create-clinic.dto';
import { EditClinicDTO } from './dto/edit-clinic.dto';
import { Province } from './province.entity';

@Injectable()
export class ClinicsService {
  constructor(
    @InjectRepository(Clinic)
    private clinicRepository: Repository<Clinic>,
    private adminsService: AdminsService,
  ) {}

  async getAllClinicsForAdmin(user: CurrentUser): Promise<Clinic[]> {
    const admin = await this.adminsService.findOne(user.username);
    if (!admin || !admin.isSuperAdmin)
      throw new UnauthorizedException('شما به این عملیات دسترسی ندارید');
    const clinics = await this.clinicRepository
      .createQueryBuilder('clinic')
      // .where('clinic.isActive = :isActive', { isActive: true })
      .orderBy('clinic.createdDateTime', 'DESC')
      .getMany();
    if (!clinics) throw new NotFoundException('مورد یافت نشد.');
    return clinics;
  }

  async getClinicForAdmin(user: CurrentUser, id: number): Promise<Clinic> {
    const admin = await this.adminsService.findOne(user.username);
    if (!admin || !admin.isSuperAdmin)
      throw new UnauthorizedException('شما به این عملیات دسترسی ندارید');
    const clinic = await this.clinicRepository
      .createQueryBuilder('clinic')
      .where('clinic.id = :id', { id })
      .innerJoinAndSelect('clinic.aboutClinic', 'aboutClinic')
      .getOne();
    if (!clinic) throw new NotFoundException('مورد یافت نشد.');
    return clinic;
  }

  async changeClinicStatus(
    user: CurrentUser,
    id: number,
  ): Promise<ResponseMessage> {
    const admin = await this.adminsService.findOne(user.username);
    if (!admin || !admin.isSuperAdmin) {
      throw new UnauthorizedException('شما به این عملیات دسترسی ندارید');
    }
    const clinic = await this.clinicRepository.findOne({ where: { id } });
    if (!clinic) throw new NotFoundException('مورد یافت نشد.');
    clinic.isActive = !clinic.isActive;

    try {
      clinic.save();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
    return { message: 'عملیات موفقیت آمیز بود.' };
  }

  async createClinic(
    user: CurrentUser,
    createClinicDTO: CreateClinicDTO,
    files: {
      file: Express.Multer.File[];
      certificatePicture?: Express.Multer.File[];
    },
  ): Promise<ResponseMessage> {
    const admin = await this.adminsService.findOne(user.username);
    if (!admin)
      throw new UnauthorizedException('شما به این عملیات دسترسی ندارید');
    const isClinicAlreadySaved = await this.clinicRepository.find({
      where: { medicalCouncilNumber: createClinicDTO.medicalCouncilNumber },
    });

    if (isClinicAlreadySaved)
      throw new ConflictException('کلینیک مورد نظر قبلا ثبت شده است');

    const clinic = new Clinic();
    clinic.admin = admin;
    const aboutClinic = new AboutClinic();
    aboutClinic.address = createClinicDTO.address;
    aboutClinic.description = createClinicDTO.description;
    aboutClinic.phoneNumber = createClinicDTO.phoneNumber;
    aboutClinic.name = createClinicDTO.name;
    if (files) {
      //TODO implement saving image
      //aboutClinic.imageUrl =
    }
    try {
      await aboutClinic.save();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }

    const province = await getRepository(Province)
      .createQueryBuilder('province')
      .where('province.id = :id', { id: createClinicDTO.province })
      .getOne();

    if (!province) throw new NotFoundException('استان انتخابی یافت نشد');

    const city = await getRepository(City)
      .createQueryBuilder('city')
      .where('city.id = :id', { id: createClinicDTO.city })
      .getOne();
    if (!city) throw new NotFoundException('شهر انتخابی یافت نشد');
    clinic.aboutClinic = aboutClinic;
    clinic.city = city;
    clinic.province = province;
    if (createClinicDTO.medicalCouncilNumber) {
      clinic.medicalCouncilNumber = createClinicDTO.medicalCouncilNumber;
    } else if (files.certificatePicture) {
      // TODO use sharp here for the pictures
      //clinic.clinicCertificate = certificatePicture;
    } else {
      throw new NotAcceptableException(
        'لطفا مجوز یا کد نظام وظیفه خود را وارد کنید.',
      );
    }

    try {
      await clinic.save();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }

    return { message: 'عملیات موفقیت آمیز بود' };
  }

  async getClinicsForTherapist(user: CurrentUser): Promise<Clinic[]> {
    const admin = await this.adminsService.findOne(user.username);
    if (!admin) {
      throw new UnauthorizedException('شما به این عملیات دسترسی ندارید');
    }

    const clinics = await this.clinicRepository.find({
      where: {
        admin,
      },
    });

    if (!clinics) {
      throw new NotFoundException('موردی یافت نشد');
    }

    return clinics;
  }

  async getClinicForTherapist(user: CurrentUser, id: number): Promise<Clinic> {
    const admin = await this.adminsService.findOne(user.username);

    if (!admin) {
      throw new UnauthorizedException('شما به این عملیات دسترسی ندارید');
    }

    const clinic = await this.clinicRepository.findOne({
      where: {
        admin,
        id,
      },
    });
    if (!clinic) {
      throw new NotFoundException('موردی یافت نشد');
    }
    return clinic;
  }

  async editClinic(
    user: CurrentUser,
    editClinicDTO: EditClinicDTO,
    profilePicture: Express.Multer.File,
  ): Promise<ResponseMessage> {
    const admin = await this.adminsService.findOne(user.username);

    if (!admin) {
      throw new UnauthorizedException('شما به این عملیات دسترسی ندارید');
    }

    const clinic = await this.clinicRepository.findOne({
      where: {
        admin,
        id: editClinicDTO.id,
      },
    });
    if (!clinic) {
      throw new NotFoundException('موردی یافت نشد');
    }

    if (clinic.admin.username !== admin.username) {
      throw new UnauthorizedException('شما به این عملیات دسترسی ندارید');
    }

    const about = new AboutClinic();
    about.address = editClinicDTO.address;
    about.clinic = clinic;
    about.description = editClinicDTO.description;
    about.name = editClinicDTO.name;
    about.phoneNumber = editClinicDTO.phoneNumber;

    // TODO handle profile image here
    if (profilePicture) {
    }

    try {
      await about.save();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
    return { message: 'عملیات موفقیت آمیز بود' };
  }
}
