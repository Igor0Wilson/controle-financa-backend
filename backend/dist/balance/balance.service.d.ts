import { Expense } from '../expenses/expense.model';
import { Income } from '../income/income.model';
import { User } from '../users/user.model';
export declare class BalanceService {
    private expenseModel;
    private incomeModel;
    private userModel;
    constructor(expenseModel: typeof Expense, incomeModel: typeof Income, userModel: typeof User);
    getBalance(userId: string): Promise<{
        balance: number;
        totalIncome: number;
        totalExpenses: number;
        emergencyFund: number;
    }>;
    updateEmergencyFund(userId: string, amount: number): Promise<{
        balance: number;
        totalIncome: number;
        totalExpenses: number;
        emergencyFund: number;
    }>;
    getChartData(userId: string): Promise<{
        expensesByCategory: {
            name: string;
            value: number;
        }[];
        monthlyHistory: any[];
    }>;
}
