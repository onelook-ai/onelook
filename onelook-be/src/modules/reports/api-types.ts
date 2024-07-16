import { ApiProperty } from '@nestjs/swagger';
import { ContextType } from '../session-video-contexts/api-types';
import { IsArray, IsEnum, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class RecordingContext {
  @ApiProperty()
  @IsEnum(ContextType)
  contextType: ContextType;

  @ApiProperty()
  @IsNumber()
  timestampSecs: number;

  @ApiProperty()
  @IsString()
  content: string;
}

export class RecordingScreenshot {
  @ApiProperty()
  @IsNumber()
  timestampSecs: number;

  @ApiProperty()
  @IsString()
  url: string;

  @ApiProperty()
  @IsString()
  extractedText: string;
}

export class GeneratePentestReportReq {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty({ type: [RecordingContext] })
  @IsArray()
  @Type(() => RecordingContext)
  contexts: RecordingContext[];

  @ApiProperty({ type: [RecordingScreenshot] })
  @IsArray()
  @Type(() => RecordingScreenshot)
  screenshots: RecordingScreenshot[];
}
