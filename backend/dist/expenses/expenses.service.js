"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpensesService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const expense_model_1 = require("./expense.model");
const account_type_model_1 = require("../account-types/account-type.model");
const uuid_1 = require("uuid");
let ExpensesService = class ExpensesService {
    expenseModel;
    constructor(expenseModel) {
        this.expenseModel = expenseModel;
    }
    calcularStatus(expense) {
        if (expense.isPaid)
            return 'pago';
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        let vencimento;
        if (expense.isRecurring) {
            const dataOriginal = new Date(expense.dueDate);
            vencimento = new Date(hoje.getFullYear(), hoje.getMonth(), dataOriginal.getDate());
        }
        else {
            vencimento = new Date(expense.dueDate);
            vencimento.setHours(0, 0, 0, 0);
        }
        return vencimento < hoje ? 'em_atraso' : 'pendente';
    }
    async findAll(userId) {
        const expenses = await this.expenseModel.findAll({
            where: { userId },
            include: [{ model: account_type_model_1.AccountType }],
            order: [['due_date', 'ASC']],
        });
        return expenses.map((e) => ({
            ...e.toJSON(),
            status: this.calcularStatus(e),
        }));
    }
    async create(dto, userId) {
        if (dto.isInstallment && dto.installmentCount && dto.installmentCount >= 2) {
            return this.criarParceladas(dto, userId);
        }
        const expense = await this.expenseModel.create({
            ...dto,
            userId,
            isPaid: dto.isPaid ?? false,
        });
        return { ...expense.toJSON(), status: this.calcularStatus(expense) };
    }
    async criarParceladas(dto, userId) {
        const parentId = (0, uuid_1.v4)();
        const parcelas = [];
        const dataBase = new Date(dto.dueDate);
        for (let i = 0; i < dto.installmentCount; i++) {
            const vencimento = new Date(dataBase);
            vencimento.setMonth(vencimento.getMonth() + i);
            const parcela = await this.expenseModel.create({
                id: i === 0 ? parentId : (0, uuid_1.v4)(),
                userId,
                accountTypeId: dto.accountTypeId,
                name: `${dto.name} (${i + 1}/${dto.installmentCount})`,
                value: Number((dto.value / dto.installmentCount).toFixed(2)),
                dueDate: vencimento.toISOString().split('T')[0],
                isRecurring: false,
                isInstallment: true,
                installmentCount: dto.installmentCount,
                installmentNumber: i + 1,
                parentExpenseId: i === 0 ? null : parentId,
                isPaid: false,
            });
            parcelas.push({ ...parcela.toJSON(), status: this.calcularStatus(parcela) });
        }
        return parcelas;
    }
    async markAsPaid(id, userId) {
        const expense = await this.expenseModel.findOne({ where: { id, userId } });
        if (!expense)
            throw new common_1.NotFoundException('Despesa não encontrada');
        expense.isPaid = true;
        await expense.save();
        return { ...expense.toJSON(), status: 'pago' };
    }
    async remove(id, userId) {
        const expense = await this.expenseModel.findOne({ where: { id, userId } });
        if (!expense)
            throw new common_1.NotFoundException('Despesa não encontrada');
        await expense.destroy();
    }
    async update(id, dto, userId) {
        const expense = await this.expenseModel.findOne({ where: { id, userId } });
        if (!expense)
            throw new common_1.NotFoundException('Despesa não encontrada');
        await expense.update(dto);
        return { ...expense.toJSON(), status: this.calcularStatus(expense) };
    }
    async getTotalPaidCurrentMonth(userId) {
        const hoje = new Date();
        const expenses = await this.expenseModel.findAll({ where: { userId } });
        let total = 0;
        for (const expense of expenses) {
            if (!expense.isPaid && !expense.isRecurring)
                continue;
            if (expense.isRecurring) {
                const dataOriginal = new Date(expense.dueDate);
                const vencimentoMes = new Date(hoje.getFullYear(), hoje.getMonth(), dataOriginal.getDate());
                if (vencimentoMes <= hoje) {
                    total += Number(expense.value);
                }
            }
            else if (expense.isPaid) {
                total += Number(expense.value);
            }
        }
        return total;
    }
};
exports.ExpensesService = ExpensesService;
exports.ExpensesService = ExpensesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(expense_model_1.Expense)),
    __metadata("design:paramtypes", [Object])
], ExpensesService);
//# sourceMappingURL=expenses.service.js.map