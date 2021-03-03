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
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { getManager, Repository } from 'typeorm';
import { Admin } from './admin.entity';
import * as bcrypt from 'bcrypt';
import { CurrentUser } from 'src/interfaces/current-user.interface';
import * as sharp from 'sharp';
import { EditProfileDTO } from './dto/edit-profile.dto';
import { EditAdminDTO } from './dto/edit-admin.dto';
import { ResponseMessage } from 'src/interfaces/response-message.interface';

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    private usersService: UsersService,
  ) {}

  async findAll(): Promise<Admin[]> {
    const admins = await this.adminRepository
      .createQueryBuilder('admin')
      .where('admin.isActive = 1')
      .leftJoin('admin.createdBy', 'creator')
      .addSelect('creator.name')
      .getMany();

    admins.map((admin) => delete admin.password);

    return admins;
  }

  async getAllUsers(): Promise<User[]> {
    return this.usersService.findAll();
  }

  findOne(username: string, id?: number): Promise<Admin> {
    return id
      ? this.adminRepository.findOne({
          where: {
            id,
          },
        })
      : this.adminRepository.findOne({
          where: {
            username,
          },
        });
  }

  async signup(
    signupUserDTO: SignupUserDTO,
    file: any,
    user: CurrentUser,
  ): Promise<ResponseMessage> {
    const adminUser = await this.findOne(user.username);
    if (!adminUser)
      throw new UnauthorizedException('شما به این قسمت دسترسی ندارید');
    const { email, name, password, username } = signupUserDTO;
    const admin = new Admin();
    admin.email = email;
    admin.name = name;
    admin.password = await bcrypt.hash(password, await bcrypt.genSalt(10));
    admin.username = username;
    admin.createdBy = adminUser;
    admin.profilePictureUrl = null;
    admin.profilePictureThumbnailUrl = null;
    if (file) {
      const image = sharp('uploads/profiles/' + file.filename);
      image
        .resize({
          width: 300,
          fit: sharp.fit.contain,
          background: { r: 255, g: 255, b: 255, alpha: 0.5 },
        })
        .toFile('uploads/thumbnails/profile-thumbnail-' + file.filename)
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
    const adminUser = await this.findOne(editAdminDTO.username);
    return this.edit(adminUser, editAdminDTO, file);
  }

  private async edit(
    adminUser: Admin,
    editProfileDTO: EditProfileDTO,
    file: any,
  ) {
    if (!adminUser)
      throw new UnauthorizedException('شما به این قسمت دسترسی ندارید');
    const { email, name, password, description } = editProfileDTO;
    if (!adminUser) throw new NotFoundException('مقاله مورد نظر یافت نشد.');
    if (name) adminUser.name = name;
    if (email) adminUser.email = email;
    if (description) adminUser.description = description;
    if (password)
      adminUser.password = await bcrypt.hash(
        password,
        await bcrypt.genSalt(10),
      );
    if (file) {
      const image = sharp('uploads/profiles/' + file.filename);
      image
        .resize({
          width: 300,
          fit: sharp.fit.contain,
          background: { r: 255, g: 255, b: 255, alpha: 0.5 },
        })
        .toFile('uploads/thumbnails/profile-thumbnail-' + file.filename)
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

    return {
      message: 'عملیات موفقیت آمیز بود.',
    };
  }

  async remove(id: number): Promise<void> {
    await this.adminRepository.update({ id }, { isActive: false });
  }

  async validateUserPassword(loginUserDTO: LoginUserDTO): Promise<string> {
    const { username, password } = loginUserDTO;
    const admin = await this.findOne(username);

    if (admin && (await admin.validatePassword(password)))
      return admin.username;
    else return null;
  }
}
