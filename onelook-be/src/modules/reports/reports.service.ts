import { Injectable, Logger } from '@nestjs/common';
import { GeneratePentestReportReqServiceDto } from './service-dtos';
import { streamText } from 'ai';
import { prompt } from './prompt';
import { Response } from 'express';
import { GenAIService } from '../gen-ai/gen-ai.service';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(private readonly genAIService: GenAIService) {}

  async generatePentestReport(
    generatePentestReportReq: GeneratePentestReportReqServiceDto,
    resp: Response,
  ): Promise<void> {
    const { id, contexts, screenshots } = generatePentestReportReq;

    const userMessage = `
  OCR'ed texts and timestamps:
  """
  ${JSON.stringify(
    screenshots.map(({ extractedText, timestampSecs }) => ({
      timestampSecs,
      extractedText,
    })),
  )}
  """
  
  Contexts:
  """
  ${JSON.stringify(
    contexts.map(({ timestampSecs, contextType, content }) => ({
      timestampSecs,
      addedBy: contextType,
      content,
    })),
  )}
  """
  
  Think about how to fill relevant details into the REPORT_TEMPLATE_STRUCTURE and generate the report in markdown.
      `.trim();

    const streamTextResults = await this.genAIService.streamText({
      system: prompt,
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    streamTextResults.usage.then((usage) =>
      this.logger.debug(usage, 'Report generation token usage'),
    );

    return streamTextResults.pipeAIStreamToResponse(resp);
  }
}
