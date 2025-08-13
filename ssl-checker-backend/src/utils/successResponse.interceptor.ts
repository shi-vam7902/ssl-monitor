import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  HttpStatus,
} from "@nestjs/common";
import { map, Observable } from "rxjs";
import { ENV } from "src/config";

export interface Response<T> {
  status: boolean;
  statusCode: HttpStatus;
  message: string;
  data: T;
}

@Injectable()
export class SuccessResponseInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<Response<T>> {
    const statusCode = context.switchToHttp().getResponse().statusCode;

    return next.handle().pipe(
      map((data) => ({
        status: true,
        statusCode: statusCode,
        message: data?.message ?? "",
        count: data?.count ?? 0,
        filePath: data?.filePath
          ? (process.env.AWS_S3_PUBLIC_URL || "") + data?.filePath
          : "",
        data: data?.data ?? data,
      }))
    );
  }
}
