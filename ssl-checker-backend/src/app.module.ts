import { MiddlewareConsumer, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtModule } from "@nestjs/jwt";
import { UserModule } from "./modules/user/user.module";
import { ENV } from "./config";
import { EmailModule } from "./services/email/email.module";
import { validate } from "./config/validation";
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { JwtAuthGuard } from "./middleware/jwtAuth.guard";
import { RolesGuard } from "./middleware/roles.guard";
import { AllExceptionsFilter } from "./utils/error.handler";
import { SuccessResponseInterceptor } from "./utils/successResponse.interceptor";
import { LoggerMiddleware } from "./middleware/logger";
import { AuthModule } from "./modules/auth/auth.module";
import { RoleModule } from "./modules/role/role.module";
import { CronJobsModule } from "./modules/cron-jobs/cron-jobs.module";
import { AlertModule } from "./modules/alert/alert.module";
import { SSLModule } from "./modules/ssl/ssl.module";
import { SslCheckerService } from "./services/ssl-checker.service";
import { SeedingModule } from "./modules/seeding/seeding.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${ENV.NODE_ENV}`,
      isGlobal: true,
      validate,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
    JwtModule.register({
      global: true,
      secret: ENV.JWT_SECRET,
      signOptions: { expiresIn: ENV.JWT_EXPIRES_IN },
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        uri: ENV.MONGO_DB_URL,
        connectionFactory: (connection) => {
          connection.plugin(require("mongoose-paginate-v2"));
          return connection;
        },
      }),
    }),
    UserModule,
    AuthModule,
    RoleModule,
    EmailModule,
    CronJobsModule,
    AlertModule,
    SSLModule,
    SeedingModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SuccessResponseInterceptor,
    },
    SslCheckerService,
  ],
})
export class AppModule {
  constructor() {}
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes("*");
  }
}
