import { Module } from "@nestjs/common";
import { MailerModule } from "@nestjs-modules/mailer";
import { EjsAdapter } from "@nestjs-modules/mailer/dist/adapters/ejs.adapter";
import { join } from "path";
import { EmailService } from "./email.service";
import { ENV } from "src/config";

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async () => ({
        transport: {
          host: ENV.SMTP_MAIL_HOST,
          secure: ENV.EMAIL_PORT === 465, // Use secure for port 465, otherwise false
          port: ENV.EMAIL_PORT,
          auth: {
            user: ENV.SMTP_USERNAME,
            pass: ENV.SMTP_PASSWORD,
          },
          tls: { rejectUnauthorized: false },
        },
        defaults: {
          from: `"SSL Monitor" <${ENV.EMAIL_FROM}>`,
        },
        template: {
          dir: join(__dirname, "../../../public/templates"),
          adapter: new EjsAdapter(),
          options: { strict: false },
        },
      }),
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
