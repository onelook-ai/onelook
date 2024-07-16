import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class CreateAnalysisCompletedNotificationReq {
  @ApiProperty()
  @IsEmail()
  email: string;
}

export class MessageResponse {
  @ApiResponseProperty()
  message: string;
}
