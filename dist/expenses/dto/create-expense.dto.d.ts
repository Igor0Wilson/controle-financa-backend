export declare class CreateExpenseDto {
    name: string;
    accountTypeId: string;
    value: number;
    dueDate: string;
    isRecurring: boolean;
    isInstallment?: boolean;
    installmentCount?: number;
    isPaid?: boolean;
}
