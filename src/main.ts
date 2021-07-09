import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });
  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe());
  try {
    if (!fs.existsSync(__dirname + '/uploads/thumbnails')) {
      fs.mkdirSync(__dirname + '/uploads/thumbnails/');
    }
    if (!fs.existsSync(__dirname + '/uploads/images')) {
      fs.mkdirSync(__dirname + '/uploads/images/');
    }
    if (!fs.existsSync(__dirname + '/uploads/profiles')) {
      fs.mkdirSync(__dirname + '/uploads/profiles/');
    }
  } catch (error) {
    console.log(__dirname);
  }
  const PORT = process.env.PORT || 5000;
  await app.listen(PORT, () => {
    console.log(`Our app is running on port ${PORT}`);
  });
}
bootstrap();
