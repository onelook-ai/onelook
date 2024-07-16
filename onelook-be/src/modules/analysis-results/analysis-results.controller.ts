import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import {
  AnalysisResultsService,
  AnalysisResultsServiceDto,
} from 'src/modules/analysis-results/analysis-results.service';
import { AnalysisResultsResp } from 'src/modules/analysis-results/api-types';
import { AnalyticsService } from 'src/modules/analytics/analytics.service';
import { EventNames } from 'src/modules/analytics/constants';
import { v4 as uuidv4 } from 'uuid';

@Controller('analysis-results')
export class AnalysisResultsController {
  constructor(
    private readonly analysisResultsService: AnalysisResultsService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Get(':sessionId')
  @ApiOkResponse({ type: AnalysisResultsResp })
  async getAnalysisResults(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
  ): Promise<AnalysisResultsResp> {
    this.analyticsService.getClient()?.capture({
      distinctId: uuidv4(),
      event: EventNames.SESSION_ANALYSIS_RESULTS_VIEWED,
      properties: {
        sessionId,
      },
    });
    const analysisResults =
      await this.analysisResultsService.getAnalysisResults(sessionId);
    return analysisResultsToResp(analysisResults);
  }
}

function analysisResultsToResp(
  analysisResults: AnalysisResultsServiceDto,
): AnalysisResultsResp {
  return {
    sessionId: analysisResults.sessionId,
    createdAt: analysisResults.createdAt,
    updatedAt: analysisResults.updatedAt,
    status: analysisResults.status,
    videoUrl: analysisResults.videoUrl,
    screenshots: analysisResults.screenshots.map((screenshot) => ({
      timestampSecs: screenshot.timestampSecs,
      url: screenshot.url,
      extractedText: screenshot.extractedText,
    })),
    analysisResults: analysisResults.analysisResults,
    videoContexts: analysisResults.videoContexts.map((videoContext) => ({
      id: videoContext.id,
      createdAt: videoContext.createdAt,
      updatedAt: videoContext.updatedAt,
      contextType: videoContext.contextType,
      timestampSecs: videoContext.timestampSecs,
      content: videoContext.content,
    })),
  };
}
