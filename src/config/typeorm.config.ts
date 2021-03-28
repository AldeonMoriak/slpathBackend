import { TypeOrmModuleOptions } from '@nestjs/typeorm';
export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'aldeon',
  password: 'password',
  database: 'slpath',
  entities: [__dirname + '/../**/*.entity.{ts,js}'],
  extra: { charset: 'utf8mb4_unicode_ci' },
  // TODO: synchronize must be false in production phase
  synchronize: true,
};
