import { Inject, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export const STORAGE_SERVICE_CONFIG = 'STORAGE_SERVICE_CONFIG';

export type StorageServiceConfig = {
  fileStorageRoot: string;
  serveStaticHttpUrlPathRoot: string;
};

@Injectable()
export class StorageService {
  constructor(
    @Inject(STORAGE_SERVICE_CONFIG)
    private readonly config: StorageServiceConfig,
  ) {}

  storeFile(storageKey: string, buffer: Buffer): string {
    const fullPath = path.join(this.config.fileStorageRoot, storageKey);
    const dirPath = path.dirname(fullPath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, {
        recursive: true,
      });
    }
    fs.writeFileSync(fullPath, buffer, {
      mode: 0o644,
    });

    return fullPath;
  }

  getKeyFromPath(filePath: string): string {
    return path.relative(this.config.fileStorageRoot, filePath);
  }

  getHttpURLPathForFullFilePath(filePath: string): string {
    const key = this.getKeyFromPath(filePath);
    return `${this.config.serveStaticHttpUrlPathRoot}${this.config.serveStaticHttpUrlPathRoot.endsWith('/') ? '' : '/'}${key}`;
  }
}
