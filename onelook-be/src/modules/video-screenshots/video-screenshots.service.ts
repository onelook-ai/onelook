import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VideoScreenshotEntity } from 'src/modules/video-screenshots/video-screenshots.entity';
import { Repository } from 'typeorm';

export type CreateVideoScreenshotData = {
  fullStoragePath: string;
  timestampSecs: number;
  extractedText: string;
};

@Injectable()
export class VideoScreenshotsService {
  constructor(
    @InjectRepository(VideoScreenshotEntity)
    private readonly videoScreenshotEntitiesRepository: Repository<VideoScreenshotEntity>,
  ) {}

  async createVideoScreenshot(
    sessionId: string,
    videoScreenshotData: CreateVideoScreenshotData,
  ): Promise<VideoScreenshotEntity> {
    return await this.videoScreenshotEntitiesRepository.save(
      createVideoScreenshotDataToEntity(sessionId, videoScreenshotData),
    );
  }

  async batchCreateVideoScreenshots(
    sessionId: string,
    videoScreenshotsData: CreateVideoScreenshotData[],
  ): Promise<VideoScreenshotEntity[]> {
    return await this.videoScreenshotEntitiesRepository.save(
      videoScreenshotsData.map((data) =>
        createVideoScreenshotDataToEntity(sessionId, data),
      ),
    );
  }
}

function createVideoScreenshotDataToEntity(
  sessionId: string,
  videoScreenshotData: CreateVideoScreenshotData,
): Partial<VideoScreenshotEntity> {
  return {
    sessionId: sessionId,
    fullStoragePath: videoScreenshotData.fullStoragePath,
    timestampSecs: videoScreenshotData.timestampSecs,
    extractedText: videoScreenshotData.extractedText,
  };
}
