import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Expense } from '../expenses/expense.model';
import { Income } from '../income/income.model';
import { AccountType } from '../account-types/account-type.model';
import { User } from '../users/user.model';

@Injectable()
export class BalanceService {
  constructor(
    @InjectModel(Expense) private expenseModel: typeof Expense,
    @InjectModel(Income) private incomeModel: typeof Income,
    @InjectModel(User) private userModel: typeof User,
  ) {}

  async getBalance(userId: string): Promise<{ balance: number; totalIncome: number; totalExpenses: number; emergencyFund: number }> {
    const incomes = await this.incomeModel.findAll({ where: { userId } });
    const totalIncome = incomes.reduce((acc, curr) => acc + Number(curr.value), 0);

    const expenses = await this.expenseModel.findAll({ where: { userId } });
    const totalExpenses = expenses.reduce((acc, curr) => {
      // SÓ debita se estiver marcado como PAGO
      if (curr.isPaid) {
        return acc + Number(curr.value);
      }
      return acc;
    }, 0);

    const user = await this.userModel.findByPk(userId);
    const emergencyFund = Number(user?.emergencyFund || 0);

    return {
      balance: Number((totalIncome - totalExpenses - emergencyFund).toFixed(2)),
      totalIncome: Number(totalIncome.toFixed(2)),
      totalExpenses: Number(totalExpenses.toFixed(2)),
      emergencyFund: Number(emergencyFund.toFixed(2)),
    };
  }

  async updateEmergencyFund(userId: string, amount: number) {
    const user = await this.userModel.findByPk(userId);
    if (user) {
      user.emergencyFund = Number(amount);
      await user.save();
    }
    return this.getBalance(userId);
  }

  async getChartData(userId: string) {
    const expenses = await this.expenseModel.findAll({
      where: { userId },
      include: [{ model: AccountType }],
    });

    const incomes = await this.incomeModel.findAll({ where: { userId } });

    // 1. Gastos por Categoria (Pizza) - Somente Pagos
    const categoryMap = new Map<string, number>();
    expenses.forEach((e) => {
      if (e.isPaid) {
        const catName = e.accountType?.name || 'Outros';
        categoryMap.set(catName, (categoryMap.get(catName) || 0) + Number(e.value));
      }
    });

    const expensesByCategory = Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value: Number(value.toFixed(2)),
    }));

    // 2. Histórico Mensal (Linha) - Últimos 6 meses
    const monthlyHistory: any[] = [];
    const hoje = new Date();

    for (let i = 5; i >= 0; i--) {
      const dataMes = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const mesNome = dataMes.toLocaleString('pt-BR', { month: 'short' }).toUpperCase();
      const currentYear = dataMes.getFullYear();
      const currentMonth = dataMes.getMonth();

      let mesIncome = 0;
      let mesExpenses = 0;

      // Calcular para este mês específico
      incomes.forEach((inc) => {
        const d = new Date(inc.incomeDate);
        if (inc.isRecurring || (d.getFullYear() === currentYear && d.getMonth() === currentMonth)) {
          mesIncome += Number(inc.value);
        }
      });

      expenses.forEach((exp) => {
        const d = new Date(exp.dueDate);
        // SÓ entra no gráfico se estiver PAGO
        if (exp.isPaid && (d.getFullYear() === currentYear && d.getMonth() === currentMonth)) {
          mesExpenses += Number(exp.value);
        }
      });

      monthlyHistory.push({
        month: mesNome,
        income: Number(mesIncome.toFixed(2)),
        expenses: Number(mesExpenses.toFixed(2)),
      });
    }

    return { expensesByCategory, monthlyHistory };
  }
}
