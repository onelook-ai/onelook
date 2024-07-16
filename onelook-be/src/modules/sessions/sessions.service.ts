import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as path from 'path';
import * as fs from 'fs';
import { AnalysisResultsEntity } from 'src/modules/analysis-results/analysis-results.entity';
import {
  ProcessingStatus,
  SessionEntity,
} from 'src/modules/sessions/sessions.entity';
import { StorageService } from 'src/modules/storage/storage.service';
import { VideoProcessingService } from 'src/modules/video-processing/video-processing.service';
import { Repository } from 'typeorm';
import {
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator,
} from 'unique-names-generator';
import { ContextType } from 'src/modules/session-video-contexts/session-video-contexts.entity';
import { SessionAnalysisCompletedNotificationsService } from 'src/modules/session-analysis-completed-notifications/session-analysis-completed-notifications.service';
import { ModuleRef } from '@nestjs/core';

const videosFolder = 'videos';

type SessionVideoContextDto = {
  contextType: ContextType;
  timestampSecs: number;
  content: string;
};

export type SessionEntityWithContextsJoined = SessionEntity & {
  videoContexts: SessionVideoContextDto[];
};

@Injectable()
export class SessionsService implements OnModuleInit {
  private sessionAnalysisCompletedNotificationsService: SessionAnalysisCompletedNotificationsService;
  private readonly logger = new Logger(SessionsService.name);

  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessionsRepository: Repository<SessionEntity>,
    private readonly storageService: StorageService,
    private readonly videoProcessingService: VideoProcessingService,
    private moduleRef: ModuleRef,
  ) {}

  onModuleInit() {
    // https://docs.nestjs.com/fundamentals/module-ref. One of the ways to avoid circular dependencies.
    // Not the prettiest, but it works and it's not the most important thing to have the best code organization for now.
    this.sessionAnalysisCompletedNotificationsService = this.moduleRef.get(
      SessionAnalysisCompletedNotificationsService,
      {
        strict: false,
      },
    );
  }

  async createSession(
    videoFile: Express.Multer.File | undefined,
    videoContexts: SessionVideoContextDto[],
  ): Promise<SessionEntityWithContextsJoined> {
    const { session, requiresConversionToMP4 } =
      await this.sessionsRepository.manager.transaction(async (manager) => {
        const transactionalSessionRepo = manager.getRepository(SessionEntity);
        const transactionalAnalysisResultsRepo = manager.getRepository(
          AnalysisResultsEntity,
        );

        const sessionName = uniqueNamesGenerator({
          dictionaries: [adjectives, colors, animals],
          separator: '-',
          length: 3,
        });

        let session = await this.createSessionWithoutVideo(
          transactionalSessionRepo,
          sessionName,
          videoContexts,
        );

        await transactionalAnalysisResultsRepo.save({
          sessionId: session.id,
          results: {},
        });

        if (videoFile) {
          const storeVideoFileRes = await this.storeVideoFile(
            transactionalSessionRepo,
            videoFile,
            session,
          );

          return storeVideoFileRes;
        }

        return { session, requiresConversionToMP4: false };
      });

    this.processVideoAsync(session, requiresConversionToMP4);

    return session;
  }

  async uploadSessionVideoAndStartProcessing(
    sessionId: string,
    videoFile: Express.Multer.File,
  ): Promise<SessionEntityWithContextsJoined> {
    let session = (await this.sessionsRepository.findOne({
      where: {
        id: sessionId,
      },
      relations: {
        videoContexts: true,
      },
    })) as SessionEntityWithContextsJoined | null;

    if (!session) {
      throw new BadRequestException('Session not found');
    }

    if (session.videoFullStoragePath) {
      throw new BadRequestException('Video already uploaded');
    }

    const storeVideoFileRes = await this.storeVideoFile(
      this.sessionsRepository,
      videoFile,
      session,
    );

    this.processVideoAsync(
      storeVideoFileRes.session,
      storeVideoFileRes.requiresConversionToMP4,
    );

    return session;
  }

  async updateSessionStatus(
    sessionId: string,
    status: ProcessingStatus,
  ): Promise<SessionEntity> {
    const session = await this.sessionsRepository.findOne({
      where: {
        id: sessionId,
      },
    });
    if (!session) {
      throw new BadRequestException('Session not found');
    }
    session.status = status;
    return this.sessionsRepository.save(session);
  }

  async isSessionCompleted(sessionId: string): Promise<boolean> {
    const session = await this.sessionsRepository.findOne({
      where: {
        id: sessionId,
      },
    });
    if (!session) {
      throw new BadRequestException('Session not found');
    }
    return session.status === ProcessingStatus.COMPLETED;
  }

  private async createSessionWithoutVideo(
    repo: Repository<SessionEntity>,
    sessionName: string,
    videoContexts: SessionVideoContextDto[],
  ): Promise<SessionEntityWithContextsJoined> {
    return repo.save({
      name: sessionName,
      videoFullStoragePath: null,
      status: ProcessingStatus.PROCESSING,
      videoContexts: videoContexts.map((videoContext) => ({
        contextType: videoContext.contextType,
        timestampSecs: videoContext.timestampSecs,
        content: videoContext.content,
      })),
    });
  }

  private async storeVideoFile(
    transactionalSessionRepo: Repository<SessionEntity>,
    videoFile: Express.Multer.File,
    session: SessionEntityWithContextsJoined,
  ): Promise<{
    session: SessionEntityWithContextsJoined;
    requiresConversionToMP4: boolean;
  }> {
    const { buffer } = videoFile;
    const videoIsMP4 = isMP4(buffer);
    const videoIsWebM = isWebM(buffer);
    if (!videoIsMP4 && !videoIsWebM) {
      throw new BadRequestException(
        'Invalid file: only MP4 or WebM files are supported.',
      );
    }

    try {
      const storageKey = path.join(
        videosFolder,
        session.id,
        videoFile.originalname,
      );

      const fullStoragePath = this.storageService.storeFile(storageKey, buffer);
      session.videoFullStoragePath = fullStoragePath;
      await transactionalSessionRepo.save(session);

      return {
        session,
        requiresConversionToMP4: videoIsWebM,
      };
    } catch (err) {
      this.logger.error(`Failed to store video for session ${session.id}`, err);
      throw new InternalServerErrorException('Failed to store video');
    }
  }

  // note: if we move to a storage service such as S3, then the following will break in a couple of places, mainly because the code currently reads and writes to disk directly.
  private processVideoAsync(
    sessionEntity: SessionEntity,
    requiresConversionToMP4: boolean,
  ) {
    if (!sessionEntity.videoFullStoragePath) {
      return;
    }

    // process asynchronously

    let sessionVideoDetailsPromise: Promise<{
      sessionId: string;
      videoFullPath: string;
    }>;

    if (requiresConversionToMP4) {
      const convertedFilename = `${sessionEntity.videoFullStoragePath}.mp4`;
      sessionVideoDetailsPromise = this.videoProcessingService
        .convertToMP4(sessionEntity.videoFullStoragePath, convertedFilename)
        .then(async () => {
          const originalFilePath = sessionEntity.videoFullStoragePath!;
          sessionEntity.videoFullStoragePath = convertedFilename;
          await this.sessionsRepository.save(sessionEntity);
          fs.rmSync(originalFilePath);
          return {
            sessionId: sessionEntity.id,
            videoFullPath: sessionEntity.videoFullStoragePath,
          };
        });
    } else {
      sessionVideoDetailsPromise = Promise.resolve({
        sessionId: sessionEntity.id,
        videoFullPath: sessionEntity.videoFullStoragePath,
      });
    }

    sessionVideoDetailsPromise
      .then(async (sessionDetails) => {
        const { sessionId, videoFullPath } = sessionDetails;
        await this.videoProcessingService.processVideo(
          sessionId,
          videoFullPath,
        );
        return sessionDetails;
      })
      .then(async (sessionDetails) => {
        const { sessionId } = sessionDetails;
        this.logger.log(`Finished processing video for session ${sessionId}`);
        const sessionEntity = await this.updateSessionStatus(
          sessionId,
          ProcessingStatus.COMPLETED,
        );
        await this.sessionAnalysisCompletedNotificationsService.sendEmailForCompletedSession(
          sessionId,
        );
        return sessionEntity;
      })
      .catch((err) => {
        this.logger.error(
          `Failed to process video for session ${sessionEntity.id}`,
          err,
        );
        return this.updateSessionStatus(
          sessionEntity.id,
          ProcessingStatus.ERROR,
        );
      })
      .catch((err) => {
        this.logger.error(
          `Failed to update session status for session ${sessionEntity.id}`,
          err,
        );
      });
  }
}

function isMP4(buffer: Buffer): boolean {
  const mp4Signatures = [
    Buffer.from([
      0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x6d, 0x70, 0x34, 0x32,
    ]), // 'mp42'
    Buffer.from([
      0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d,
    ]), // 'isom'
  ];

  const fileSignature = buffer.subarray(0, 12);

  return mp4Signatures.some((signature) => fileSignature.equals(signature));
}

function isWebM(buffer: Buffer): boolean {
  const webmSignature = Buffer.from([0x1a, 0x45, 0xdf, 0xa3]);

  const fileSignature = buffer.subarray(0, 4);

  return fileSignature.equals(webmSignature);
}
