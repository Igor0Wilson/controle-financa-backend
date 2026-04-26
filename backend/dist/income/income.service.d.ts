import { Income } from './income.model';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
export declare class IncomeService {
    private incomeModel;
    constructor(incomeModel: typeof Income);
    findAll(userId: string): Promise<Income[]>;
    create(dto: CreateIncomeDto, userId: string): Promise<Income>;
    remove(id: string, userId: string): Promise<void>;
    update(id: string, dto: UpdateIncomeDto, userId: string): Promise<Income>;
    getTotalIncome(userId: string): Promise<number>;
}
