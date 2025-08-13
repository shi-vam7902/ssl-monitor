import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression, SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron";

import { SSLService } from "../ssl/ssl.service";
import { EmailService } from "src/services/email/email.service";
import { SslCheckerService } from "src/services/ssl-checker.service";
import { SSLStatus } from "src/schemas/alert.schema";
import { ENV } from "src/config";

@Injectable()
export class CronJobsService {
  private readonly logger = new Logger(CronJobsService.name);

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly sslService: SSLService,
    private readonly emailService: EmailService,
    private readonly sslCheckerService: SslCheckerService
  ) {
    this.logger.log("SSL Monitoring Cron Jobs Service initialized");
  }

  /**
   * Check all monitored domains SSL certificates
   * Runs based on CRON_EXPRESSION environment variable
   */
  @Cron(ENV.CRON_EXPRESSION || "0 0 * * *")
  async checkAllSSLCertificates() {
    this.logger.log(
      "Starting scheduled SSL certificate check for all monitored domains"
    );

    try {
      // Get all active SSL records
      const allRecords = await this.sslService.findAll({
        limit: 1000,
        page: 1,
      });
      let updated = 0;
      let failed = 0;

      for (const record of allRecords.docs) {
        try {
          // Check SSL status for each domain
          const sslResult = await this.sslCheckerService.checkDomainSSL(
            record.domain
          );

          // Update the record with new SSL information
          await this.sslService.update(record._id.toString(), {
            expiryDate: sslResult.expiryDate,
            daysRemaining: sslResult.daysRemaining,
            status: sslResult.status,
            issuer: sslResult.issuer,
            serialNumber: sslResult.serialNumber,
            errorMessage: sslResult.errorMessage,
          });

          updated++;
          this.logger.log(
            `Updated SSL info for ${record.domain}: ${sslResult.status} (${sslResult.daysRemaining} days)`
          );
        } catch (error) {
          failed++;
          this.logger.error(
            `Failed to update SSL info for ${record.domain}:`,
            error.message
          );
        }
      }

      this.logger.log(
        `SSL check completed. Updated: ${updated}, Failed: ${failed}`
      );

      // Send notification emails after updating SSL info
      await this.sendAlertNotifications();
    } catch (error) {
      this.logger.error("Failed to perform scheduled SSL check:", error);
    }
  }

  /**
   * Send email notifications for expiring/expired certificates
   * Runs every 2 hours to ensure timely notifications
   */
  @Cron("0 */2 * * *") // Every 2 hours
  async sendAlertNotifications() {
    this.logger.log("Checking for SSL alerts that need email notifications");

    try {
      const recordsNeedingAlerts =
        await this.sslService.getRecordsNeedingAlerts();

      if (recordsNeedingAlerts.length === 0) {
        this.logger.log("No SSL alerts need email notifications at this time");
        return;
      }

      this.logger.log(
        `Found ${recordsNeedingAlerts.length} records requiring email notifications`
      );

      const alertThresholds = [30, 15, 7, 1]; // Days before expiry to send alerts

      for (const record of recordsNeedingAlerts) {
        try {
          // Check if we should send alert for this threshold
          const shouldAlert = alertThresholds.some((threshold) =>
            this.sslService.shouldSendAlert(record, threshold)
          );

          if (shouldAlert) {
            await this.sendSingleAlertEmail(record);
            await this.sslService.markAlertSent(record._id.toString());
            this.logger.log(
              `Email notification sent for domain: ${record.domain}`
            );
          }
        } catch (error) {
          this.logger.error(
            `Failed to send email notification for domain ${record.domain}:`,
            error
          );
        }
      }
    } catch (error) {
      this.logger.error("Failed to process alert notifications:", error);
    }
  }

  /**
   * Send daily summary report
   * Runs every day at 8 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async sendDailySummaryReport() {
    this.logger.log(
      "Generating and sending daily SSL monitoring summary report"
    );

    try {
      const stats = await this.sslService.getDashboardStats();
      const expiredCertificates = await this.sslService.findAll({
        status: SSLStatus.EXPIRED,
        limit: 50,
        page: 1,
      });
      const expiringCertificates = await this.sslService.findAll({
        status: SSLStatus.EXPIRING,
        limit: 50,
        page: 1,
      });

      await this.emailService.sendDailySummaryReport({
        stats: {
          totalDomains: stats.total,
          validCertificates: stats.valid,
          expiringCertificates: stats.expiring,
          expiredCertificates: stats.expired,
          recentlyChecked: stats.total, // Approximate
        },
        expiredCertificates: expiredCertificates.docs,
        expiringCertificates: expiringCertificates.docs,
        date: new Date(),
      });

      this.logger.log("Daily summary report sent successfully");
    } catch (error) {
      this.logger.error("Failed to send daily summary report:", error);
    }
  }

  /**
   * Weekly domain health report
   * Runs every Monday at 9 AM
   */
  @Cron("0 9 * * 1") // Every Monday at 9 AM
  async sendWeeklyHealthReport() {
    this.logger.log("Generating weekly SSL health report");

    try {
      const allRecords = await this.sslService.findAll({
        limit: 1000,
        page: 1,
      });
      const stats = await this.sslService.getDashboardStats();

      await this.emailService.sendWeeklyHealthReport({
        stats: {
          totalDomains: stats.total,
          validCertificates: stats.valid,
          expiringCertificates: stats.expiring,
          expiredCertificates: stats.expired,
          recentlyChecked: stats.total, // Approximate
        },
        domains: allRecords.docs,
        weekStart: this.getWeekStart(),
        weekEnd: new Date(),
      });

      this.logger.log("Weekly health report sent successfully");
    } catch (error) {
      this.logger.error("Failed to send weekly health report:", error);
    }
  }

  /**
   * Send email for a single SSL alert
   */
  private async sendSingleAlertEmail(alert: any) {
    const sslInfo = this.sslCheckerService.formatSSLInfoForEmail({
      domain: alert.domain,
      expiryDate: alert.expiryDate,
      daysRemaining: alert.daysRemaining,
      status: alert.status,
      isValid: alert.status === SSLStatus.VALID,
      issuer: alert.issuer,
      serialNumber: alert.serialNumber,
      errorMessage: alert.errorMessage,
    });

    const subject = this.getAlertEmailSubject(alert);
    const priority = alert.status === SSLStatus.EXPIRED ? "high" : "normal";

    await this.emailService.sendSSLAlert({
      domain: alert.domain,
      status: alert.status,
      expiryDate: alert.expiryDate,
      daysRemaining: alert.daysRemaining,
      issuer: alert.issuer,
      serialNumber: alert.serialNumber,
      lastChecked: alert.lastChecked,
      sslInfo,
      subject,
      priority,
    });
  }

  /**
   * Get appropriate email subject based on alert status
   */
  private getAlertEmailSubject(alert: any): string {
    switch (alert.status) {
      case SSLStatus.EXPIRED:
        return `🚨 URGENT: SSL Certificate EXPIRED for ${alert.domain}`;
      case SSLStatus.EXPIRING:
        return `⚠️  SSL Certificate Expiring Soon for ${alert.domain} (${alert.daysRemaining} days)`;
      default:
        return `ℹ️  SSL Certificate Status Update for ${alert.domain}`;
    }
  }

  /**
   * Get start of current week
   */
  private getWeekStart(): Date {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(now.setDate(diff));
  }

  /**
   * Add custom cron job
   */
  async addCustomCronJob(name: string, cronTime: string, callback: () => void) {
    try {
      const job = new CronJob(cronTime, callback);
      this.schedulerRegistry.addCronJob(name, job);
      job.start();
      this.logger.log(
        `Added custom cron job: ${name} with schedule: ${cronTime}`
      );
    } catch (error) {
      this.logger.error(`Failed to add custom cron job ${name}:`, error);
      throw error;
    }
  }

  /**
   * Remove custom cron job
   */
  async removeCustomCronJob(name: string) {
    try {
      this.schedulerRegistry.deleteCronJob(name);
      this.logger.log(`Removed custom cron job: ${name}`);
    } catch (error) {
      this.logger.error(`Failed to remove custom cron job ${name}:`, error);
      throw error;
    }
  }

  /**
   * List all active cron jobs
   */
  getAllCronJobs() {
    const jobs = this.schedulerRegistry.getCronJobs();
    const jobList: { name: string; running: boolean }[] = [];

    jobs.forEach((job, name) => {
      jobList.push({
        name,
        running: job.running,
      });
    });

    return jobList;
  }

  /**
   * Manual trigger for SSL check (for testing or immediate checks)
   */
  async triggerManualSSLCheck() {
    this.logger.log("Manual SSL certificate check triggered");
    await this.checkAllSSLCertificates();
  }

  /**
   * Manual trigger for alert notifications (for testing)
   */
  async triggerManualAlertNotifications() {
    this.logger.log("Manual alert notification check triggered");
    await this.sendAlertNotifications();
  }
}
