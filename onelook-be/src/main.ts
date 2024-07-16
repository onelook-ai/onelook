import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import * as path from 'path';
import {
  BadRequestException,
  LogLevel,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { recursivelyGetChildrenErrors } from './utils/validators';
import { MainServerModule } from './modules/main-server/main-server.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

dotenv.config({ path: path.join(__dirname, '../.env') });

const logLevelsMap: { [key: string]: number } = {
  verbose: 0,
  debug: 1,
  log: 2,
  warn: 3,
  error: 4,
  fatal: 5,
};

const logLevelsArray: LogLevel[] = [
  'verbose',
  'debug',
  'log',
  'warn',
  'error',
  'fatal',
];

function getLogLevels(minLevel: string): LogLevel[] {
  const index = logLevelsMap[minLevel];
  return logLevelsArray.slice(index);
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    MainServerModule,
    {
      logger: getLogLevels(process.env.APP_LOG_LEVEL || 'log'),
    },
  );

  app.useBodyParser('json', { limit: '10mb' });

  app.use(helmet());

  const configService: ConfigService = app.get(ConfigService);

  const origins: RegExp[] = (configService.get('ALLOWED_ORIGINS') || '')
    .split(',')
    .map((v: string) => v.trim())
    .filter((v: string) => !!v)
    .map((v: string) => new RegExp(v, 'i'));

  app.set('trust proxy', true);
  app.enableCors({
    origin: origins,
  });

  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.setGlobalPrefix('/api');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const validationErrors = recursivelyGetChildrenErrors(errors, '');
        const responseJson = {
          statusCode: 400,
          message: 'Invalid inputs received.',
          error: 'Bad Request',
          validationErrors,
        };
        return new BadRequestException(responseJson);
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Onelook APIs')
    .setDescription('Onelook APIs')
    .setVersion('1.0')
    .addTag('onelook')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('onelook-apis', app, document);

  await app.listen(configService.getOrThrow('PORT'));
}
bootstrap();
