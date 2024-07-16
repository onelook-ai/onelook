import { ApiProperty } from '@nestjs/swagger';
import { SessionVideoContextResp } from 'src/modules/session-video-contexts/api-types';
import { ProcessingStatus } from 'src/modules/sessions/api-types';

class ScreenshotResp {
  @ApiProperty()
  timestampSecs: number;

  @ApiProperty()
  url: string;

  @ApiProperty()
  extractedText: string;
}

export class AnalysisResultsResp {
  @ApiProperty()
  sessionId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  status: ProcessingStatus;

  @ApiProperty()
  videoUrl: string | null;

  @ApiProperty({ type: [ScreenshotResp] })
  screenshots: ScreenshotResp[];

  @ApiProperty()
  analysisResults: any;

  @ApiProperty({ type: [SessionVideoContextResp] })
  videoContexts: SessionVideoContextResp[];
}
