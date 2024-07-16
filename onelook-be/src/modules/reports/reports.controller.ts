import { Body, Controller, Post, Res } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { GeneratePentestReportReq } from './api-types';
import { Response } from 'express';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('pentest/generate')
  async generatePentestReport(
    @Body() generatePentestReportReq: GeneratePentestReportReq,
    @Res() resp: Response,
  ): Promise<void> {
    return this.reportsService.generatePentestReport(
      generatePentestReportReq,
      resp,
    );
  }
}
