import { IncomeService } from './income.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
export declare class IncomeController {
    private readonly service;
    constructor(service: IncomeService);
    findAll(req: any): Promise<import("./income.model").Income[]>;
    create(dto: CreateIncomeDto, req: any): Promise<import("./income.model").Income>;
    remove(id: string, req: any): Promise<void>;
    update(id: string, dto: UpdateIncomeDto, req: any): Promise<import("./income.model").Income>;
}
