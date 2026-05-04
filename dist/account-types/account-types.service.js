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
exports.AccountTypesService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const account_type_model_1 = require("./account-type.model");
let AccountTypesService = class AccountTypesService {
    accountTypeModel;
    constructor(accountTypeModel) {
        this.accountTypeModel = accountTypeModel;
    }
    async findAll(userId) {
        return this.accountTypeModel.findAll({ where: { userId } });
    }
    async create(dto, userId) {
        return this.accountTypeModel.create({ ...dto, userId });
    }
    async delete(id, userId) {
        await this.accountTypeModel.destroy({ where: { id, userId } });
    }
};
exports.AccountTypesService = AccountTypesService;
exports.AccountTypesService = AccountTypesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(account_type_model_1.AccountType)),
    __metadata("design:paramtypes", [Object])
], AccountTypesService);
//# sourceMappingURL=account-types.service.js.map