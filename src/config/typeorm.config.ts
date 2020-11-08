import { TypeOrmModuleOptions } from '@nestjs/typeorm';
export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'password',
  database: 'slpath',
  entities: [__dirname + '/../**/*.entity.{ts,js}'],
  // TODO: synchronize must be false in production phase
  synchronize: true,
};
