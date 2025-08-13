import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, ForbiddenException, NotFoundException } from '@nestjs/common';
import { MulterError } from 'multer';
import { HttpAdapterHost } from '@nestjs/core';
import { ENV } from 'src/config';
import { ErrorMessages } from 'src/constants/messages';

interface iResponse {
  statusCode: HttpStatus;
  message: string;
}

const getStatusCode = <T>(exception: T): number => {
  return exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
};

const getErrorMessage = <T>(exception: T): string => {
  return exception instanceof HttpException ? exception.message : String(exception);
};

@Catch()
export class AllExceptionsFilter<T> implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) { }

  handleHttpException(exception: T, isProduction?: boolean): iResponse {
    const statusCode = getStatusCode<T>(exception);
    const message = getErrorMessage<T>(exception);
    return {
      statusCode,
      message: isProduction ? ErrorMessages.SOMETHING_WENT_WRONG : message,
    };
  }

  handleMulterException(exception: MulterError, isProduction): iResponse {
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      message: isProduction ? exception.message : exception.code,
    };
  }

  handleForbiddenException(): iResponse {
    return {
      statusCode: HttpStatus.FORBIDDEN,
      message: ErrorMessages.NOT_AUTHORIZED,
    };
  }

  handleNotFoundException(): iResponse {
    return {
      statusCode: HttpStatus.NOT_FOUND,
      message: ErrorMessages.API_NOT_FOUND,
    };
  }

  catch(exception: T, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const isProduction = ENV.NODE_ENV === 'production';
    let response;

    if (exception instanceof ForbiddenException) {
      response = this.handleForbiddenException();
    } else if (exception instanceof NotFoundException) {
      response = this.handleNotFoundException();
    } else if (exception instanceof MulterError) {
      response = this.handleMulterException(exception, isProduction);
    } else if (exception instanceof HttpException) {
      response = this.handleHttpException(exception);
    } else {
      response = {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        // message: (exception as Error).message,
        message: isProduction ? ErrorMessages.SOMETHING_WENT_WRONG : (exception as Error).message,
      };
    }

    const responseBody = {
      status: false,
      statusCode: response.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR,
      message: response.message ?? ErrorMessages.SOMETHING_WENT_WRONG,
      data: [],
    };

    httpAdapter.setHeader(ctx.getResponse(), 'message', encodeURIComponent(responseBody.message));
    httpAdapter.setHeader(ctx.getResponse(), 'errorType', (exception as Error).name);
    httpAdapter.reply(ctx.getResponse(), responseBody, responseBody.statusCode);
  }
}
