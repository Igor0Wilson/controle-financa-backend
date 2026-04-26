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
exports.IncomeService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const income_model_1 = require("./income.model");
let IncomeService = class IncomeService {
    incomeModel;
    constructor(incomeModel) {
        this.incomeModel = incomeModel;
    }
    async findAll(userId) {
        return this.incomeModel.findAll({
            where: { userId },
            order: [['income_date', 'DESC']],
        });
    }
    async create(dto, userId) {
        return this.incomeModel.create({ ...dto, userId });
    }
    async remove(id, userId) {
        const income = await this.incomeModel.findOne({ where: { id, userId } });
        if (!income)
            throw new common_1.NotFoundException('Renda não encontrada');
        await income.destroy();
    }
    async update(id, dto, userId) {
        const income = await this.incomeModel.findOne({ where: { id, userId } });
        if (!income)
            throw new common_1.NotFoundException('Renda não encontrada');
        await income.update(dto);
        return income;
    }
    async getTotalIncome(userId) {
        const hoje = new Date();
        const incomes = await this.incomeModel.findAll({ where: { userId } });
        let total = 0;
        for (const income of incomes) {
            if (income.isRecurring) {
                const dataOriginal = new Date(income.incomeDate);
                const creditoMes = new Date(hoje.getFullYear(), hoje.getMonth(), dataOriginal.getDate());
                if (creditoMes <= hoje) {
                    total += Number(income.value);
                }
            }
            else {
                const dataIncome = new Date(income.incomeDate);
                if (dataIncome <= hoje) {
                    total += Number(income.value);
                }
            }
        }
        return total;
    }
};
exports.IncomeService = IncomeService;
exports.IncomeService = IncomeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(income_model_1.Income)),
    __metadata("design:paramtypes", [Object])
], IncomeService);
//# sourceMappingURL=income.service.js.map