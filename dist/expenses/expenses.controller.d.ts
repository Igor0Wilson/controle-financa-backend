import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
export declare class ExpensesController {
    private readonly service;
    constructor(service: ExpensesService);
    findAll(req: any): Promise<any[]>;
    create(dto: CreateExpenseDto, req: any): Promise<any>;
    markAsPaid(id: string, req: any): Promise<any>;
    remove(id: string, req: any): Promise<void>;
    update(id: string, dto: UpdateExpenseDto, req: any): Promise<any>;
}
