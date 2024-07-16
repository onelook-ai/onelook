import {
  Body,
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  SessionEntityWithContextsJoined,
  SessionsService,
} from 'src/modules/sessions/sessions.service';
import { CreateSessionReq, SessionResp } from 'src/modules/sessions/api-types';
import { ApiOkResponse } from '@nestjs/swagger';
import { AnalyticsService } from 'src/modules/analytics/analytics.service';
import { EventNames } from 'src/modules/analytics/constants';
import { v4 as uuidv4 } from 'uuid';

const parseVideoFilePipe = ({ fileIsRequired }: { fileIsRequired: boolean }) =>
  new ParseFilePipe({
    fileIsRequired,
    validators: [
      new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 * 1024 }), // 2GB
      new FileTypeValidator({ fileType: 'mp4|webm' }),
    ],
  });

@Controller('sessions')
export class SessionsController {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Post()
  @ApiOkResponse({ type: SessionResp })
  @UseInterceptors(FileInterceptor('video-file'))
  async createSession(
    @UploadedFile(parseVideoFilePipe({ fileIsRequired: false }))
    videoFile: Express.Multer.File | undefined,
    @Body() createSessionReq: CreateSessionReq,
  ): Promise<SessionResp> {
    this.analyticsService.getClient()?.capture({
      distinctId: uuidv4(),
      event: EventNames.SESSION_CREATED,
    });

    const session = await this.sessionsService.createSession(
      videoFile,
      createSessionReq.videoContexts || [],
    );

    return sessionWithContextToSessionResp(session);
  }

  @Put(':sessionId/video')
  @ApiOkResponse({ type: SessionResp })
  @UseInterceptors(FileInterceptor('video-file'))
  async uploadSessionVideo(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @UploadedFile(parseVideoFilePipe({ fileIsRequired: true }))
    videoFile: Express.Multer.File,
  ): Promise<SessionResp> {
    this.analyticsService.getClient()?.capture({
      distinctId: uuidv4(),
      event: EventNames.SESSION_VIDEO_UPLOADED,
    });

    const session =
      await this.sessionsService.uploadSessionVideoAndStartProcessing(
        sessionId,
        videoFile,
      );

    return sessionWithContextToSessionResp(session);
  }
}

function sessionWithContextToSessionResp(
  session: SessionEntityWithContextsJoined,
): SessionResp {
  return {
    id: session.id,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    status: session.status,
    name: session.name,
    videoContexts: session.videoContexts.map((videoContext) => ({
      id: videoContext.id,
      createdAt: videoContext.createdAt,
      updatedAt: videoContext.updatedAt,
      contextType: videoContext.contextType,
      timestampSecs: videoContext.timestampSecs,
      content: videoContext.content,
    })),
  };
}
