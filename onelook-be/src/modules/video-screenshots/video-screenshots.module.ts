import { Module } from '@nestjs/common';
import { VideoScreenshotsService } from './video-screenshots.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoScreenshotEntity } from 'src/modules/video-screenshots/video-screenshots.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VideoScreenshotEntity])],
  providers: [VideoScreenshotsService],
  exports: [VideoScreenshotsService],
})
export class VideoScreenshotsModule {}
