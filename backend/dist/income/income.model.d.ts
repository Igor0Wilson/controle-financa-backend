import { Model } from 'sequelize-typescript';
import { User } from '../users/user.model';
export declare class Income extends Model {
    id: string;
    userId: string;
    user: User;
    name: string;
    value: number;
    isRecurring: boolean;
    incomeDate: string;
    static assignId(instance: Income): void;
}
