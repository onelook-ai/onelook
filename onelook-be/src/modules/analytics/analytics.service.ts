import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { PostHog } from 'posthog-node';

export const ANALYTICS_SERVICE_CONFIG = 'ANALYTICS_SERVICE_CONFIG';

export type AnalyticsServiceConfig = {
  posthogKey: string;
  posthogHost: string;
};

@Injectable()
export class AnalyticsService {
  private readonly client?: PostHog;

  constructor(
    @Inject(ANALYTICS_SERVICE_CONFIG)
    private readonly config: AnalyticsServiceConfig,
  ) {
    if (this.config.posthogKey) {
      // set to a low flush interval so that reduce risk of losing events in case of crash/shutdown
      this.client = new PostHog(this.config.posthogKey, {
        host: this.config.posthogHost,
        flushInterval: 3000,
      });
    }
  }

  // ideally we implement onModuleDestroy (see https://docs.nestjs.com/fundamentals/lifecycle-events#lifecycle-events-1) and call client.shutdown() in it
  // to flush Posthog. However this requires enabling app.enableShutdownHooks() in main.ts and that somehow causes issue with TypeORM.

  getClient(): PostHog | undefined {
    return this.client;
  }
}
