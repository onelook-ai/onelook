import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsString, Min } from 'class-validator';

export enum ContextType {
  USER = 'USER',
  AI = 'AI',
}

export class CreateSessionVideoContextReq {
  @ApiProperty()
  @IsEnum(ContextType)
  contextType: ContextType;

  @ApiProperty()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  timestampSecs: number;

  @ApiProperty()
  @IsString()
  content: string;
}

export class SessionVideoContextResp {
  @ApiProperty()
  id: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  contextType: ContextType;

  @ApiProperty()
  timestampSecs: number;

  @ApiProperty()
  content: string;
}
