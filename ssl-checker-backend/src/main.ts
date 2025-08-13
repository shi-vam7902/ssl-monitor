import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";
import { urlencoded, json } from "express";
import { transports, format } from "winston";
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from "nest-winston";
import "winston-daily-rotate-file";
import { ENV } from "./config";
import { AppModule } from "./app.module";
import { writeFileSync } from "fs";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new transports.DailyRotateFile({
          dirname: ENV.LOG_DIR,
          filename: `%DATE%-error.log`,
          level: "error",
          datePattern: "YYYY-MM-DD",
          zippedArchive: false,
          maxFiles: "30d",
        }),
        new transports.Console({
          format: format.combine(
            format.timestamp(),
            format.ms(),
            format.errors({ stack: true }),
            nestWinstonModuleUtilities.format.nestLike("Nest", {
              colors: true,
              prettyPrint: true,
            })
          ),
        }),
      ],
    }),
  });

  // const config = new DocumentBuilder()
  //   .addServer(`${ENV.APP_URL}/api`, "Development environment")
  //   .addServer("http://localhost:5001/api", "Local environment")
  //   .addServer("https://staging.com/api", "Staging environment")
  //   .addServer("https://production.com/api", "Production environment")
  //   .setTitle("SSL Monitor")
  //   .setDescription("SSL Certificate Monitoring API")
  //   .setVersion("1.0")
  //   .addBearerAuth(
  //     {
  //       // I was also testing it without prefix 'Bearer ' before the JWT
  //       description: `[just text field] Please enter token in following format: Bearer <JWT>`,
  //       name: "Authorization",
  //       bearerFormat: "Bearer", // I`ve tested not to use this field, but the result was the same
  //       scheme: "Bearer",
  //       type: "http", // I`ve attempted type: 'apiKey' too
  //       in: "Header",
  //     },
  //     "access-token"
  //   )
  //   .build();
  // const document = SwaggerModule.createDocument(app, config);

  // writeFileSync("./swagger-spec.json", JSON.stringify(document));
  // SwaggerModule.setup("swagger", app, document);

  // const validationRecursion = (validationErrors: ValidationError[] = []) => {
  //   for (const errorObj of validationErrors) {
  //     if (
  //       errorObj["constraints"] &&
  //       Object.keys(errorObj["constraints"]).length > 0
  //     ) {
  //       return new BadRequestException(
  //         Object.values(errorObj["constraints"])[
  //           Object.keys(errorObj["constraints"]).length - 1
  //         ]
  //       );
  //     } else if (errorObj["children"] && errorObj["children"].length > 0) {
  //       return validationRecursion(errorObj["children"]);
  //     } else {
  //       return new BadRequestException("something went wrong");
  //     }
  //   }
  // };
  app.enableCors({ origin: ENV.ORIGIN, credentials: ENV.CREDENTIALS });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      skipNullProperties: false,
      skipUndefinedProperties: false,
      disableErrorMessages: true,
      transformOptions: { enableImplicitConversion: true },
      forbidNonWhitelisted: true,
      // exceptionFactory: (validationErrors: ValidationError[]) =>
      //   validationRecursion(validationErrors),
    })
  );

  app.setBaseViewsDir(join(__dirname, "public"));
  app.setViewEngine("ejs");
  app.setGlobalPrefix("api");

  app.use(json({ limit: "50mb" }));
  app.use(urlencoded({ extended: true, limit: "50mb" }));
  await app.listen(ENV.PORT);

  console.log(`  =================================
  ======= ENV: ${ENV.NODE_ENV} ========
  🚀 App listening on the port ${ENV.PORT}
  =================================`);
}
bootstrap();
