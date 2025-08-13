import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { CronJobsService } from './cron-jobs.service';
import { SSLModule } from '../ssl/ssl.module';
import { EmailModule } from 'src/services/email/email.module';
import { SslCheckerService } from 'src/services/ssl-checker.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    SSLModule,
    EmailModule,
  ],
  controllers: [],
  providers: [CronJobsService, SslCheckerService],
  exports: [CronJobsService],
})
export class CronJobsModule {}
