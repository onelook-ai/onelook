import { Global, Module } from '@nestjs/common';
import {
  ANALYTICS_SERVICE_CONFIG,
  AnalyticsService,
  AnalyticsServiceConfig,
} from './analytics.service';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [
    {
      provide: ANALYTICS_SERVICE_CONFIG,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): AnalyticsServiceConfig => ({
        posthogKey: configService.get<string>('POSTHOG_KEY') || '',
        posthogHost: configService.get<string>('POSTHOG_HOST') || '',
      }),
    },
    AnalyticsService,
  ],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
