import { TypeOrmModuleOptions } from '@nestjs/typeorm';
export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'Password',
  database: 'slpath',
  entities: [__dirname + '/../**/*.entity.{ts,js}'],
  extra: { charset: 'utf8mb4_unicode_ci' },
  // TODO: synchronize must be false in production phase
  synchronize: true,
};
