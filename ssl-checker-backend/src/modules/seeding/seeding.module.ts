import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { SeedingService } from "./seeding.service";
import { SeedingController } from "./seeding.controller";
import { Role, RoleSchema } from "src/schemas/role.schema";
import { User, UserSchema } from "src/schemas/user.schema";
import { SSLRecord, SSLRecordSchema } from "src/schemas/alert.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
      { name: User.name, schema: UserSchema },
      { name: SSLRecord.name, schema: SSLRecordSchema },
    ]),
  ],
  controllers: [SeedingController],
  providers: [SeedingService],
  exports: [SeedingService],
})
export class SeedingModule {}
