import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginUserDTO } from 'src/auth/dto/login-user.dto';
import { SignupUserDTO } from 'src/auth/dto/signup-user.dto';
import { UsersService } from 'src/users/users.service';
import { getConnection, getManager, Repository } from 'typeorm';
import { Admin } from './admin.entity';
import * as bcrypt from 'bcrypt';
import { CurrentUser } from 'src/interfaces/current-user.interface';
import * as sharp from 'sharp';
import { EditProfileDTO } from './dto/edit-profile.dto';
import { EditAdminDTO } from './dto/edit-admin.dto';
import { ResponseMessage } from 'src/interfaces/response-message.interface';
import fs from 'fs';

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    private usersService: UsersService,
  ) {}

  async findAll(admin: CurrentUser): Promise<Admin[]> {
    const currentAdmin = await this.adminRepository.findOne({ id: admin.id });
    if (!currentAdmin.isSuperAdmin) {
      throw new UnauthorizedException('شما مجاز به انجام این عملیات نیستید.');
    }
    const admins = await this.adminRepository
      .createQueryBuilder('admin')
      .leftJoin('admin.createdBy', 'creator')
      .addSelect('creator.name')
      .orderBy('admin.createdDateTime', 'ASC')
      .getMany();

    admins.map((admin) => delete admin.password);

    return admins;
  }

  async getAllTherapists(): Promise<Admin[]> {
    const admins = await this.adminRepository
      .createQueryBuilder('admin')
      .select()
      .innerJoin('admin.categories', 'categories')
      .addSelect('categories.id')
      .addSelect('categories.title')
      .where('admin.isActive = :isActive', { isActive: true })
      .orderBy('admin.createdDateTime', 'ASC')
      .getMany();

    admins.map((admin) => delete admin.password);
    return admins;
  }

  async findOne(username: string, id?: number): Promise<Admin> {
    const user = id
      ? await this.adminRepository.findOne({
          where: {
            id,
          },
          relations: ['categories'],
        })
      : await this.adminRepository.findOne({
          where: {
            username,
          },
          relations: ['categories'],
        });
    if (!user) {
      throw new NotFoundException('کاربر مورد نظر یافت نشد');
    }
    return user;
  }

  async signup(
    signupUserDTO: SignupUserDTO,
    file: any,
    user: CurrentUser,
  ): Promise<ResponseMessage> {
    const adminUser = await this.findOne(user.username);
    if (!adminUser || !adminUser.isSuperAdmin)
      throw new UnauthorizedException('شما به این قسمت دسترسی ندارید');
    const { email, name, password, username } = signupUserDTO;
    const isUsernameTaken = await this.adminRepository.findOne({ username });
    if (isUsernameTaken)
      throw new ConflictException('این نام کاربری قبلا استفاده شده است');
    const admin = new Admin();
    admin.email = email;
    admin.name = name;
    admin.password = await bcrypt.hash(password, await bcrypt.genSalt(10));
    admin.username = username;
    admin.createdBy = adminUser;
    admin.profilePictureUrl = null;
    admin.profilePictureThumbnailUrl = null;
    if (file) {
      const image = sharp(__dirname + '/uploads/profiles/' + file.filename);
      if (!fs.existsSync(__dirname + '/uploads/thumbnails')) {
        fs.mkdirSync(__dirname + '/uploads/thumbnails/');
      }
      image
        .resize({
          width: 300,
          fit: sharp.fit.contain,
          background: { r: 255, g: 255, b: 255, alpha: 0.5 },
        })
        .toFile(
          __dirname + '/uploads/thumbnails/profile-thumbnail-' + file.filename,
        )
        .then((info) => {
          console.log(info);
        })
        .catch((err) => {
          console.log(err);
        });
      admin.profilePictureUrl = file.filename;
      admin.profilePictureThumbnailUrl = 'profile-thumbnail-' + file.filename;
    }

    const entityManager = getManager();
    try {
      await entityManager.save(admin);
    } catch (error) {
      console.error(error);
      if (error.errno === 1062) {
        throw new ConflictException('این کاربر قبلا ثبت نام کرده است.');
      }
      throw new InternalServerErrorException();
    }

    return {
      message: 'عملیات موفقیت آمیز بود.',
    };
  }

  async editProfile(
    editProfileDTO: EditProfileDTO,
    file: any,
    user: CurrentUser,
  ): Promise<ResponseMessage> {
    const adminUser = await this.findOne(user.username);
    return this.edit(adminUser, editProfileDTO, file);
  }

  async editAdmin(
    editAdminDTO: EditAdminDTO,
    file: any,
    user: CurrentUser,
  ): Promise<ResponseMessage> {
    const adminUser = await this.findOne(user.username);
    if (!adminUser.isSuperAdmin) {
      throw new UnauthorizedException('شما مجاز به انجام این عملیات نیستید.');
    }
    const admin = await this.findOne(editAdminDTO.username);
    return this.edit(admin, editAdminDTO, file);
  }

  private async edit(
    adminUser: Admin,
    editProfileDTO: EditProfileDTO,
    file: any,
  ) {
    if (!adminUser)
      throw new UnauthorizedException('شما به این قسمت دسترسی ندارید');
    const {
      email,
      name,
      password,
      description,
      whatsappId,
      instagramUsername,
      telegramUsername,
      clinicAddress,
      mobileNumber,
      categories,
      linkedinId,
      occupation,
    } = editProfileDTO;
    if (!adminUser) throw new NotFoundException('مقاله مورد نظر یافت نشد.');
    if (name) adminUser.name = name;
    if (occupation) adminUser.occupation = occupation;
    if (instagramUsername) adminUser.instagramUsername = instagramUsername;
    if (whatsappId) adminUser.whatsappId = whatsappId;
    if (telegramUsername) adminUser.telegramUsername = telegramUsername;
    if (clinicAddress) adminUser.clinicAddress = clinicAddress;
    if (mobileNumber) adminUser.mobileNumber = mobileNumber;
    if (email) adminUser.email = email;
    if (linkedinId) adminUser.linkedinId = linkedinId;
    if (description) adminUser.description = description;
    if (password)
      adminUser.password = await bcrypt.hash(
        password,
        await bcrypt.genSalt(10),
      );
    if (file) {
      const image = sharp(__dirname + '/uploads/profiles/' + file.filename);
      image
        .resize({
          width: 300,
          fit: sharp.fit.contain,
          background: { r: 255, g: 255, b: 255, alpha: 0.5 },
        })
        .toFile(
          __dirname + '/uploads/thumbnails/profile-thumbnail-' + file.filename,
        )
        .then((info) => {
          console.log(info);
        })
        .catch((err) => {
          console.log(err);
        });
      adminUser.profilePictureUrl = file.filename;
      adminUser.profilePictureThumbnailUrl =
        'profile-thumbnail-' + file.filename;
    }

    const entityManager = getManager();
    try {
      await entityManager.save(adminUser);
    } catch (error) {
      throw new InternalServerErrorException();
    }

    const resCategories: number[] = JSON.parse(categories);
    try {
      await getConnection()
        .createQueryBuilder()
        .relation(Admin, 'categories')
        .of(adminUser)
        .remove(adminUser.categories);
      await getConnection()
        .createQueryBuilder()
        .relation(Admin, 'categories')
        .of(adminUser)
        .add(resCategories);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error);
    }
    return {
      message: 'عملیات موفقیت آمیز بود.',
    };
  }

  async toggleAdminActivation(
    id: number,
    currentUser: CurrentUser,
  ): Promise<{ message: string }> {
    const superAdmin = await this.adminRepository.findOne({
      username: currentUser.username,
    });
    if (!superAdmin || !superAdmin.isSuperAdmin)
      throw new UnauthorizedException('شما به این عملیات دسترسی ندارید!');
    const admin = await this.adminRepository.findOne({ id });
    if (!admin) throw new NotFoundException('کاربر مورد نظر یافت نشد!');
    await this.adminRepository.update({ id }, { isActive: !admin.isActive });
    return { message: 'عملیات موفقیت آمیز بود' };
  }

  async validateUserPassword(loginUserDTO: LoginUserDTO): Promise<string> {
    const { username, password } = loginUserDTO;
    const admin = await this.findOne(username);

    if (admin && (await admin.validatePassword(password)))
      return admin.username;
    else return null;
  }
}
