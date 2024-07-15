export type Resource =
  | 'analysis-results'
  | 'session-analysis-completed-notifications';

export type RecordingContext = {
  contextType: ContextType;
  timestampSecs: number;
  content: string;
};

type ContextType = 'USER' | 'AI';

export type SessionVideoContext = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  contextType: ContextType;
  timestampSecs: number;
  content: string;
};

type ProcessingStatus = 'PROCESSING' | 'COMPLETED' | 'ERROR';

type RecordingScreenshot = {
  timestampSecs: number;
  url: string;
  extractedText: string;
};

export type AnalysisResultsServiceDto = {
  sessionId: string;
  createdAt: Date;
  updatedAt: Date;
  status: ProcessingStatus;
  videoUrl: string;
  screenshots: RecordingScreenshot[];
  analysisResults: {
    // TODO:
    [x: string]: any;
  };
  videoContexts: SessionVideoContext[];
};

export type SessionResp = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  status: ProcessingStatus;
  name: string;
  videoContexts: SessionVideoContext[];
};

export type GeneratePentestReportReq = {
  id: string;
  contexts: RecordingContext[];
  screenshots: RecordingScreenshot[];
};
