import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as Brevo from '@getbrevo/brevo';
import { SendTransactionalEmailRequest } from './types';

export const EMAIL_SERVICE_CONFIG = 'EMAIL_SERVICE_CONFIG';

export type EmailServiceConfig = {
  /**
   * Set to undefined for no op
   */
  brevoApiKey?: string;
  sender: {
    name: string;
    email: string;
  };
  frontendUrl: string;
};

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  private readonly brevoTransactionalEmailsClient?: Brevo.TransactionalEmailsApi;

  constructor(
    @Inject(EMAIL_SERVICE_CONFIG) private readonly config: EmailServiceConfig,
  ) {
    if (!this.config.brevoApiKey) {
      this.brevoTransactionalEmailsClient = undefined;
    } else {
      this.brevoTransactionalEmailsClient = new Brevo.TransactionalEmailsApi();
      this.brevoTransactionalEmailsClient.setApiKey(
        Brevo.TransactionalEmailsApiApiKeys.apiKey,
        this.config.brevoApiKey,
      );
    }
  }

  getFrontendUrl(): string {
    return this.config.frontendUrl;
  }

  async sendEmail(
    sendTransactionalEmailRequest: SendTransactionalEmailRequest,
  ): Promise<{
    messageId: string;
  } | null> {
    if (!this.brevoTransactionalEmailsClient) {
      this.logger.warn(`No-op email service in used. Email not sent.`);
      return null;
    }

    // Should add a sandbox mode in the future to prevent sending emails in dev/staging environments.
    // See https://developers.brevo.com/docs/using-sandbox-mode-to-send-an-email.

    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    sendSmtpEmail.sender = this.config.sender;
    sendSmtpEmail.subject = sendTransactionalEmailRequest.subject;
    sendSmtpEmail.htmlContent = sendTransactionalEmailRequest.htmlContent;
    sendSmtpEmail.to = sendTransactionalEmailRequest.to;

    // note: Brevo's sdk is console logging a debug statement "**** **** *** insidde this"
    const sendResponse =
      await this.brevoTransactionalEmailsClient.sendTransacEmail(sendSmtpEmail);

    if (sendResponse.response.statusCode !== 201) {
      this.logger.error(`Failed to send email.`, sendResponse);
      throw new InternalServerErrorException('Failed to send email');
    }

    return { messageId: sendResponse.body.messageId! };
  }
}
