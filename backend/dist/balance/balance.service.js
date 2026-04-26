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
exports.BalanceService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const expense_model_1 = require("../expenses/expense.model");
const income_model_1 = require("../income/income.model");
const account_type_model_1 = require("../account-types/account-type.model");
const user_model_1 = require("../users/user.model");
let BalanceService = class BalanceService {
    expenseModel;
    incomeModel;
    userModel;
    constructor(expenseModel, incomeModel, userModel) {
        this.expenseModel = expenseModel;
        this.incomeModel = incomeModel;
        this.userModel = userModel;
    }
    async getBalance(userId) {
        const incomes = await this.incomeModel.findAll({ where: { userId } });
        const totalIncome = incomes.reduce((acc, curr) => acc + Number(curr.value), 0);
        const expenses = await this.expenseModel.findAll({ where: { userId } });
        const totalExpenses = expenses.reduce((acc, curr) => {
            if (curr.isPaid) {
                return acc + Number(curr.value);
            }
            return acc;
        }, 0);
        const user = await this.userModel.findByPk(userId);
        const emergencyFund = Number(user?.emergencyFund || 0);
        return {
            balance: Number((totalIncome - totalExpenses - emergencyFund).toFixed(2)),
            totalIncome: Number(totalIncome.toFixed(2)),
            totalExpenses: Number(totalExpenses.toFixed(2)),
            emergencyFund: Number(emergencyFund.toFixed(2)),
        };
    }
    async updateEmergencyFund(userId, amount) {
        const user = await this.userModel.findByPk(userId);
        if (user) {
            user.emergencyFund = Number(amount);
            await user.save();
        }
        return this.getBalance(userId);
    }
    async getChartData(userId) {
        const expenses = await this.expenseModel.findAll({
            where: { userId },
            include: [{ model: account_type_model_1.AccountType }],
        });
        const incomes = await this.incomeModel.findAll({ where: { userId } });
        const categoryMap = new Map();
        expenses.forEach((e) => {
            if (e.isPaid) {
                const catName = e.accountType?.name || 'Outros';
                categoryMap.set(catName, (categoryMap.get(catName) || 0) + Number(e.value));
            }
        });
        const expensesByCategory = Array.from(categoryMap.entries()).map(([name, value]) => ({
            name,
            value: Number(value.toFixed(2)),
        }));
        const monthlyHistory = [];
        const hoje = new Date();
        for (let i = 5; i >= 0; i--) {
            const dataMes = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
            const mesNome = dataMes.toLocaleString('pt-BR', { month: 'short' }).toUpperCase();
            const currentYear = dataMes.getFullYear();
            const currentMonth = dataMes.getMonth();
            let mesIncome = 0;
            let mesExpenses = 0;
            incomes.forEach((inc) => {
                const d = new Date(inc.incomeDate);
                if (inc.isRecurring || (d.getFullYear() === currentYear && d.getMonth() === currentMonth)) {
                    mesIncome += Number(inc.value);
                }
            });
            expenses.forEach((exp) => {
                const d = new Date(exp.dueDate);
                if (exp.isPaid && (d.getFullYear() === currentYear && d.getMonth() === currentMonth)) {
                    mesExpenses += Number(exp.value);
                }
            });
            monthlyHistory.push({
                month: mesNome,
                income: Number(mesIncome.toFixed(2)),
                expenses: Number(mesExpenses.toFixed(2)),
            });
        }
        return { expensesByCategory, monthlyHistory };
    }
};
exports.BalanceService = BalanceService;
exports.BalanceService = BalanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(expense_model_1.Expense)),
    __param(1, (0, sequelize_1.InjectModel)(income_model_1.Income)),
    __param(2, (0, sequelize_1.InjectModel)(user_model_1.User)),
    __metadata("design:paramtypes", [Object, Object, Object])
], BalanceService);
//# sourceMappingURL=balance.service.js.map