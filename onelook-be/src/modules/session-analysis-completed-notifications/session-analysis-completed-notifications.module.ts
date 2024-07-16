import { Module } from '@nestjs/common';
import { SessionAnalysisCompletedNotificationsController } from './session-analysis-completed-notifications.controller';
import { SessionAnalysisCompletedNotificationsService } from './session-analysis-completed-notifications.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionAnalysisCompletedNotificationEntity } from 'src/modules/session-analysis-completed-notifications/session-analysis-completed-notifications.entity';
import { EmailModule } from 'src/modules/email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SessionAnalysisCompletedNotificationEntity]),
    EmailModule,
  ],
  controllers: [SessionAnalysisCompletedNotificationsController],
  providers: [SessionAnalysisCompletedNotificationsService],
  exports: [SessionAnalysisCompletedNotificationsService],
})
export class SessionAnalysisCompletedNotificationsModule {}
