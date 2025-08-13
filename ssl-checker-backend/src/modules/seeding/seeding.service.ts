import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as bcrypt from "bcrypt";

import { Role, RoleDocument, RoleName } from "src/schemas/role.schema";
import { User, UserDocument } from "src/schemas/user.schema";
import { SSLRecord, SSLRecordDocument } from "src/schemas/alert.schema";
import { PermissionType } from "src/constants/permissionType";
import { ENV } from "src/config";

@Injectable()
export class SeedingService {
  private readonly logger = new Logger(SeedingService.name);

  constructor(
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(SSLRecord.name)
    private sslRecordModel: Model<SSLRecordDocument>
  ) {}

  async seedDatabase() {
    this.logger.log("Starting database seeding...");

    try {
      await this.seedRoles();
      await this.seedSuperAdmin();
      await this.seedDemoData();
      this.logger.log("Database seeding completed successfully");
    } catch (error) {
      this.logger.error("Database seeding failed:", error);
      throw error;
    }
  }

  async seedRoles() {
    this.logger.log("Seeding roles...");

    const roles = [
      {
        name: RoleName.SUPER_ADMIN,
        permissions: [
          PermissionType.SSL_CREATE,
          PermissionType.SSL_READ,
          PermissionType.SSL_UPDATE,
          PermissionType.SSL_DELETE,
          PermissionType.SSL_RENEW,
          PermissionType.USER_CREATE,
          PermissionType.USER_READ,
          PermissionType.USER_UPDATE,
          PermissionType.USER_DELETE,
          PermissionType.ROLE_CREATE,
          PermissionType.ROLE_READ,
          PermissionType.ROLE_UPDATE,
          PermissionType.ROLE_DELETE,
          PermissionType.ALERT_READ,
          PermissionType.ALERT_DELETE,
          PermissionType.SETTINGS_READ,
          PermissionType.SETTINGS_UPDATE,
          PermissionType.DASHBOARD_READ,
        ],
        description: "Super administrator with full system access",
      },
      {
        name: RoleName.ADMIN,
        permissions: [
          PermissionType.SSL_READ,
          PermissionType.ALERT_READ,
          PermissionType.DASHBOARD_READ,
        ],
        description: "Administrator with read-only access",
      },
    ];

    for (const roleData of roles) {
      const existingRole = await this.roleModel.findOne({
        name: roleData.name,
      });
      if (!existingRole) {
        const role = new this.roleModel(roleData);
        await role.save();
        this.logger.log(`Created role: ${roleData.name}`);
      } else {
        // Update permissions if role exists
        await this.roleModel.findByIdAndUpdate(existingRole._id, {
          permissions: roleData.permissions,
          description: roleData.description,
        });
        this.logger.log(`Updated role: ${roleData.name}`);
      }
    }
  }

  async seedSuperAdmin() {
    this.logger.log("Seeding super admin user...");

    const superAdminEmail =
      ENV.SUPER_ADMIN_EMAIL || ENV.EMAIL_FROM || "admin@example.com";
    const superAdminPassword = ENV.SUPER_ADMIN_PASSWORD || "Admin#1234";
    const superAdminName = ENV.SUPER_ADMIN_NAME || "Super Administrator";

    const existingAdmin = await this.userModel.findOne({
      email: superAdminEmail,
    });
    if (existingAdmin) {
      this.logger.log("Super admin user already exists");
      return;
    }

    const superAdminRole = await this.roleModel.findOne({
      name: RoleName.SUPER_ADMIN,
    });
    if (!superAdminRole) {
      throw new Error("SUPER_ADMIN role not found");
    }

    const hashedPassword = await bcrypt.hash(superAdminPassword, 12);

    const superAdmin = new this.userModel({
      name: "Super Administrator",
      email: superAdminEmail,
      password: hashedPassword,
      role: superAdminRole._id,
      isActive: true,
    });

    await superAdmin.save();

    this.logger.log(`Super admin created with email: ${superAdminEmail}`);
    this.logger.log(`Super admin password: ${superAdminPassword}`);
    this.logger.warn(
      "⚠️  Please change the default super admin password after first login!"
    );
  }

  async seedDemoData() {
    this.logger.log("Seeding demo SSL records...");

    const demoRecords = [
      {
        domain: "expired.badssl.com",
        expiryDate: new Date("2015-04-12T23:59:59.000Z"),
        daysRemaining: -3650,
        status: "expired",
        lastChecked: new Date(),
        errorMessage: "Certificate expired",
      },
      {
        domain: "sha256.badssl.com",
        expiryDate: new Date("2025-12-31T23:59:59.000Z"),
        daysRemaining: 300,
        status: "valid",
        lastChecked: new Date(),
      },
    ];

    const superAdmin = await this.userModel.findOne({
      email: ENV.SUPER_ADMIN_EMAIL || ENV.EMAIL_FROM || "admin@example.com",
    });

    if (!superAdmin) {
      this.logger.warn("Super admin not found, skipping demo SSL records");
      return;
    }

    for (const recordData of demoRecords) {
      const existingRecord = await this.sslRecordModel.findOne({
        domain: recordData.domain,
      });

      if (!existingRecord) {
        const record = new this.sslRecordModel({
          ...recordData,
          createdBy: superAdmin._id,
          alertSentAt: [],
        });
        await record.save();
        this.logger.log(`Created demo SSL record: ${recordData.domain}`);
      }
    }
  }

  async resetDatabase() {
    this.logger.warn("Resetting database...");

    await this.userModel.deleteMany({});
    await this.roleModel.deleteMany({});
    await this.sslRecordModel.deleteMany({});

    this.logger.log("Database reset completed");

    await this.seedDatabase();
  }
}
