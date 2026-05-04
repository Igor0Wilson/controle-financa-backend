import { Expense } from './expense.model';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
export type ExpenseStatus = 'pago' | 'em_atraso' | 'pendente';
export interface ExpenseWithStatus extends Expense {
    status: ExpenseStatus;
}
export declare class ExpensesService {
    private expenseModel;
    constructor(expenseModel: typeof Expense);
    private calcularStatus;
    findAll(userId: string): Promise<any[]>;
    create(dto: CreateExpenseDto, userId: string): Promise<any>;
    private criarParceladas;
    markAsPaid(id: string, userId: string): Promise<any>;
    remove(id: string, userId: string): Promise<void>;
    update(id: string, dto: UpdateExpenseDto, userId: string): Promise<any>;
    getTotalPaidCurrentMonth(userId: string): Promise<number>;
}
