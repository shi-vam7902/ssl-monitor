import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import * as mongoosePaginate from "mongoose-paginate-v2";

export type RoleDocument = Role & Document;

export enum RoleName {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
}

@Schema({
  timestamps: true,
  collection: "roles",
})
export class Role {
  @Prop({
    required: true,
    unique: true,
    enum: RoleName,
  })
  name: RoleName;

  @Prop({
    type: [String],
    default: [],
  })
  permissions: string[];

  @Prop()
  description?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
RoleSchema.plugin(mongoosePaginate);

// Index for better performance
RoleSchema.index({ name: 1 });
