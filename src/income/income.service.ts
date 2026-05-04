import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Income } from './income.model';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';

@Injectable()
export class IncomeService {
  constructor(@InjectModel(Income) private incomeModel: typeof Income) {}

  async findAll(userId: string): Promise<Income[]> {
    return this.incomeModel.findAll({
      where: { userId },
      order: [['income_date', 'DESC']],
    });
  }

  async create(dto: CreateIncomeDto, userId: string): Promise<Income> {
    return this.incomeModel.create({ ...dto, userId } as any);
  }

  async remove(id: string, userId: string): Promise<void> {
    const income = await this.incomeModel.findOne({ where: { id, userId } });
    if (!income) throw new NotFoundException('Renda não encontrada');
    await income.destroy();
  }

  async update(id: string, dto: UpdateIncomeDto, userId: string): Promise<Income> {
    const income = await this.incomeModel.findOne({ where: { id, userId } });
    if (!income) throw new NotFoundException('Renda não encontrada');

    await income.update(dto as any);
    return income;
  }

  async getTotalIncome(userId: string): Promise<number> {
    const hoje = new Date();
    const incomes = await this.incomeModel.findAll({ where: { userId } });

    let total = 0;
    for (const income of incomes) {
      if (income.isRecurring) {
        const dataOriginal = new Date(income.incomeDate);
        const creditoMes = new Date(
          hoje.getFullYear(),
          hoje.getMonth(),
          dataOriginal.getDate(),
        );
        if (creditoMes <= hoje) {
          total += Number(income.value);
        }
      } else {
        const dataIncome = new Date(income.incomeDate);
        if (dataIncome <= hoje) {
          total += Number(income.value);
        }
      }
    }

    return total;
  }
}
