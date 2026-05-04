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
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const account_type_model_1 = require("../account-types/account-type.model");
const expense_model_1 = require("../expenses/expense.model");
const income_model_1 = require("../income/income.model");
const uuid_1 = require("uuid");
let User = class User extends sequelize_typescript_1.Model {
    accountTypes;
    expenses;
    incomes;
    static assignId(instance) {
        if (!instance.id) {
            instance.id = (0, uuid_1.v4)();
        }
    }
};
exports.User = User;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(uuid_1.v4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(36)),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(100), allowNull: false }),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    sequelize_typescript_1.Unique,
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(150), allowNull: false }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(255), allowNull: false }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => account_type_model_1.AccountType),
    __metadata("design:type", Array)
], User.prototype, "accountTypes", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => expense_model_1.Expense),
    __metadata("design:type", Array)
], User.prototype, "expenses", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => income_model_1.Income),
    __metadata("design:type", Array)
], User.prototype, "incomes", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(0),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), allowNull: false }),
    __metadata("design:type", Number)
], User.prototype, "emergencyFund", void 0);
__decorate([
    sequelize_typescript_1.BeforeCreate,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User]),
    __metadata("design:returntype", void 0)
], User, "assignId", null);
exports.User = User = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'users', timestamps: true, underscored: true })
], User);
//# sourceMappingURL=user.model.js.map