import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, PaginateModel, PaginateResult } from "mongoose";
import {
  SSLRecord,
  SSLRecordDocument,
  SSLStatus,
} from "../../schemas/alert.schema";
import {
  SslCheckerService,
  SSLCheckResult,
} from "../../services/ssl-checker.service";
import { RenewService } from "../../services/renew.service";
import {
  CreateSSLDto,
  UpdateSSLDto,
  SSLQueryDto,
  RenewSSLResponseDto,
} from "./ssl.dto";
import { Types } from "mongoose";

@Injectable()
export class SSLService {
  private readonly logger = new Logger(SSLService.name);

  constructor(
    @InjectModel(SSLRecord.name)
    private sslRecordModel: PaginateModel<SSLRecordDocument>,
    private sslCheckerService: SslCheckerService,
    private renewService: RenewService
  ) {}

  /**
   * Create a new SSL record by checking the domain
   */
  async create(
    createSSLDto: CreateSSLDto,
    userId: string
  ): Promise<SSLRecordDocument> {
    try {
      // Check if domain already exists
      const existingRecord = await this.sslRecordModel.findOne({
        domain: createSSLDto.domain,
        isActive: true,
      });

      if (existingRecord) {
        throw new ConflictException(
          `Domain ${createSSLDto.domain} is already being monitored`
        );
      }

      // Check SSL certificate
      this.logger.log(`Checking SSL for new domain: ${createSSLDto.domain}`);
      const sslResult = await this.sslCheckerService.checkDomainSSL(
        createSSLDto.domain
      );

      if (!sslResult.isValid && sslResult.errorMessage) {
        this.logger.warn(
          `SSL check failed for ${createSSLDto.domain}: ${sslResult.errorMessage}`
        );
        // Still create the record but with error status
      }

      // Create new SSL record
      const sslRecord = new this.sslRecordModel({
        domain: createSSLDto.domain,
        expiryDate: sslResult.expiryDate,
        daysRemaining: sslResult.daysRemaining,
        status: sslResult.status,
        lastChecked: new Date(),
        createdBy: new Types.ObjectId(userId),
        issuer: sslResult.issuer,
        serialNumber: sslResult.serialNumber,
        errorMessage: sslResult.errorMessage,
      });

      const savedRecord = await sslRecord.save();
      this.logger.log(
        `SSL record created for domain: ${createSSLDto.domain} with status: ${sslResult.status}`
      );

      return savedRecord;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(
        `Failed to create SSL record for ${createSSLDto.domain}: ${error.message}`,
        error.stack
      );
      throw new BadRequestException(
        `Failed to create SSL record: ${error.message}`
      );
    }
  }

  /**
   * Get paginated list of SSL records
   */
  async findAll(
    query: SSLQueryDto
  ): Promise<PaginateResult<SSLRecordDocument>> {
    try {
      const filter: any = { isActive: true };

      // Apply filters
      if (query.status) {
        filter.status = query.status;
      }

      if (query.domain) {
        filter.domain = { $regex: query.domain, $options: "i" };
      }

      if (query.daysRemaining !== undefined) {
        filter.daysRemaining = { $lte: query.daysRemaining };
      }

      const options = {
        page: query.page || 1,
        limit: query.limit || 20,
        sort: {
          [query.sortBy || "expiryDate"]: query.sortOrder === "asc" ? 1 : -1,
        },
        populate: [{ path: "createdBy", select: "name email" }],
      };

      const result = await this.sslRecordModel.paginate(filter, options);
      this.logger.log(
        `Retrieved ${result.docs.length} SSL records (page ${query.page})`
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve SSL records: ${error.message}`,
        error.stack
      );
      throw new BadRequestException(
        `Failed to retrieve SSL records: ${error.message}`
      );
    }
  }

  /**
   * Get a single SSL record by ID
   */
  async findOne(id: string): Promise<SSLRecordDocument> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException("Invalid SSL record ID");
      }

      const sslRecord = await this.sslRecordModel
        .findOne({ _id: id, isActive: true })
        .populate("createdBy", "name email")
        .exec();

      if (!sslRecord) {
        throw new NotFoundException(`SSL record with ID ${id} not found`);
      }

      return sslRecord;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        `Failed to retrieve SSL record ${id}: ${error.message}`,
        error.stack
      );
      throw new BadRequestException(
        `Failed to retrieve SSL record: ${error.message}`
      );
    }
  }

  /**
   * Update an SSL record
   */
  async update(
    id: string,
    updateSSLDto: UpdateSSLDto
  ): Promise<SSLRecordDocument> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException("Invalid SSL record ID");
      }

      // Check if domain is being updated and if it already exists
      if (updateSSLDto.domain) {
        const existingRecord = await this.sslRecordModel.findOne({
          domain: updateSSLDto.domain,
          _id: { $ne: id },
          isActive: true,
        });

        if (existingRecord) {
          throw new ConflictException(
            `Domain ${updateSSLDto.domain} is already being monitored`
          );
        }
      }

      const updatedRecord = await this.sslRecordModel
        .findOneAndUpdate(
          { _id: id, isActive: true },
          { ...updateSSLDto, updatedAt: new Date() },
          { new: true, runValidators: true }
        )
        .populate("createdBy", "name email")
        .exec();

      if (!updatedRecord) {
        throw new NotFoundException(`SSL record with ID ${id} not found`);
      }

      this.logger.log(`SSL record updated: ${id}`);
      return updatedRecord;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      this.logger.error(
        `Failed to update SSL record ${id}: ${error.message}`,
        error.stack
      );
      throw new BadRequestException(
        `Failed to update SSL record: ${error.message}`
      );
    }
  }

  /**
   * Soft delete an SSL record
   */
  async remove(id: string): Promise<{ message: string }> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException("Invalid SSL record ID");
      }

      const deletedRecord = await this.sslRecordModel
        .findOneAndUpdate(
          { _id: id, isActive: true },
          { isActive: false, updatedAt: new Date() },
          { new: true }
        )
        .exec();

      if (!deletedRecord) {
        throw new NotFoundException(`SSL record with ID ${id} not found`);
      }

      this.logger.log(
        `SSL record deleted: ${id} (domain: ${deletedRecord.domain})`
      );
      return {
        message: `SSL record for domain ${deletedRecord.domain} has been deleted`,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        `Failed to delete SSL record ${id}: ${error.message}`,
        error.stack
      );
      throw new BadRequestException(
        `Failed to delete SSL record: ${error.message}`
      );
    }
  }

  /**
   * Manual SSL renewal/recheck
   */
  async renew(
    id: string,
    force: boolean = false
  ): Promise<RenewSSLResponseDto> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException("Invalid SSL record ID");
      }

      const sslRecord = await this.sslRecordModel.findOne({
        _id: id,
        isActive: true,
      });
      if (!sslRecord) {
        throw new NotFoundException(`SSL record with ID ${id} not found`);
      }

      this.logger.log(
        `Manual renewal requested for domain: ${sslRecord.domain}`
      );

      // Check current SSL status
      const sslResult = await this.sslCheckerService.checkDomainSSL(
        sslRecord.domain
      );

      // Update the record with new SSL information
      const updatedRecord = await this.sslRecordModel
        .findOneAndUpdate(
          { _id: id },
          {
            expiryDate: sslResult.expiryDate,
            daysRemaining: sslResult.daysRemaining,
            status: sslResult.status,
            lastChecked: new Date(),
            issuer: sslResult.issuer,
            serialNumber: sslResult.serialNumber,
            commonName: sslResult.domain,
            errorMessage: sslResult.errorMessage,
            renewalStatus: "rechecked",
            updatedAt: new Date(),
          },
          { new: true, runValidators: true }
        )
        .populate("createdBy", "name email")
        .exec();

      // Call renewal service hook (extensible for future CA integration)
      const renewalResult = await this.renewService.triggerRenewal(
        sslRecord.domain,
        force
      );

      this.logger.log(
        `SSL renewal completed for ${sslRecord.domain}: ${renewalResult.action}`
      );

      const response = {
        ...updatedRecord.toObject(),
        _id: updatedRecord._id.toString(),
        createdBy: updatedRecord.createdBy.toString(),
        renewalStatus: renewalResult.action,
        message: renewalResult.message,
      };
      return response as RenewSSLResponseDto;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        `Failed to renew SSL record ${id}: ${error.message}`,
        error.stack
      );
      throw new BadRequestException(
        `Failed to renew SSL record: ${error.message}`
      );
    }
  }

  /**
   * Get SSL records that need alerts (for cron job)
   */
  async getRecordsNeedingAlerts(): Promise<SSLRecordDocument[]> {
    try {
      const alertThresholds = [30, 15, 7, 1]; // Days before expiry to send alerts

      const records = await this.sslRecordModel
        .find({
          isActive: true,
          $or: [
            { status: SSLStatus.EXPIRING },
            { status: SSLStatus.EXPIRED },
            { daysRemaining: { $in: alertThresholds } },
          ],
        })
        .exec();

      return records;
    } catch (error) {
      this.logger.error(
        `Failed to get records needing alerts: ${error.message}`,
        error.stack
      );
      return [];
    }
  }

  /**
   * Update SSL record after sending alert
   */
  async markAlertSent(recordId: string): Promise<void> {
    try {
      await this.sslRecordModel.findByIdAndUpdate(recordId, {
        $push: { alertSentAt: new Date() },
        updatedAt: new Date(),
      });
      this.logger.log(`Alert sent timestamp added for record: ${recordId}`);
    } catch (error) {
      this.logger.error(
        `Failed to mark alert sent for record ${recordId}: ${error.message}`,
        error.stack
      );
    }
  }

  /**
   * Check if alert was already sent for a specific threshold
   */
  shouldSendAlert(record: SSLRecordDocument, daysThreshold: number): boolean {
    if (!record.alertSentAt || record.alertSentAt.length === 0) {
      return true;
    }

    // Check if we already sent an alert for this threshold in the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentAlerts = record.alertSentAt.filter(
      (alertDate) => alertDate > oneDayAgo
    );

    // Don't spam alerts - only send once per threshold per day
    return recentAlerts.length === 0 && record.daysRemaining <= daysThreshold;
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<{
    total: number;
    valid: number;
    expiring: number;
    expired: number;
  }> {
    try {
      const [total, valid, expiring, expired] = await Promise.all([
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
      ]);

      return { total, valid, expiring, expired };
    } catch (error) {
      this.logger.error(
        `Failed to get dashboard stats: ${error.message}`,
        error.stack
      );
      return { total: 0, valid: 0, expiring: 0, expired: 0 };
    }
  }
}
