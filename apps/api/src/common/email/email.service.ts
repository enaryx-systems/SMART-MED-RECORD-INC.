import { Injectable, Logger } from "@nestjs/common";
import sgMail from "@sendgrid/mail";

export interface SendMailInput {
  to: string;
  subject: string;
  text: string;
}

// A missing key never fails the caller's request — these are passive side
// effects of an action that already succeeded (status changed, invoice
// issued), unlike the AI endpoints, which are the primary thing a user
// clicked and should surface a clear error instead.
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private configured = false;

  constructor() {
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      this.configured = true;
    }
  }

  async send(input: SendMailInput): Promise<void> {
    if (!this.configured || !process.env.SENDGRID_FROM_EMAIL) {
      this.logger.log(`[email not configured] to=${input.to} subject="${input.subject}"`);
      return;
    }

    try {
      await sgMail.send({
        to: input.to,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: input.subject,
        text: input.text,
      });
    } catch (err) {
      this.logger.warn(`Failed to send email to ${input.to}: ${(err as Error).message}`);
    }
  }
}
