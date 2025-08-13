import { Injectable, Logger } from "@nestjs/common";
const sslChecker = require("ssl-checker");
import { SSLStatus } from "../schemas/alert.schema";
import { ENV } from "../config";

export interface SSLCheckResult {
  domain: string;
  expiryDate: Date;
  daysRemaining: number;
  status: SSLStatus;
  isValid: boolean;
  issuer?: string;
  serialNumber?: string;
  errorMessage?: string;
}

@Injectable()
export class SslCheckerService {
  private readonly logger = new Logger(SslCheckerService.name);

  /**
   * Check SSL certificate for a domain
   * @param domain - Domain to check (without protocol)
   * @returns SSL certificate information
   */
  async checkDomainSSL(domain: string): Promise<SSLCheckResult> {
    try {
      // Clean domain - remove protocol if present
      const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/$/, "");

      this.logger.log(`Checking SSL for domain: ${cleanDomain}`);

      const result = await sslChecker(cleanDomain, {
        method: "GET",
        port: 443,
        protocol: "https:",
        timeout: 10000,
      });

      const expiryDate = new Date(result.validTo);
      const currentDate = new Date();
      const timeDiff = expiryDate.getTime() - currentDate.getTime();
      const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

      let status: SSLStatus = SSLStatus.VALID;

      if (daysRemaining <= 0) {
        status = SSLStatus.EXPIRED;
      } else if (daysRemaining <= ENV.SSL_ALERT_THRESHOLD_DAYS) {
        status = SSLStatus.EXPIRING;
      }

      const sslInfo: SSLCheckResult = {
        domain: cleanDomain,
        expiryDate,
        daysRemaining,
        status,
        isValid: result.valid && daysRemaining > 0,
        issuer: result.issuer?.O || result.issuer?.CN,
        serialNumber: result.serialNumber,
      };

      this.logger.log(
        `SSL check completed for ${cleanDomain}: ${status} (${daysRemaining} days remaining)`
      );

      return sslInfo;
    } catch (error) {
      this.logger.error(
        `SSL check failed for domain ${domain}: ${error.message}`,
        error.stack
      );

      return {
        domain: domain.replace(/^https?:\/\//, "").replace(/\/$/, ""),
        expiryDate: new Date(),
        daysRemaining: 0,
        status: SSLStatus.EXPIRED,
        isValid: false,
        errorMessage: error.message || "SSL check failed",
      };
    }
  }

  /**
   * Check multiple domains in parallel
   * @param domains - Array of domains to check
   * @returns Array of SSL check results
   */
  async checkMultipleDomains(domains: string[]): Promise<SSLCheckResult[]> {
    this.logger.log(`Checking SSL for ${domains.length} domains`);

    const promises = domains.map((domain) => this.checkDomainSSL(domain));
    const results = await Promise.allSettled(promises);

    return results.map((result, index) => {
      if (result.status === "fulfilled") {
        return result.value;
      } else {
        this.logger.error(
          `Failed to check SSL for domain ${domains[index]}: ${result.reason}`
        );
        return {
          domain: domains[index],
          expiryDate: new Date(),
          daysRemaining: 0,
          status: SSLStatus.EXPIRED,
          isValid: false,
          errorMessage: result.reason?.message || "SSL check failed",
        };
      }
    });
  }

  /**
   * Get domains that need alerts (expiring or expired)
   * @param sslResults - Array of SSL check results
   * @returns Domains that need alerts
   */
  getDomainsNeedingAlerts(sslResults: SSLCheckResult[]): SSLCheckResult[] {
    return sslResults.filter(
      (result) =>
        result.status === SSLStatus.EXPIRING ||
        result.status === SSLStatus.EXPIRED
    );
  }

  /**
   * Format SSL information for email alerts
   * @param sslResult - SSL check result
   * @returns Formatted string for email
   */
  formatSSLInfoForEmail(sslResult: SSLCheckResult): string {
    const statusEmoji = {
      [SSLStatus.VALID]: "✅",
      [SSLStatus.EXPIRING]: "⚠️",
      [SSLStatus.EXPIRED]: "❌",
    };

    return `
${statusEmoji[sslResult.status]} Domain: ${sslResult.domain}
📅 Expires: ${sslResult.expiryDate.toDateString()}
⏰ Days Remaining: ${sslResult.daysRemaining}
🏢 Issuer: ${sslResult.issuer || "Unknown"}
🆔 Serial: ${sslResult.serialNumber || "Unknown"}
${sslResult.errorMessage ? `❗ Error: ${sslResult.errorMessage}` : ""}
    `;
  }
}
