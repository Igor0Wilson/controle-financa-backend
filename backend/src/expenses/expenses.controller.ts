import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly service: ExpensesService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.service.findAll(req.user.userId);
  }

  @Post()
  create(@Body() dto: CreateExpenseDto, @Request() req: any) {
    return this.service.create(dto, req.user.userId);
  }

  @Patch(':id/pay')
  markAsPaid(@Param('id') id: string, @Request() req: any) {
    return this.service.markAsPaid(id, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.service.remove(id, req.user.userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateExpenseDto, @Request() req: any) {
    return this.service.update(id, dto, req.user.userId);
  }
}
