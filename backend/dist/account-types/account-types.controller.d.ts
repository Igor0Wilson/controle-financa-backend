import { AccountTypesService } from './account-types.service';
import { CreateAccountTypeDto } from './dto/create-account-type.dto';
export declare class AccountTypesController {
    private readonly service;
    constructor(service: AccountTypesService);
    findAll(req: any): Promise<import("./account-type.model").AccountType[]>;
    create(dto: CreateAccountTypeDto, req: any): Promise<import("./account-type.model").AccountType>;
    delete(id: string, req: any): Promise<void>;
}
