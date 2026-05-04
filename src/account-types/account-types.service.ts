import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AccountType } from './account-type.model';
import { CreateAccountTypeDto } from './dto/create-account-type.dto';

@Injectable()
export class AccountTypesService {
  constructor(
    @InjectModel(AccountType) private accountTypeModel: typeof AccountType,
  ) {}

  async findAll(userId: string): Promise<AccountType[]> {
    return this.accountTypeModel.findAll({ where: { userId } });
  }

  async create(dto: CreateAccountTypeDto, userId: string): Promise<AccountType> {
    return this.accountTypeModel.create({ ...dto, userId } as any);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.accountTypeModel.destroy({ where: { id, userId } });
  }
}
