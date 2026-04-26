import { BalanceService } from './balance.service';
export declare class BalanceController {
    private readonly service;
    constructor(service: BalanceService);
    getBalance(req: any): Promise<{
        balance: number;
        totalIncome: number;
        totalExpenses: number;
        emergencyFund: number;
    }>;
    getCharts(req: any): Promise<{
        expensesByCategory: {
            name: string;
            value: number;
        }[];
        monthlyHistory: any[];
    }>;
    updateEmergencyFund(req: any, amount: number): Promise<{
        balance: number;
        totalIncome: number;
        totalExpenses: number;
        emergencyFund: number;
    }>;
}
