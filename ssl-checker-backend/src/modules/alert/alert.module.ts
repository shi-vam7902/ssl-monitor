import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { AlertService } from "./alert.service";
import { AlertController } from "./alert.controller";
import { SSLRecord, SSLRecordSchema } from "src/schemas/alert.schema";
import { User, UserSchema } from "src/schemas/user.schema";
import { SslCheckerService } from "src/services/ssl-checker.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SSLRecord.name, schema: SSLRecordSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [AlertController],
  providers: [AlertService, SslCheckerService],
  exports: [AlertService],
})
export class AlertModule {}
