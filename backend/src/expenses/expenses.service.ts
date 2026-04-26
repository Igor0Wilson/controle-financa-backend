import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Expense } from './expense.model';
import { AccountType } from '../account-types/account-type.model';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { v4 as uuidv4 } from 'uuid';

export type ExpenseStatus = 'pago' | 'em_atraso' | 'pendente';

export interface ExpenseWithStatus extends Expense {
  status: ExpenseStatus;
}

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense) private expenseModel: typeof Expense,
  ) {}

  private calcularStatus(expense: Expense): ExpenseStatus {
    if (expense.isPaid) return 'pago';

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    let vencimento: Date;

    if (expense.isRecurring) {
      const dataOriginal = new Date(expense.dueDate);
      vencimento = new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        dataOriginal.getDate(),
      );
    } else {
      vencimento = new Date(expense.dueDate);
      vencimento.setHours(0, 0, 0, 0);
    }

    return vencimento < hoje ? 'em_atraso' : 'pendente';
  }

  async findAll(userId: string): Promise<any[]> {
    const expenses = await this.expenseModel.findAll({
      where: { userId },
      include: [{ model: AccountType }],
      order: [['due_date', 'ASC']],
    });

    return expenses.map((e) => ({
      ...e.toJSON(),
      status: this.calcularStatus(e),
    }));
  }

  async create(dto: CreateExpenseDto, userId: string): Promise<any> {
    if (dto.isInstallment && dto.installmentCount && dto.installmentCount >= 2) {
      return this.criarParceladas(dto, userId);
    }

    const expense = await this.expenseModel.create({
      ...dto,
      userId,
      isPaid: dto.isPaid ?? false,
    } as any);

    return { ...expense.toJSON(), status: this.calcularStatus(expense) };
  }

  private async criarParceladas(dto: CreateExpenseDto, userId: string): Promise<any[]> {
    const parentId = uuidv4();
    const parcelas: any[] = [];
    const dataBase = new Date(dto.dueDate);

    for (let i = 0; i < dto.installmentCount!; i++) {
      const vencimento = new Date(dataBase);
      vencimento.setMonth(vencimento.getMonth() + i);

      const parcela = await this.expenseModel.create({
        id: i === 0 ? parentId : uuidv4(),
        userId,
        accountTypeId: dto.accountTypeId,
        name: `${dto.name} (${i + 1}/${dto.installmentCount})`,
        value: Number((dto.value / dto.installmentCount!).toFixed(2)),
        dueDate: vencimento.toISOString().split('T')[0],
        isRecurring: false,
        isInstallment: true,
        installmentCount: dto.installmentCount,
        installmentNumber: i + 1,
        parentExpenseId: i === 0 ? null : parentId,
        isPaid: false,
      } as any);

      parcelas.push({ ...parcela.toJSON(), status: this.calcularStatus(parcela) });
    }

    return parcelas;
  }

  async markAsPaid(id: string, userId: string): Promise<any> {
    const expense = await this.expenseModel.findOne({ where: { id, userId } });
    if (!expense) throw new NotFoundException('Despesa não encontrada');

    expense.isPaid = true;
    await expense.save();

    return { ...expense.toJSON(), status: 'pago' };
  }

  async remove(id: string, userId: string): Promise<void> {
    const expense = await this.expenseModel.findOne({ where: { id, userId } });
    if (!expense) throw new NotFoundException('Despesa não encontrada');
    await expense.destroy();
  }

  async update(id: string, dto: UpdateExpenseDto, userId: string): Promise<any> {
    const expense = await this.expenseModel.findOne({ where: { id, userId } });
    if (!expense) throw new NotFoundException('Despesa não encontrada');

    await expense.update(dto as any);
    return { ...expense.toJSON(), status: this.calcularStatus(expense) };
  }

  async getTotalPaidCurrentMonth(userId: string): Promise<number> {
    const hoje = new Date();
    const expenses = await this.expenseModel.findAll({ where: { userId } });

    let total = 0;
    for (const expense of expenses) {
      if (!expense.isPaid && !expense.isRecurring) continue;

      if (expense.isRecurring) {
        const dataOriginal = new Date(expense.dueDate);
        const vencimentoMes = new Date(
          hoje.getFullYear(),
          hoje.getMonth(),
          dataOriginal.getDate(),
        );
        if (vencimentoMes <= hoje) {
          total += Number(expense.value);
        }
      } else if (expense.isPaid) {
        total += Number(expense.value);
      }
    }

    return total;
  }
}
