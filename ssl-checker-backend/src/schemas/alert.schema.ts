import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import * as mongoosePaginate from "mongoose-paginate-v2";

export type SSLRecordDocument = SSLRecord & Document;

export enum SSLStatus {
  VALID = "valid",
  EXPIRING = "expiring",
  EXPIRED = "expired",
}

@Schema({
  timestamps: true,
  collection: "ssl_records",
})
export class SSLRecord {
  @Prop({
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  })
  domain: string;

  @Prop({ required: true })
  expiryDate: Date;

  @Prop({ required: true })
  daysRemaining: number;

  @Prop({
    required: true,
    enum: SSLStatus,
    default: SSLStatus.VALID,
  })
  status: SSLStatus;

  @Prop({ required: true })
  lastChecked: Date;

  @Prop({
    type: [Date],
    default: [],
  })
  alertSentAt: Date[];

  @Prop({
    type: Types.ObjectId,
    ref: "User",
    required: true,
  })
  createdBy: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  errorMessage?: string;

  @Prop()
  issuer?: string;

  @Prop()
  serialNumber?: string;

  @Prop()
  commonName?: string;

  @Prop()
  organization?: string;

  @Prop()
  renewalStatus?: string;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const SSLRecordSchema = SchemaFactory.createForClass(SSLRecord);
SSLRecordSchema.plugin(mongoosePaginate);

// Indexes for better performance
SSLRecordSchema.index({ domain: 1 }, { unique: true });
SSLRecordSchema.index({ status: 1 });
SSLRecordSchema.index({ expiryDate: 1 });
SSLRecordSchema.index({ createdBy: 1 });
SSLRecordSchema.index({ daysRemaining: 1 });
