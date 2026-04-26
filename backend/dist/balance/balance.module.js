"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalanceModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const expense_model_1 = require("../expenses/expense.model");
const income_model_1 = require("../income/income.model");
const account_type_model_1 = require("../account-types/account-type.model");
const user_model_1 = require("../users/user.model");
const balance_service_1 = require("./balance.service");
const balance_controller_1 = require("./balance.controller");
let BalanceModule = class BalanceModule {
};
exports.BalanceModule = BalanceModule;
exports.BalanceModule = BalanceModule = __decorate([
    (0, common_1.Module)({
        imports: [sequelize_1.SequelizeModule.forFeature([expense_model_1.Expense, income_model_1.Income, account_type_model_1.AccountType, user_model_1.User])],
        providers: [balance_service_1.BalanceService],
        controllers: [balance_controller_1.BalanceController],
    })
], BalanceModule);
//# sourceMappingURL=balance.module.js.map