import { Body, Controller, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { AnalyticsService } from 'src/modules/analytics/analytics.service';
import { EventNames } from 'src/modules/analytics/constants';
import {
  CreateAnalysisCompletedNotificationReq,
  MessageResponse,
} from 'src/modules/session-analysis-completed-notifications/api-types';
import { SessionAnalysisCompletedNotificationsService } from 'src/modules/session-analysis-completed-notifications/session-analysis-completed-notifications.service';
import { v4 as uuidv4 } from 'uuid';

@Controller('session-analysis-completed-notifications')
export class SessionAnalysisCompletedNotificationsController {
  constructor(
    private readonly sessionAnalysisCompletedNotificationsService: SessionAnalysisCompletedNotificationsService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Post('sessions/:sessionId')
  @ApiResponse({ status: '2XX', type: MessageResponse })
  async createSessionAnalysisCompletedNotification(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Body() reqBody: CreateAnalysisCompletedNotificationReq,
  ): Promise<MessageResponse> {
    this.analyticsService.getClient()?.capture({
      distinctId: uuidv4(),
      event: EventNames.SESSION_ANALYSIS_COMPLETED_NOTIFICATION_CREATED,
      properties: {
        sessionId,
        reqBody,
      },
    });
    await this.sessionAnalysisCompletedNotificationsService.createSessionAnalysisCompletedNotification(
      sessionId,
      reqBody.email,
    );

    return {
      message: 'Notification created',
    };
  }
}
