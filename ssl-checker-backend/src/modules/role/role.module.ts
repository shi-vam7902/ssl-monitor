import { Global, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtModule } from "@nestjs/jwt";

import { Role, RoleSchema } from "src/schemas/role.schema";
import { RoleService } from "./role.service";
import { RoleController } from "./role.controller";
import { ENV } from "src/config";

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
    JwtModule.register({
      secret: ENV.JWT_SECRET,
      signOptions: { expiresIn: ENV.JWT_EXPIRES_IN },
    }),
  ],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService, MongooseModule],
})
export class RoleModule {}
