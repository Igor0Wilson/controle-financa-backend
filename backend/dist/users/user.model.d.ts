import { Model } from 'sequelize-typescript';
import { AccountType } from '../account-types/account-type.model';
import { Expense } from '../expenses/expense.model';
import { Income } from '../income/income.model';
export declare class User extends Model {
    id: string;
    name: string;
    email: string;
    password: string;
    accountTypes: AccountType[];
    expenses: Expense[];
    incomes: Income[];
    emergencyFund: number;
    static assignId(instance: User): void;
}
