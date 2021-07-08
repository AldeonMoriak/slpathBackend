require('dotenv/config');
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const { DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE, DB_HOST } = process.env;

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: DB_HOST,
  port: parseInt(DB_PORT),
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  entities: [__dirname + '/../**/*.entity.{ts,js}'],
  extra: { charset: 'utf8mb4_unicode_ci' },
  // TODO: synchronize must be false in production phase
  synchronize: process.env.NODE_ENV !== 'production',
};
