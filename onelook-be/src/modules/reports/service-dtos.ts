import { ContextType } from '../session-video-contexts/api-types';

export type RecordingContextServiceDto = {
  contextType: ContextType;
  timestampSecs: number;
  content: string;
};

export type RecordingScreenshotServiceDto = {
  timestampSecs: number;
  url: string;
  extractedText: string;
};

export type GeneratePentestReportReqServiceDto = {
  id: string;
  contexts: RecordingContextServiceDto[];
  screenshots: RecordingScreenshotServiceDto[];
};
