import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BalanceService } from './balance.service';

@UseGuards(JwtAuthGuard)
@Controller('balance')
export class BalanceController {
  constructor(private readonly service: BalanceService) {}

  @Get()
  getBalance(@Request() req: any) {
    return this.service.getBalance(req.user.userId);
  }

  @Get('charts')
  getCharts(@Request() req: any) {
    return this.service.getChartData(req.user.userId);
  }

  @Post('emergency-fund')
  updateEmergencyFund(@Request() req: any, @Body('amount') amount: number) {
    return this.service.updateEmergencyFund(req.user.userId, amount);
  }
}
