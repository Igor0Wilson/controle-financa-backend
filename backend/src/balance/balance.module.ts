import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Expense } from '../expenses/expense.model';
import { Income } from '../income/income.model';
import { AccountType } from '../account-types/account-type.model';
import { User } from '../users/user.model';
import { BalanceService } from './balance.service';
import { BalanceController } from './balance.controller';

@Module({
  imports: [SequelizeModule.forFeature([Expense, Income, AccountType, User])],
  providers: [BalanceService],
  controllers: [BalanceController],
})
export class BalanceModule {}
