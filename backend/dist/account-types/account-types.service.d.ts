import { AccountType } from './account-type.model';
import { CreateAccountTypeDto } from './dto/create-account-type.dto';
export declare class AccountTypesService {
    private accountTypeModel;
    constructor(accountTypeModel: typeof AccountType);
    findAll(userId: string): Promise<AccountType[]>;
    create(dto: CreateAccountTypeDto, userId: string): Promise<AccountType>;
    delete(id: string, userId: string): Promise<void>;
}
