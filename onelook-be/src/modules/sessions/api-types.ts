import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import {
  CreateSessionVideoContextReq,
  SessionVideoContextResp,
} from 'src/modules/session-video-contexts/api-types';

export enum ProcessingStatus {
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export class CreateSessionReq {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSessionVideoContextReq)
  @ApiProperty({ type: [CreateSessionVideoContextReq] })
  videoContexts?: CreateSessionVideoContextReq[];
}

export class SessionResp {
  @ApiProperty()
  id: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  status: ProcessingStatus;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: [SessionVideoContextResp] })
  videoContexts: SessionVideoContextResp[];
}
