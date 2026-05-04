import { Model } from 'sequelize-typescript';
import { User } from '../users/user.model';
export declare class AccountType extends Model {
    id: string;
    name: string;
    userId: string;
    user: User;
    static assignId(instance: AccountType): void;
}
