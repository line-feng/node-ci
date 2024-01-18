import { NestFactory } from '@nestjs/core';
import { AppModule } from './module/app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './utils/HttpExceptionFilter';
import { GLOBAL_INTERFACE_PREFIX } from './utils/global.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // 接口前缀
  app.setGlobalPrefix(GLOBAL_INTERFACE_PREFIX);
  // 请求参数的校验装饰器 class-validator
  app.useGlobalPipes(new ValidationPipe());
  // 异常抛出封装
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(3000);
}
bootstrap();
