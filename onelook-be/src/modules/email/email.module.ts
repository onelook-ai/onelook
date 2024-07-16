import { Module } from '@nestjs/common';
import {
  EMAIL_SERVICE_CONFIG,
  EmailService,
  EmailServiceConfig,
} from './email.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    {
      provide: EMAIL_SERVICE_CONFIG,
      useFactory: async (
        configService: ConfigService,
      ): Promise<EmailServiceConfig> => {
        return {
          brevoApiKey: configService.get<string>('BREVO_API_KEY'),
          sender: {
            name: configService.getOrThrow<string>(
              'TRANSACTIONAL_EMAIL_SENDER_NAME',
            ),
            email: configService.getOrThrow<string>(
              'TRANSACTIONAL_EMAIL_SENDER_EMAIL',
            ),
          },
          frontendUrl: configService.getOrThrow<string>('FRONTEND_URL'),
        };
      },
      inject: [ConfigService],
    },
    EmailService,
  ],
  exports: [EmailService],
})
export class EmailModule {}
