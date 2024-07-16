import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AnalysisResultsEntity } from 'src/modules/analysis-results/analysis-results.entity';
import { ContextType } from 'src/modules/session-video-contexts/session-video-contexts.entity';
import { SessionVideoContextsService } from 'src/modules/session-video-contexts/session-video-contexts.service';
import { ProcessingStatus } from 'src/modules/sessions/sessions.entity';
import { StorageService } from 'src/modules/storage/storage.service';
import {
  AnalyseVideoScreenshotsResults,
  AnalysedVideoContext,
} from 'src/modules/video-processing/video-llm.service';
import { Repository } from 'typeorm';

export type AnalysisResultsServiceDto = {
  sessionId: string;
  createdAt: Date;
  updatedAt: Date;
  status: ProcessingStatus;
  videoUrl: string | null;
  screenshots: {
    timestampSecs: number;
    url: string;
    extractedText: string;
  }[];
  analysisResults: any;
  videoContexts: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    contextType: ContextType;
    timestampSecs: number;
    content: string;
  }[];
};

@Injectable()
export class AnalysisResultsService {
  constructor(
    @InjectRepository(AnalysisResultsEntity)
    private readonly analysisResultsRepository: Repository<AnalysisResultsEntity>,
    private readonly storageService: StorageService,
    private readonly sessionVideoContextsService: SessionVideoContextsService,
  ) {}

  async getAnalysisResults(
    sessionId: string,
  ): Promise<AnalysisResultsServiceDto> {
    const analysisResultsWithSessionScreenshotsContextsJoined =
      await this.analysisResultsRepository.findOne({
        where: {
          sessionId,
        },
        relations: {
          session: {
            screenshots: true,
            videoContexts: true,
          },
        },
      });

    if (!analysisResultsWithSessionScreenshotsContextsJoined) {
      throw new NotFoundException(
        `Analysis results for session '${sessionId}' not found`,
      );
    }

    const session =
      analysisResultsWithSessionScreenshotsContextsJoined.session!;
    const screenshots = session.screenshots || [];
    const contexts = session.videoContexts || [];

    return {
      sessionId: session.id,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      status: session.status,
      videoUrl: session.videoFullStoragePath
        ? this.storageService.getHttpURLPathForFullFilePath(
            session.videoFullStoragePath,
          )
        : null,
      screenshots: screenshots.map((screenshot) => ({
        timestampSecs: screenshot.timestampSecs,
        url: this.storageService.getHttpURLPathForFullFilePath(
          screenshot.fullStoragePath,
        ),
        extractedText: screenshot.extractedText,
      })),
      analysisResults:
        analysisResultsWithSessionScreenshotsContextsJoined.results,
      videoContexts: contexts.sort((a, b) => a.timestampSecs - b.timestampSecs),
    };
  }

  async updatePartialAnalysisResults(
    sessionId: string,
    timestampsSecs: number[],
    analyseVideoScreenshotsResults: AnalyseVideoScreenshotsResults,
  ): Promise<AnalysisResultsEntity> {
    const analysisResults = await this.analysisResultsRepository.findOne({
      where: {
        sessionId,
      },
    });
    if (!analysisResults) {
      throw new NotFoundException(
        `Analysis results for session '${sessionId}' not found`,
      );
    }

    const { metadata } = analyseVideoScreenshotsResults;
    // filter off duplicate video contexts in succession
    const videoContexts = analyseVideoScreenshotsResults.videoContexts
      .sort((a, b) => a.timestampSecs - b.timestampSecs)
      .reduce((acc, currentContext) => {
        if (!acc.length) {
          acc.push(currentContext);
        } else if (
          acc[acc.length - 1].content.toLowerCase() !==
          currentContext.content.toLowerCase()
        ) {
          acc.push(currentContext);
        }

        return acc;
      }, [] as AnalysedVideoContext[]);
    this.sessionVideoContextsService.batchCreateSessionVideoContexts(
      sessionId,
      videoContexts.map((videoContext) => ({
        contextType: videoContext.contextType,
        timestampSecs: videoContext.timestampSecs,
        content: videoContext.content,
      })),
    );

    analysisResults.results = analysisResults.results || {};
    analysisResults.results[this.makeKeyFromTimestamps(timestampsSecs)] = {
      timestampsSecs,
      results: {
        metadata,
      },
    };
    return this.analysisResultsRepository.save(analysisResults);
  }

  private makeKeyFromTimestamps(timestampsSecs: number[]): string {
    return timestampsSecs.join('_');
  }
}
