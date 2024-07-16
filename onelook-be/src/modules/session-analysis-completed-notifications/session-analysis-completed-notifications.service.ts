import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailService } from 'src/modules/email/email.service';
import { SessionAnalysisCompletedNotificationEntity } from 'src/modules/session-analysis-completed-notifications/session-analysis-completed-notifications.entity';
import { SessionsService } from 'src/modules/sessions/sessions.service';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class SessionAnalysisCompletedNotificationsService
  implements OnModuleInit
{
  private sessionsService: SessionsService;

  private readonly logger = new Logger(
    SessionAnalysisCompletedNotificationsService.name,
  );

  constructor(
    @InjectRepository(SessionAnalysisCompletedNotificationEntity)
    private readonly sessionAnalysisCompletedNotificationRepository: Repository<SessionAnalysisCompletedNotificationEntity>,
    private readonly emailService: EmailService,
    private moduleRef: ModuleRef,
  ) {}

  onModuleInit() {
    // https://docs.nestjs.com/fundamentals/module-ref. One of the ways to avoid circular dependencies.
    // Not the prettiest, but it works and it's not the most important thing to have the best code organization for now.
    // we need this to check if the session is already completed when creating a notification, and if it is, send the email immediately
    this.sessionsService = this.moduleRef.get(SessionsService, {
      strict: false,
    });
  }

  async createSessionAnalysisCompletedNotification(
    sessionId: string,
    email: string,
  ): Promise<void> {
    await this.sessionAnalysisCompletedNotificationRepository.save({
      sessionId,
      email,
    });
    if (await this.sessionsService.isSessionCompleted(sessionId)) {
      await this.sendEmailForCompletedSession(sessionId);
    }
  }

  async sendEmailForCompletedSession(sessionId: string): Promise<void> {
    const pendingNotifications =
      await this.sessionAnalysisCompletedNotificationRepository.find({
        where: {
          sessionId,
          sentAt: IsNull(),
        },
      });

    const resultsPagePath = 'results';

    await Promise.all(
      pendingNotifications.map(async (notification) => {
        try {
          const sentMessage = await this.emailService.sendEmail({
            to: [
              {
                email: notification.email,
              },
            ],
            subject: `Your pentesting session analysis is ready!`,
            htmlContent: `
            <p>Hello,</p>
            <p>Your pentesting session analysis is ready. View your recording, analysis, and also generate pentesting reports at ${this.emailService.getFrontendUrl()}/${resultsPagePath}/${sessionId}.</p>
            <p>Sincerely,<br>Onelook</p>
          `,
          });
          if (sentMessage) {
            notification.sentAt = new Date();
            notification.messageId = sentMessage.messageId;
            await this.sessionAnalysisCompletedNotificationRepository.save(
              notification,
            );
          }
        } catch (error) {
          this.logger.error(
            `Failed to send email to ${notification.email} for session ${sessionId}`,
            error,
          );
        }
      }),
    );
  }
}
