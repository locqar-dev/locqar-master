import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('metrics')
  async getMetrics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getMetrics({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('stats')
  async getOverallStats() {
    return this.analyticsService.getOverallStats();
  }

  @Get('packages')
  async getPackageAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getPackageAnalytics({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('terminals')
  async getTerminalAnalytics() {
    return this.analyticsService.getTerminalAnalytics();
  }

  @Get('timeseries/:metric')
  async getTimeSeries(
    @Query('days') days?: string,
  ) {
    return this.analyticsService.getTimeSeries('packagesDelivered', days ? parseInt(days) : 30);
  }

  @Get('report')
  async exportReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.analyticsService.exportAnalyticsReport(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('record-daily')
  async recordDailyMetrics() {
    return this.analyticsService.recordDailyMetrics();
  }
}
