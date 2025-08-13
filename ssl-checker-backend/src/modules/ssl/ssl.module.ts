import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SSLController } from "./ssl.controller";
import { SSLService } from "./ssl.service";
import { SSLRecord, SSLRecordSchema } from "../../schemas/alert.schema";
import { SslCheckerService } from "../../services/ssl-checker.service";
import { RenewService } from "../../services/renew.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SSLRecord.name, schema: SSLRecordSchema },
    ]),
  ],
  controllers: [SSLController],
  providers: [SSLService, SslCheckerService, RenewService],
  exports: [SSLService],
})
export class SSLModule {}
