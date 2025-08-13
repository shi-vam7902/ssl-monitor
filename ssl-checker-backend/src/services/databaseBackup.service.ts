import { Injectable, Logger } from "@nestjs/common";
import { exec } from "child_process";
import * as url from "url";
import * as fs from "fs-extra";
import * as moment from "moment";
import * as path from "path";
import { ENV } from "src/config";

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  // private readonly backupPath = path.join(__dirname, '..', 'backups');
  private readonly backupPath = path.join(
    process.cwd(),
    "src",
    "public",
    "backups"
  );
  private readonly retentionPeriod = 7;

  constructor() {
    fs.ensureDirSync(this.backupPath);
  }

  async createBackup() {
    const databaseUrl = ENV.MONGO_DB_URL;
    const parsedUrl = new url.URL(databaseUrl);
    const username = parsedUrl.username;
    const password = parsedUrl.password;
    const host = parsedUrl.hostname;
    const port = parsedUrl.port;
    const newDate = new Date().toDateString();
    const databaseName = parsedUrl.pathname.split("/")[1];
    const backupFileName = `${databaseName}_${newDate}_backup.sql`;
    const backupFilePath = path.join(this.backupPath, backupFileName);

    const pgDumpCommand = `PGPASSWORD='${password}' pg_dump -U ${username} -h ${host} -p ${port} ${databaseName} > "${backupFilePath}"`;

    exec(pgDumpCommand, (error, stdout, stderr) => {
      if (error) {
        this.logger.error(`Error creating backup: ${stderr}`);
        return;
      }
      this.logger.log(`Backup created: ${backupFilePath}`);
      this.cleanupOldBackups();
    });
  }

  private cleanupOldBackups() {
    const files = fs.readdirSync(this.backupPath);

    files.forEach((file) => {
      const filePath = path.join(this.backupPath, file);
      const stats = fs.statSync(filePath);
      const fileAgeInDays = moment().diff(moment(stats.mtime), "days");
      // Delete files older than retention period
      if (fileAgeInDays > this.retentionPeriod) {
        this.logger.log(`Deleting old backup: ${file}`);
        fs.removeSync(filePath);
      }
    });
  }
}
