import { Injectable, Logger } from '@nestjs/common';
import { ContextType } from 'src/modules/session-video-contexts/session-video-contexts.entity';
import { VideoScreenshotEntity } from 'src/modules/video-screenshots/video-screenshots.entity';
import { GenAIService } from '../gen-ai/gen-ai.service';
import { z } from 'zod';

export type AnalysedVideoContext = {
  contextType: ContextType;
  timestampSecs: number;
  content: string;
};

export type AnalyseVideoScreenshotsResults = {
  videoContexts: AnalysedVideoContext[];
  metadata: Record<string, any>;
};

const aiContextGenerationFunction = {
  name: 'aiContextGenerationFunction',
  description: 'Adds context to extracted text from video screenshots',
  parameters: z
    .object({
      videoContexts: z
        .array(
          z.object({
            timestampSecs: z
              .number()
              .describe('Timestamp of the video in seconds.'),
            content: z
              .string()
              .describe(
                'A short description (not more than 10 words) of the user action or what was shown on screen.',
              ),
          }),
        )
        .describe('Extracted videoContexts.'),
    })
    .describe('Extracts penetration test details from a video file')
    .required({
      videoContexts: true,
    }),
};

const aiGeneratedContextSystemInstruction = `You are an experienced penetration testing engineer.
You are provided with text that were extracted from a video recording of a penetration test.
Each group of text is denoted by a timestamp and represents the text that appeared on the screen at that timestamp. The timestamp is number of seconds into the video.
There will be multiple groups of text. The user could also be interacting with multiple applications, hence the text could be from different applications.
There could also be errors in the text because they were extracted using OCR.
The format of each group is as follows:
Timestamp <time>s:
<text>

For example,
Timestamp 1s:
ls -l
.git
.gitignore
README.md

The above example means that at 1 second into the video, the user ran the command 'ls -l' and the output was shown on screen.

Your task is to provide context to the text. A context is a short description, not more than 10 words, that describes either the user action or what was shown on screen.
For example, the context for the example above could be 'Listed files in directory'.
Other examples include:
- CVE-2021-99999 lookup
- CVE-2024-12345 found
- Exploit XYZ search
- Network scan
- SQL injection attempt

Notes:
- Be as specific as possible, such as including important details like CVE numbers, exploit names, leaked credentials, etc.
- Not every timestamp needs a context. Each timestamp should only have one context.
`;

@Injectable()
export class VideoLLMService {
  private readonly logger = new Logger(VideoLLMService.name);

  constructor(private readonly genAIService: GenAIService) {}

  async analyseVideoScreenshots(
    screenshotEntities: VideoScreenshotEntity[],
  ): Promise<AnalyseVideoScreenshotsResults | null> {
    const formattedText = screenshotEntities
      .map(
        (screenshot) =>
          `Timestamp ${screenshot.timestampSecs}s:\nText: ${screenshot.extractedText}`,
      )
      .join('\n\n');

    const tools = {};
    tools[aiContextGenerationFunction.name] = aiContextGenerationFunction;

    const results = await this.genAIService.generateText({
      system: aiGeneratedContextSystemInstruction,
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: formattedText,
        },
      ],
      tools,
      toolChoice: 'required',
    });

    this.logger.debug(results.usage, 'Video context generation token usage');

    const videoContextsFromLLM:
      | {
          videoContexts: {
            timestampSecs: number;
            content: string;
          }[];
        }
      | undefined = results.toolCalls.find(
      (tc) => tc.toolName === aiContextGenerationFunction.name,
    )?.args;

    return {
      videoContexts:
        videoContextsFromLLM?.videoContexts.map((vc) => ({
          contextType: ContextType.AI,
          timestampSecs: vc.timestampSecs,
          content: vc.content,
        })) || [],
      metadata: {
        responseMessages: results.responseMessages,
        usage: results.usage,
      },
    };
  }
}
