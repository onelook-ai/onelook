import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import Tesseract, { createWorker } from 'tesseract.js';
import { StorageService } from 'src/modules/storage/storage.service';
import { VideoScreenshotsService } from 'src/modules/video-screenshots/video-screenshots.service';
import { VideoScreenshotEntity } from 'src/modules/video-screenshots/video-screenshots.entity';
import { VideoLLMService } from 'src/modules/video-processing/video-llm.service';
import { AnalysisResultsService } from 'src/modules/analysis-results/analysis-results.service';
import * as _ from 'lodash';
import { diffDetection } from 'src/modules/video-processing/diff-detection';

@Injectable()
export class VideoProcessingService {
  private readonly logger = new Logger(VideoProcessingService.name);

  constructor(
    private readonly storageService: StorageService,
    private readonly videoScreenshotsService: VideoScreenshotsService,
    private readonly videoLLMService: VideoLLMService,
    private readonly analysisResultsService: AnalysisResultsService,
  ) {}

  async convertToMP4(
    videoFilePath: string,
    outputFilePath: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(videoFilePath)
        .outputFormat('mp4')
        .outputOptions('-y') // overwrite output file if it exists
        .save(outputFilePath)
        .on('error', (err) => {
          reject(err);
        })
        .on('end', () => {
          resolve();
        });
    });
  }

  async processVideo(sessionId: string, videoFilePath: string): Promise<void> {
    const metadata = await ffprobe(videoFilePath);
    const duration = metadata.format.duration;

    if (!duration) {
      throw new InternalServerErrorException(
        `Failed to get video duration for '${videoFilePath}'`,
      );
    }

    const screenshotsTmpFolder = path.join(os.tmpdir(), sessionId);
    if (!fs.existsSync(screenshotsTmpFolder)) {
      fs.mkdirSync(screenshotsTmpFolder, {
        recursive: true,
      });
    }

    const { intervalToTakeScreenshotsInSecs, aiContextIntervalSecs } =
      this.getProcessIntervals(duration);

    // number of screenshots to process in a single chunk as a segment of the video. In the future, we can vary this based on the video duration.
    const processedSegmentChunkSize = 6;

    const timestamps: number[] = [];
    for (let i = 0; i < duration; i += intervalToTakeScreenshotsInSecs) {
      timestamps.push(i);
    }

    const worker = await createWorker('eng');

    try {
      await Promise.all(
        _.chunk(timestamps, processedSegmentChunkSize).map(
          async (timestampsInSegment) =>
            await this.processVideoSegment(
              sessionId,
              worker,
              videoFilePath,
              screenshotsTmpFolder,
              timestampsInSegment,
              aiContextIntervalSecs,
            ),
        ),
      );
    } finally {
      await worker.terminate();
      fs.rmSync(screenshotsTmpFolder, { recursive: true });
    }
  }

  private async processVideoSegment(
    sessionId: string,
    worker: Tesseract.Worker,
    videoFilePath: string,
    screenshotsFolder: string,
    timestampsInSegment: number[],
    aiContextIntervalSecs: number,
  ) {
    try {
      const screenshotsInSegment: {
        screenshotPath: string;
        timestampSecs: number;
        toProcess: boolean;
      }[] = await Promise.all(
        timestampsInSegment.map(async (timestampSecs) => ({
          ...(await this.takeOneScreenshot(
            videoFilePath,
            timestampSecs,
            screenshotsFolder,
          )),
          toProcess: false,
        })),
      );

      let previousFrameData: number[] = [];
      for (let screenshot of screenshotsInSegment) {
        const { frameData, hasDiff } = await diffDetection(
          screenshot.screenshotPath,
          previousFrameData,
        );
        screenshot.toProcess = hasDiff;
        previousFrameData = frameData;
      }

      const screenshotEntities = (
        await Promise.all(
          screenshotsInSegment.map(async (screenshot) => {
            // partial failures are fine - we catch them and won't set a session's processing status as ERROR.
            try {
              return await this.processScreenshotAtTimestamp(
                sessionId,
                worker,
                videoFilePath,
                screenshot,
              );
            } catch (err) {
              this.logger.error(
                `Failed to process screenshot at ${screenshot.timestampSecs} secs for session ${sessionId}`,
                err,
              );
              return null;
            }
          }),
        )
      ).filter(Boolean) as VideoScreenshotEntity[];

      const analysisResultsResults =
        await this.videoLLMService.analyseVideoScreenshots(
          // only process screenshots at the AI context generation interval
          screenshotEntities.filter(
            (ss) =>
              ss.timestampSecs !== 0 &&
              ss.timestampSecs % aiContextIntervalSecs === 0,
          ),
        );

      if (!analysisResultsResults) {
        return;
      }

      await this.analysisResultsService.updatePartialAnalysisResults(
        sessionId,
        // preserve the original timestamps passed in even though some may have been skipped due to no diff detected
        timestampsInSegment,
        analysisResultsResults,
      );

      this.logger.debug(
        `Processed segment for session ${sessionId}. Timestamps: ${timestampsInSegment.join(', ')}`,
      );
    } catch (err) {
      this.logger.error(
        `Failed to process segment for session ${sessionId}. Timestamps: ${timestampsInSegment.join(', ')}`,
        err,
      );
    }
  }

  private async processScreenshotAtTimestamp(
    sessionId: string,
    worker: Tesseract.Worker,
    videoFilePath: string,
    screenshot: {
      screenshotPath: string;
      timestampSecs: number;
      toProcess: boolean;
    },
  ): Promise<VideoScreenshotEntity | null> {
    try {
      if (!screenshot.toProcess) {
        this.logger.debug(
          `Skipping screenshot at ${screenshot.timestampSecs} secs for session ${sessionId} as no diff detected`,
        );
        return null;
      }
      const folderToMoveTo = path.join(
        path.dirname(this.storageService.getKeyFromPath(videoFilePath)),
        'screenshots',
      );
      const processedScreenshotData =
        await this.extractTextFromScreenshotAndMoveToPermanentStorage(
          sessionId,
          worker,
          folderToMoveTo,
          screenshot,
        );
      if (processedScreenshotData) {
        return await this.videoScreenshotsService.createVideoScreenshot(
          sessionId,
          processedScreenshotData,
        );
      } else {
        return null;
      }
    } finally {
      fs.rmSync(screenshot.screenshotPath);
    }
  }

  private async takeOneScreenshot(
    videoFilePath: string,
    timestampSecs: number,
    screenshotsFolder: string,
  ): Promise<{ screenshotPath: string; timestampSecs: number }> {
    return new Promise((resolve, reject) => {
      const filename = `screenshot_at_${timestampSecs}_secs.png`;
      const screenshotPath = path.join(screenshotsFolder, filename);
      ffmpeg(videoFilePath)
        .screenshots({
          timestamps: [timestampSecs],
          filename,
          folder: screenshotsFolder,
        })
        .on('error', (err) => {
          reject(err);
        })
        .on('end', () => {
          resolve({
            screenshotPath,
            timestampSecs,
          });
        });
    });
  }

  private async extractTextFromScreenshotAndMoveToPermanentStorage(
    sessionId: string,
    worker: Tesseract.Worker,
    folder: string,
    screenshot: {
      screenshotPath: string;
      timestampSecs: number;
    },
  ): Promise<{
    extractedText: string;
    timestampSecs: number;
    fullStoragePath: string;
  } | null> {
    try {
      const imageDataBuffer = fs.readFileSync(screenshot.screenshotPath);
      const result = await worker.recognize(imageDataBuffer);
      this.logger.debug(
        `Extracted text from screenshot at ${screenshot.timestampSecs} secs`,
      );

      const storageKey = path.join(
        folder,
        path.basename(screenshot.screenshotPath),
      );
      const fullStoragePath = this.storageService.storeFile(
        storageKey,
        imageDataBuffer,
      );

      return {
        extractedText: result.data.text,
        timestampSecs: screenshot.timestampSecs,
        fullStoragePath,
      };
    } catch (err) {
      this.logger.error(
        `Failed to process screenshot at ${screenshot.timestampSecs} secs for session ${sessionId}`,
        err,
      );
      return null;
    }
  }

  /**
   * Returns the intervals to take screenshots and AI context generation interval based on the video duration.
   */
  private getProcessIntervals(durationInSecs: number): {
    intervalToTakeScreenshotsInSecs: number;
    aiContextIntervalSecs: number;
  } {
    // these values are arbitrary. can adjust when we have more data.
    // intervalToTakeScreenshotsInSecs must be a factor of aiContextIntervalSecs, if not, we will miss screenshots for AI context generation.
    if (durationInSecs <= 60) {
      return {
        intervalToTakeScreenshotsInSecs: 2,
        aiContextIntervalSecs: 14,
      };
    } else if (durationInSecs <= 180) {
      return {
        intervalToTakeScreenshotsInSecs: 3,
        aiContextIntervalSecs: 30,
      };
    } else if (durationInSecs <= 300) {
      return {
        intervalToTakeScreenshotsInSecs: 5,
        aiContextIntervalSecs: 45,
      };
    } else if (durationInSecs <= 600) {
      return {
        intervalToTakeScreenshotsInSecs: 6,
        aiContextIntervalSecs: 60,
      };
    } else if (durationInSecs <= 1200) {
      return {
        intervalToTakeScreenshotsInSecs: 10,
        aiContextIntervalSecs: 180,
      };
    } else {
      return {
        intervalToTakeScreenshotsInSecs: 10,
        aiContextIntervalSecs: 300,
      };
    }
  }
}

function ffprobe(filePath: string): Promise<ffmpeg.FfprobeData> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        resolve(metadata);
      }
    });
  });
}
