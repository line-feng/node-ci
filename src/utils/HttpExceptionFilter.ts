import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  // HttpStatus,
} from '@nestjs/common';
import { SUCCESS_CODE } from './code';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    /** 兼容 class-validator 抛出的异常 */
    const classValidatorError = (exception.getResponse() as any)?.message;

    // 整理返回全部的错误信息
    const errorResponse = {
      code: exception.getStatus(),
      message: classValidatorError || exception.message,
      data: null,
    };
    response.status(SUCCESS_CODE);
    response.header('Content-Type', 'application/json; charset=utf-8');
    response.send(errorResponse);
  }
}
