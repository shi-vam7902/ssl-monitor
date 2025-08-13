// import { Injectable, Logger, NestMiddleware } from '@nestjs/common';

// import { NextFunction, Request, Response } from 'express';

// @Injectable()
// export class LoggerMiddleware implements NestMiddleware {
//   private logger = new Logger('HTTP');

//   use(request: Request, response: Response, next: NextFunction): void {
//     const { ip, method, originalUrl } = request;
//     const userAgent = request.get('user-agent') || '';

//     response.on('finish', () => {
//       const { statusCode } = response;
//       const contentLength = response.get('content-length');
//       const message = response.get('message');
//       const errorType = response.get('errorType');
//       if (statusCode < 400) {
//         this.logger.log(`${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`);
//       } else {
//         this.logger.error(`${method} ${originalUrl} ${statusCode} ${contentLength}
//         - ${errorType} : ${message}
//         - ${userAgent} ${ip}`);
//       }
//     });

//     next();
//   }
// }

// src/common/middleware/logger.middleware.ts
import {
  Injectable,
  Logger,
  NestMiddleware,
  Inject,
  forwardRef,
} from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
// import { LogService } from "src/modules/api-logs/log.service"; // Removed - not needed for SSL monitoring

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger("HTTP");

  constructor() {}

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = request;
    const userAgent = request.get("user-agent") || "";

    response.on("finish", async () => {
      const { statusCode } = response;
      const contentLength = response.get("content-length") || "";

      // Optional error headers (if set manually elsewhere)
      const message = response.get("message") || "";
      const errorType = response.get("errorType") || "";

      const logData = {
        method,
        url: originalUrl,
        statusCode,
        contentLength,
        userAgent,
        ip,
        message,
        errorType,
      };

      // API logging removed for SSL monitoring focus
      // await this.logService.createLog(logData);

      if (statusCode < 400) {
        this.logger.log(
          `${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`
        );
      } else {
        this.logger.error(
          `${method} ${originalUrl} ${statusCode} ${contentLength} - ${errorType} : ${message} - ${userAgent} ${ip}`
        );
      }
    });

    next();
  }
}
