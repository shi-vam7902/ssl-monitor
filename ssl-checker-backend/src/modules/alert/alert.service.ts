import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, PaginateModel } from "mongoose";

import {
  SSLRecord,
  SSLRecordDocument,
  SSLStatus,
} from "src/schemas/alert.schema";
import { User, UserDocument } from "src/schemas/user.schema";
import { RoleName } from "src/schemas/role.schema";
import {
  CreateAlertDto,
  UpdateAlertDto,
  AlertQueryDto,
  CheckDomainDto,
  BulkCheckDomainsDto,
} from "./alert.dto";
import {
  SslCheckerService,
  SSLCheckResult,
} from "src/services/ssl-checker.service";

export interface PaginatedAlerts {
  docs: SSLRecord[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

@Injectable()
export class AlertService {
  private readonly logger = new Logger(AlertService.name);

  constructor(
    @InjectModel(SSLRecord.name)
    private sslRecordModel: PaginateModel<SSLRecordDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private sslCheckerService: SslCheckerService
  ) {}

  /**
   * Create new domain to monitor (SUPER_ADMIN only)
   */
  async create(
    createAlertDto: CreateAlertDto,
    userId: string
  ): Promise<SSLRecord> {
    const { domain } = createAlertDto;

    // Check if domain already exists
    const existingAlert = await this.sslRecordModel.findOne({
      domain,
      isActive: true,
    });

    if (existingAlert) {
      throw new BadRequestException(
        `Domain ${domain} is already being monitored`
      );
    }

    // Check SSL certificate for the domain
    this.logger.log(`Checking SSL certificate for new domain: ${domain}`);
    const sslResult = await this.sslCheckerService.checkDomainSSL(domain);

    // Create alert record
    const alert = new this.sslRecordModel({
      domain: sslResult.domain,
      expiryDate: sslResult.expiryDate,
      daysRemaining: sslResult.daysRemaining,
      status: sslResult.status,
      lastChecked: new Date(),
      createdBy: userId,
      issuer: sslResult.issuer,
      serialNumber: sslResult.serialNumber,
      errorMessage: sslResult.errorMessage,
    });

    const savedAlert = await alert.save();
    this.logger.log(`Successfully added domain ${domain} to monitoring`);

    return savedAlert;
  }

  /**
   * Get paginated list of alerts
   */
  async findAll(queryDto: AlertQueryDto): Promise<PaginatedAlerts> {
    const { page = 1, limit = 10, search, status, daysRemaining } = queryDto;

    const filter: any = { isActive: true };

    // Search by domain name
    if (search) {
      filter.domain = { $regex: search, $options: "i" };
    }

    // Filter by status
    if (status) {
      filter.status = status;
    }

    // Filter by days remaining
    if (daysRemaining !== undefined) {
      filter.daysRemaining = { $lte: daysRemaining };
    }

    const options = {
      page,
      limit,
      sort: { createdAt: -1 },
      populate: {
        path: "createdBy",
        select: "email",
      },
    };

    const result = await this.sslRecordModel.paginate(filter, options);

    return {
      docs: result.docs,
      totalDocs: result.totalDocs,
      limit: result.limit,
      page: result.page,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
      nextPage: result.nextPage,
      prevPage: result.prevPage,
    };
  }

  /**
   * Get single alert by ID
   */
  async findOne(id: string): Promise<SSLRecord> {
    const alert = await this.sslRecordModel
      .findById(id)
      .populate("createdBy", "email")
      .exec();

    if (!alert || !alert.isActive) {
      throw new NotFoundException("Alert not found");
    }

    return alert;
  }

  /**
   * Update alert (SUPER_ADMIN only)
   */
  async update(
    id: string,
    updateAlertDto: UpdateAlertDto,
    userId: string
  ): Promise<SSLRecord> {
    const alert = await this.findOne(id);

    // If domain is being updated, check SSL certificate
    if (updateAlertDto.domain && updateAlertDto.domain !== alert.domain) {
      // Check if new domain already exists
      const existingAlert = await this.sslRecordModel.findOne({
        domain: updateAlertDto.domain,
        isActive: true,
        _id: { $ne: id },
      });

      if (existingAlert) {
        throw new BadRequestException(
          `Domain ${updateAlertDto.domain} is already being monitored`
        );
      }

      // Check SSL certificate for new domain
      const sslResult = await this.sslCheckerService.checkDomainSSL(
        updateAlertDto.domain
      );

      Object.assign(alert, {
        domain: sslResult.domain,
        expiryDate: sslResult.expiryDate,
        daysRemaining: sslResult.daysRemaining,
        status: sslResult.status,
        lastChecked: new Date(),
        issuer: sslResult.issuer,
        serialNumber: sslResult.serialNumber,
        errorMessage: sslResult.errorMessage,
      });
    }

    return await (alert as any).save();
  }

  /**
   * Remove alert (SUPER_ADMIN only)
   */
  async remove(id: string): Promise<void> {
    const alert = await this.findOne(id);
    alert.isActive = false;
    await (alert as any).save();
  }

  /**
   * Check single domain SSL certificate
   */
  async checkDomain(checkDomainDto: CheckDomainDto): Promise<SSLCheckResult> {
    const { domain } = checkDomainDto;
    return await this.sslCheckerService.checkDomainSSL(domain);
  }

  /**
   * Check multiple domains SSL certificates
   */
  async checkMultipleDomains(
    bulkCheckDto: BulkCheckDomainsDto
  ): Promise<SSLCheckResult[]> {
    const { domains } = bulkCheckDto;
    return await this.sslCheckerService.checkMultipleDomains(domains);
  }

  /**
   * Update SSL information for a domain
   */
  async updateSSLInfo(domain: string): Promise<SSLRecord> {
    const alert = await this.sslRecordModel.findOne({ domain, isActive: true });
    if (!alert) {
      throw new NotFoundException(
        `Domain ${domain} not found in monitoring list`
      );
    }

    const sslResult = await this.sslCheckerService.checkDomainSSL(domain);

    alert.expiryDate = sslResult.expiryDate;
    alert.daysRemaining = sslResult.daysRemaining;
    alert.status = sslResult.status;
    alert.lastChecked = new Date();
    alert.issuer = sslResult.issuer;
    alert.serialNumber = sslResult.serialNumber;
    alert.errorMessage = sslResult.errorMessage;

    return await alert.save();
  }

  /**
   * Get alerts that need email notifications
   */
  async getAlertsNeedingNotification(): Promise<SSLRecord[]> {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return await this.sslRecordModel
      .find({
        isActive: true,
        $and: [
          {
            $or: [
              { status: SSLStatus.EXPIRED },
              { status: SSLStatus.EXPIRING },
            ],
          },
          {
            $or: [
              { alertSentAt: { $exists: false } },
              { alertSentAt: { $size: 0 } },
              {
                alertSentAt: {
                  $not: {
                    $elemMatch: { $gte: oneDayAgo },
                  },
                },
              },
            ],
          },
        ],
      })
      .populate("createdBy", "email");
  }

  /**
   * Mark alert as notification sent
   */
  async markNotificationSent(alertId: string): Promise<void> {
    await this.sslRecordModel.findByIdAndUpdate(alertId, {
      $push: { alertSentAt: new Date() },
    });
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<any> {
    const [
      totalDomains,
      validCertificates,
      expiringCertificates,
      expiredCertificates,
      recentlyChecked,
    ] = await Promise.all([
      this.sslRecordModel.countDocuments({ isActive: true }),
      this.sslRecordModel.countDocuments({
        isActive: true,
        status: SSLStatus.VALID,
      }),
      this.sslRecordModel.countDocuments({
        isActive: true,
        status: SSLStatus.EXPIRING,
      }),
      this.sslRecordModel.countDocuments({
        isActive: true,
        status: SSLStatus.EXPIRED,
      }),
      this.sslRecordModel.countDocuments({
        isActive: true,
        lastChecked: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      }),
    ]);

    return {
      totalDomains,
      validCertificates,
      expiringCertificates,
      expiredCertificates,
      recentlyChecked,
    };
  }

  /**
   * Update all monitored domains SSL information
   */
  async updateAllDomains(): Promise<{ updated: number; failed: number }> {
    const alerts = await this.sslRecordModel.find({ isActive: true });
    let updated = 0;
    let failed = 0;

    this.logger.log(`Starting SSL check for ${alerts.length} domains`);

    for (const alert of alerts) {
      try {
        await this.updateSSLInfo(alert.domain);
        updated++;
        this.logger.log(`Updated SSL info for ${alert.domain}`);
      } catch (error) {
        failed++;
        this.logger.error(
          `Failed to update SSL info for ${alert.domain}: ${error.message}`
        );
      }
    }

    this.logger.log(
      `SSL check completed. Updated: ${updated}, Failed: ${failed}`
    );

    return { updated, failed };
  }
}
