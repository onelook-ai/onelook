import { Module } from '@nestjs/common';
import {
  STORAGE_SERVICE_CONFIG,
  StorageService,
  StorageServiceConfig,
} from './storage.service';
import { ConfigService } from '@nestjs/config';

export function getStorageServiceConfig(
  configService: ConfigService,
): StorageServiceConfig {
  const fileStorageRoot = configService.getOrThrow<string>('FILE_STORAGE_ROOT');
  const serveStaticHttpUrlPathRoot = configService.getOrThrow<string>(
    'SERVE_STATIC_HTTP_URL_PATH_ROOT',
  );

  return {
    fileStorageRoot,
    serveStaticHttpUrlPathRoot,
  };
}

@Module({
  providers: [
    {
      provide: STORAGE_SERVICE_CONFIG,
      useFactory: (configService: ConfigService): StorageServiceConfig =>
        getStorageServiceConfig(configService),
      inject: [ConfigService],
    },
    StorageService,
  ],
  exports: [StorageService],
})
export class StorageModule {}
