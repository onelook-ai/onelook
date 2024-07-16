import { Body, Controller, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { AnalyticsService } from 'src/modules/analytics/analytics.service';
import { EventNames } from 'src/modules/analytics/constants';
import {
  CreateSessionVideoContextReq,
  SessionVideoContextResp,
} from 'src/modules/session-video-contexts/api-types';
import { SessionVideoContextsService } from 'src/modules/session-video-contexts/session-video-contexts.service';
import { v4 as uuidv4 } from 'uuid';

@Controller()
export class SessionVideoContextsController {
  constructor(
    private readonly sessionVideoContextsService: SessionVideoContextsService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Post('sessions/:sessionId/video-contexts')
  @ApiOkResponse({ type: SessionVideoContextResp })
  async createSessionVideoContext(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Body() createSessionVideoContextReq: CreateSessionVideoContextReq,
  ): Promise<SessionVideoContextResp> {
    this.analyticsService.getClient()?.capture({
      distinctId: uuidv4(),
      event: EventNames.SESSION_VIDEO_CONTEXT_CREATED,
      properties: {
        sessionId,
        reqBody: createSessionVideoContextReq,
      },
    });

    const entity =
      await this.sessionVideoContextsService.createSessionVideoContext(
        sessionId,
        createSessionVideoContextReq,
      );
    return {
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      contextType: entity.contextType,
      timestampSecs: entity.timestampSecs,
      content: entity.content,
    };
  }
}
