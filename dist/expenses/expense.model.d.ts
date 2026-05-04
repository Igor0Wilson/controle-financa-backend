import { Model } from 'sequelize-typescript';
import { User } from '../users/user.model';
import { AccountType } from '../account-types/account-type.model';
export declare class Expense extends Model {
    id: string;
    userId: string;
    user: User;
    accountTypeId: string;
    accountType: AccountType;
    name: string;
    value: number;
    dueDate: string;
    isRecurring: boolean;
    isInstallment: boolean;
    installmentCount: number | null;
    installmentNumber: number | null;
    parentExpenseId: string | null;
    isPaid: boolean;
    static assignId(instance: Expense): void;
}
