import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Income } from './income.model';
import { IncomeService } from './income.service';
import { IncomeController } from './income.controller';

@Module({
  imports: [SequelizeModule.forFeature([Income])],
  providers: [IncomeService],
  controllers: [IncomeController],
  exports: [IncomeService],
})
export class IncomeModule {}
