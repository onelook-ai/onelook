import { Module } from '@nestjs/common';
import { VideoProcessingService } from './video-processing.service';
import { StorageModule } from 'src/modules/storage/storage.module';
import { VideoScreenshotsModule } from 'src/modules/video-screenshots/video-screenshots.module';
import { VideoLLMService } from 'src/modules/video-processing/video-llm.service';
import { AnalysisResultsModule } from 'src/modules/analysis-results/analysis-results.module';
import { GenAIModule } from '../gen-ai/gen-ai.module';

@Module({
  imports: [
    StorageModule,
    VideoScreenshotsModule,
    AnalysisResultsModule,
    GenAIModule,
  ],
  providers: [VideoProcessingService, VideoLLMService],
  exports: [VideoProcessingService],
})
export class VideoProcessingModule {}
