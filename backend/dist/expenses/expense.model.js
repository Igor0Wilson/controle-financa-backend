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
exports.Expense = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const user_model_1 = require("../users/user.model");
const account_type_model_1 = require("../account-types/account-type.model");
const uuid_1 = require("uuid");
let Expense = class Expense extends sequelize_typescript_1.Model {
    user;
    accountType;
    static assignId(instance) {
        if (!instance.id) {
            instance.id = (0, uuid_1.v4)();
        }
    }
};
exports.Expense = Expense;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(uuid_1.v4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(36)),
    __metadata("design:type", String)
], Expense.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_model_1.User),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(36)),
    __metadata("design:type", String)
], Expense.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_model_1.User),
    __metadata("design:type", user_model_1.User)
], Expense.prototype, "user", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => account_type_model_1.AccountType),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(36)),
    __metadata("design:type", String)
], Expense.prototype, "accountTypeId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => account_type_model_1.AccountType),
    __metadata("design:type", account_type_model_1.AccountType)
], Expense.prototype, "accountType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(150), allowNull: false }),
    __metadata("design:type", String)
], Expense.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), allowNull: false }),
    __metadata("design:type", Number)
], Expense.prototype, "value", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATEONLY, allowNull: false }),
    __metadata("design:type", String)
], Expense.prototype, "dueDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BOOLEAN),
    __metadata("design:type", Boolean)
], Expense.prototype, "isRecurring", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BOOLEAN),
    __metadata("design:type", Boolean)
], Expense.prototype, "isInstallment", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: true }),
    __metadata("design:type", Object)
], Expense.prototype, "installmentCount", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: true }),
    __metadata("design:type", Object)
], Expense.prototype, "installmentNumber", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Expense),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(36), allowNull: true }),
    __metadata("design:type", Object)
], Expense.prototype, "parentExpenseId", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BOOLEAN),
    __metadata("design:type", Boolean)
], Expense.prototype, "isPaid", void 0);
__decorate([
    sequelize_typescript_1.BeforeCreate,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Expense]),
    __metadata("design:returntype", void 0)
], Expense, "assignId", null);
exports.Expense = Expense = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'expenses', timestamps: true, underscored: true })
], Expense);
//# sourceMappingURL=expense.model.js.map