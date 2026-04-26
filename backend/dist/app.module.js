"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const sequelize_1 = require("@nestjs/sequelize");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const account_types_module_1 = require("./account-types/account-types.module");
const expenses_module_1 = require("./expenses/expenses.module");
const income_module_1 = require("./income/income.module");
const balance_module_1 = require("./balance/balance.module");
const user_model_1 = require("./users/user.model");
const account_type_model_1 = require("./account-types/account-type.model");
const expense_model_1 = require("./expenses/expense.model");
const income_model_1 = require("./income/income.model");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            sequelize_1.SequelizeModule.forRoot({
                dialect: 'mysql',
                host: process.env.DB_HOST || 'localhost',
                port: Number(process.env.DB_PORT) || 3306,
                username: process.env.DB_USER || 'root',
                password: process.env.DB_PASS || '',
                database: process.env.DB_NAME || 'financeiro',
                models: [user_model_1.User, account_type_model_1.AccountType, expense_model_1.Expense, income_model_1.Income],
                autoLoadModels: true,
                synchronize: false,
                logging: false,
                define: {
                    charset: 'utf8mb4',
                    collate: 'utf8mb4_unicode_ci',
                },
                dialectOptions: {
                    charset: 'utf8mb4',
                },
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            account_types_module_1.AccountTypesModule,
            expenses_module_1.ExpensesModule,
            income_module_1.IncomeModule,
            balance_module_1.BalanceModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map