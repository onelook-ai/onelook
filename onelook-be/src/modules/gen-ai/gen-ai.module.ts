import { Module } from '@nestjs/common';
import {
  GENAI_SERVICE_CONFIG,
  GenAIService,
  GenAIServiceConfig,
  GenAIServiceTypes,
} from './gen-ai.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    {
      provide: GENAI_SERVICE_CONFIG,
      useFactory: async (
        configService: ConfigService,
      ): Promise<GenAIServiceConfig> => {
        const service =
          configService.getOrThrow<GenAIServiceTypes>('GENAI_SERVICE');
        const apiKey = configService.get<string>('GENAI_API_KEY') || '';
        const model = configService.get<string>('GENAI_MODEL') || '';
        const baseUrl = configService.get<string>('GENAI_BASE_URL');
        const project = configService.get<string>('GENAI_PROJECT');

        return {
          service,
          baseUrl,
          project,
          apiKey,
          model,
        };
      },
      inject: [ConfigService],
    },
    GenAIService,
  ],
  exports: [GenAIService],
})
export class GenAIModule {}
