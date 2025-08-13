import { Injectable, Logger } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { join } from "path";
import * as ejs from "ejs";

import { ENV } from "src/config";
import { SSLStatus } from "src/schemas/alert.schema";

export interface SSLAlertEmailData {
  domain: string;
  status: SSLStatus;
  expiryDate: Date;
  daysRemaining: number;
  issuer?: string;
  serialNumber?: string;
  lastChecked: Date;
  sslInfo: string;
  subject: string;
  priority?: "high" | "normal" | "low";
}

export interface DailySummaryData {
  stats: {
    totalDomains: number;
    validCertificates: number;
    expiringCertificates: number;
    expiredCertificates: number;
    recentlyChecked: number;
  };
  expiredCertificates: any[];
  expiringCertificates: any[];
  date: Date;
}

export interface WeeklyHealthData {
  stats: {
    totalDomains: number;
    validCertificates: number;
    expiringCertificates: number;
    expiredCertificates: number;
    recentlyChecked: number;
  };
  domains: any[];
  weekStart: Date;
  weekEnd: Date;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private mailerService: MailerService) {}

  /**
   * Send SSL certificate alert email
   */
  async sendSSLAlert(alertData: SSLAlertEmailData): Promise<void> {
    try {
      const html = await this.renderSSLAlertTemplate(alertData);

      const mailOptions = {
        from: ENV.EMAIL_FROM,
        to: this.getAdminEmails(),
        subject: alertData.subject,
        html,
        priority: alertData.priority || "normal",
      };

      if (alertData.status === SSLStatus.EXPIRED) {
        mailOptions.priority = "high";
      }

      await this.mailerService.sendMail(mailOptions);
      this.logger.log(`SSL alert email sent for domain: ${alertData.domain}`);
    } catch (error) {
      this.logger.error(
        `Failed to send SSL alert email for ${alertData.domain}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Send daily summary report
   */
  async sendDailySummaryReport(summaryData: DailySummaryData): Promise<void> {
    try {
      const html = await this.renderDailySummaryTemplate(summaryData);

      const mailOptions = {
        from: ENV.EMAIL_FROM,
        to: this.getAdminEmails(),
        subject: `📊 SSL Monitoring Daily Summary - ${this.formatDate(summaryData.date)}`,
        html,
      };

      await this.mailerService.sendMail(mailOptions);
      this.logger.log("Daily summary report email sent");
    } catch (error) {
      this.logger.error("Failed to send daily summary report:", error);
      throw error;
    }
  }

  /**
   * Send weekly health report
   */
  async sendWeeklyHealthReport(healthData: WeeklyHealthData): Promise<void> {
    try {
      const html = await this.renderWeeklyHealthTemplate(healthData);

      const mailOptions = {
        from: ENV.EMAIL_FROM,
        to: this.getAdminEmails(),
        subject: `📈 SSL Monitoring Weekly Health Report - Week of ${this.formatDate(healthData.weekStart)}`,
        html,
      };

      await this.mailerService.sendMail(mailOptions);
      this.logger.log("Weekly health report email sent");
    } catch (error) {
      this.logger.error("Failed to send weekly health report:", error);
      throw error;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    name?: string
  ): Promise<void> {
    try {
      const resetUrl = `${ENV.APP_URL}/reset-password?token=${resetToken}`;

      const html = await this.renderPasswordResetTemplate({
        name: name || "User",
        email,
        resetUrl,
        appUrl: ENV.APP_URL,
      });

      const mailOptions = {
        from: ENV.EMAIL_FROM,
        to: email,
        subject: "🔐 Password Reset Request - SSL Monitor",
        html,
      };

      await this.mailerService.sendMail(mailOptions);
      this.logger.log(`Password reset email sent to: ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${email}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Send welcome email for new user
   */
  async sendWelcomeEmail(
    email: string,
    tempPassword: string,
    role: string
  ): Promise<void> {
    try {
      const html = await this.renderWelcomeTemplate({
        email,
        tempPassword,
        role,
        loginUrl: ENV.APP_URL,
        appUrl: ENV.APP_URL,
      });

      const mailOptions = {
        from: ENV.EMAIL_FROM,
        to: email,
        subject: "👋 Welcome to SSL Monitor - Account Created",
        html,
      };

      await this.mailerService.sendMail(mailOptions);
      this.logger.log(`Welcome email sent to: ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}:`, error);
      throw error;
    }
  }

  /**
   * Test email configuration
   */
  async sendTestEmail(email: string): Promise<void> {
    try {
      const html = `
        <h2>🧪 SSL Monitor - Email Test</h2>
        <p>This is a test email to verify that your email configuration is working correctly.</p>
        <p><strong>Test sent at:</strong> ${new Date().toISOString()}</p>
        <p><strong>Environment:</strong> ${ENV.NODE_ENV}</p>
        <hr>
        <p><em>SSL Monitor System</em></p>
      `;

      const mailOptions = {
        from: ENV.EMAIL_FROM,
        to: email,
        subject: "🧪 SSL Monitor - Email Configuration Test",
        html,
      };

      await this.mailerService.sendMail(mailOptions);
      this.logger.log(`Test email sent to: ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send test email to ${email}:`, error);
      throw error;
    }
  }

  /**
   * Render SSL alert email template
   */
  private async renderSSLAlertTemplate(
    data: SSLAlertEmailData
  ): Promise<string> {
    try {
      return await ejs.renderFile(
        join(__dirname, "../../../public/templates/ssl-alert.ejs"),
        {
          ...data,
          statusColor: this.getStatusColor(data.status),
          statusIcon: this.getStatusIcon(data.status),
          formattedDate: this.formatDate(data.expiryDate),
          formattedLastChecked: this.formatDate(data.lastChecked),
        }
      );
    } catch (error) {
      // Fallback to simple HTML template if EJS template not found
      return this.getSSLAlertFallbackTemplate(data);
    }
  }

  /**
   * Render daily summary email template
   */
  private async renderDailySummaryTemplate(
    data: DailySummaryData
  ): Promise<string> {
    try {
      return await ejs.renderFile(
        join(__dirname, "../../../public/templates/daily-summary.ejs"),
        {
          ...data,
          formattedDate: this.formatDate(data.date),
        }
      );
    } catch (error) {
      return this.getDailySummaryFallbackTemplate(data);
    }
  }

  /**
   * Render weekly health email template
   */
  private async renderWeeklyHealthTemplate(
    data: WeeklyHealthData
  ): Promise<string> {
    try {
      return await ejs.renderFile(
        join(__dirname, "../../../public/templates/weekly-health.ejs"),
        {
          ...data,
          formattedWeekStart: this.formatDate(data.weekStart),
          formattedWeekEnd: this.formatDate(data.weekEnd),
        }
      );
    } catch (error) {
      return this.getWeeklyHealthFallbackTemplate(data);
    }
  }

  /**
   * Render password reset email template
   */
  private async renderPasswordResetTemplate(data: any): Promise<string> {
    try {
      return await ejs.renderFile(
        join(__dirname, "../../../public/templates/password-reset.ejs"),
        data
      );
    } catch (error) {
      return this.getPasswordResetFallbackTemplate(data);
    }
  }

  /**
   * Render welcome email template
   */
  private async renderWelcomeTemplate(data: any): Promise<string> {
    try {
      return await ejs.renderFile(
        join(__dirname, "../../../public/templates/welcome.ejs"),
        data
      );
    } catch (error) {
      return this.getWelcomeFallbackTemplate(data);
    }
  }

  /**
   * Get admin emails from environment or default
   */
  private getAdminEmails(): string[] {
    // You can configure this through environment variables
    // For now, using EMAIL_FROM as default recipient
    return [ENV.EMAIL_FROM];
  }

  /**
   * Get status color for HTML templates
   */
  private getStatusColor(status: SSLStatus): string {
    switch (status) {
      case SSLStatus.VALID:
        return "#28a745"; // Green
      case SSLStatus.EXPIRING:
        return "#ffc107"; // Yellow
      case SSLStatus.EXPIRED:
        return "#dc3545"; // Red
      default:
        return "#6c757d"; // Gray
    }
  }

  /**
   * Get status icon for HTML templates
   */
  private getStatusIcon(status: SSLStatus): string {
    switch (status) {
      case SSLStatus.VALID:
        return "✅";
      case SSLStatus.EXPIRING:
        return "⚠️";
      case SSLStatus.EXPIRED:
        return "🚨";
      default:
        return "ℹ️";
    }
  }

  /**
   * Format date for display
   */
  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(new Date(date));
  }

  /**
   * Fallback SSL alert template
   */
  private getSSLAlertFallbackTemplate(data: SSLAlertEmailData): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: ${this.getStatusColor(data.status)}; text-align: center;">
              ${this.getStatusIcon(data.status)} SSL Certificate Alert
            </h1>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 4px; margin: 20px 0;">
              <h2 style="color: #343a40; margin-top: 0;">Domain: ${data.domain}</h2>
              <p><strong>Status:</strong> ${data.status.toUpperCase()}</p>
              <p><strong>Expiry Date:</strong> ${this.formatDate(data.expiryDate)}</p>
              <p><strong>Days Remaining:</strong> ${data.daysRemaining}</p>
              ${data.issuer ? `<p><strong>Issuer:</strong> ${data.issuer}</p>` : ""}
              <p><strong>Last Checked:</strong> ${this.formatDate(data.lastChecked)}</p>
            </div>

            <div style="margin: 20px 0; padding: 15px; background-color: #e9ecef; border-left: 4px solid ${this.getStatusColor(data.status)};">
              <h3>SSL Certificate Details:</h3>
              <pre style="font-size: 12px; overflow-x: auto;">${data.sslInfo}</pre>
            </div>

            <hr style="margin: 30px 0; border: 0; border-top: 1px solid #dee2e6;">
            <p style="text-align: center; color: #6c757d; font-size: 14px;">
              <em>SSL Monitor System - ${this.formatDate(new Date())}</em>
            </p>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Fallback daily summary template
   */
  private getDailySummaryFallbackTemplate(data: DailySummaryData): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
            <h1 style="color: #007bff; text-align: center;">📊 Daily SSL Summary</h1>
            
            <div style="display: grid; gap: 15px; margin: 20px 0;">
              <div style="padding: 15px; background-color: #d4edda; border-left: 4px solid #28a745; border-radius: 4px;">
                <h3 style="margin: 0; color: #155724;">Total Domains: ${data.stats.totalDomains}</h3>
              </div>
              <div style="padding: 15px; background-color: #d1ecf1; border-left: 4px solid #0c5460; border-radius: 4px;">
                <h3 style="margin: 0; color: #0c5460;">Valid Certificates: ${data.stats.validCertificates}</h3>
              </div>
              <div style="padding: 15px; background-color: #fff3cd; border-left: 4px solid #856404; border-radius: 4px;">
                <h3 style="margin: 0; color: #856404;">Expiring Soon: ${data.stats.expiringCertificates}</h3>
              </div>
              <div style="padding: 15px; background-color: #f8d7da; border-left: 4px solid #721c24; border-radius: 4px;">
                <h3 style="margin: 0; color: #721c24;">Expired: ${data.stats.expiredCertificates}</h3>
              </div>
            </div>

            <hr style="margin: 30px 0;">
            <p style="text-align: center; color: #6c757d;">
              Report generated on ${this.formatDate(data.date)}
            </p>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Fallback weekly health template
   */
  private getWeeklyHealthFallbackTemplate(data: WeeklyHealthData): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
            <h1 style="color: #007bff; text-align: center;">📈 Weekly Health Report</h1>
            <p style="text-align: center; color: #6c757d;">
              Week of ${this.formatDate(data.weekStart)} - ${this.formatDate(data.weekEnd)}
            </p>
            
            <div style="margin: 20px 0;">
              <h2>Summary Statistics</h2>
              <ul>
                <li>Total Domains Monitored: ${data.stats.totalDomains}</li>
                <li>Valid Certificates: ${data.stats.validCertificates}</li>
                <li>Certificates Expiring Soon: ${data.stats.expiringCertificates}</li>
                <li>Expired Certificates: ${data.stats.expiredCertificates}</li>
                <li>Recently Checked: ${data.stats.recentlyChecked}</li>
              </ul>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Fallback password reset template
   */
  private getPasswordResetFallbackTemplate(data: any): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
            <h1 style="color: #007bff;">🔐 Password Reset Request</h1>
            <p>Hello ${data.name},</p>
            <p>You requested a password reset for your SSL Monitor account.</p>
            <p><a href="${data.resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Reset Password</a></p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Fallback welcome template
   */
  private getWelcomeFallbackTemplate(data: any): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
            <h1 style="color: #007bff;">👋 Welcome to SSL Monitor</h1>
            <p>Your account has been created with the following details:</p>
            <ul>
              <li><strong>Email:</strong> ${data.email}</li>
              <li><strong>Role:</strong> ${data.role}</li>
              <li><strong>Temporary Password:</strong> ${data.tempPassword}</li>
            </ul>
            <p><a href="${data.loginUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Login Now</a></p>
            <p><em>Please change your password after first login.</em></p>
          </div>
        </body>
      </html>
    `;
  }
}
