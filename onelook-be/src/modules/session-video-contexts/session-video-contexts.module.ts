import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionVideoContextsController } from 'src/modules/session-video-contexts/session-video-contexts.controller';
import { SessionVideoContextEntity } from 'src/modules/session-video-contexts/session-video-contexts.entity';
import { SessionVideoContextsService } from 'src/modules/session-video-contexts/session-video-contexts.service';

@Module({
  imports: [TypeOrmModule.forFeature([SessionVideoContextEntity])],
  controllers: [SessionVideoContextsController],
  providers: [SessionVideoContextsService],
  exports: [SessionVideoContextsService],
})
export class SessionVideoContextsModule {}
