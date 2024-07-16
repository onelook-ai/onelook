import * as fs from 'fs';
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from '../../utils/exception-filter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { LoggerOptions } from 'typeorm';
import { SessionsModule } from 'src/modules/sessions/sessions.module';
import { AnalysisResultsModule } from 'src/modules/analysis-results/analysis-results.module';
import { SessionVideoContextsModule } from 'src/modules/session-video-contexts/session-video-contexts.module';
import { SessionAnalysisCompletedNotificationsModule } from 'src/modules/session-analysis-completed-notifications/session-analysis-completed-notifications.module';
import { AnalyticsModule } from 'src/modules/analytics/analytics.module';
import { ReportsModule } from '../reports/reports.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { getStorageServiceConfig } from '../storage/storage.module';

function getPostgresDbConfig(
  configService: ConfigService,
  dbPrefix: string,
): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    synchronize: false, // never set true in production!
    autoLoadEntities: true,
    logging: configService.get<string>(`SQL_LOGGING`) as LoggerOptions,
    host: configService.get<string>(`${dbPrefix}_HOST`),
    port: configService.get<number>(`${dbPrefix}_PORT`),
    username: configService.get<string>(`${dbPrefix}_USER`),
    password: configService.get<string>(`${dbPrefix}_PW`),
    database: configService.get<string>(`${dbPrefix}_NAME`),
    ssl: configService.get<string>(`${dbPrefix}_SSL_CERT`)
      ? {
          rejectUnauthorized: true,
          ca: fs
            .readFileSync(configService.get<string>(`${dbPrefix}_SSL_CERT`)!)
            .toString(),
        }
      : undefined,
  };
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const storageServiceConfig = getStorageServiceConfig(configService);
        return [
          {
            rootPath: storageServiceConfig.fileStorageRoot,
            serveRoot: storageServiceConfig.serveStaticHttpUrlPathRoot,
            serveStaticOptions: {
              setHeaders: (res) => {
                res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
              },
            },
          },
        ];
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        getPostgresDbConfig(configService, 'DB'),
      inject: [ConfigService],
    }),
    SessionsModule,
    AnalysisResultsModule,
    SessionVideoContextsModule,
    SessionAnalysisCompletedNotificationsModule,
    ReportsModule,
    AnalyticsModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class MainServerModule {}
