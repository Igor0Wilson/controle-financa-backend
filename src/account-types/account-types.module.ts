import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AccountType } from './account-type.model';
import { AccountTypesService } from './account-types.service';
import { AccountTypesController } from './account-types.controller';

@Module({
  imports: [SequelizeModule.forFeature([AccountType])],
  providers: [AccountTypesService],
  controllers: [AccountTypesController],
  exports: [AccountTypesService],
})
export class AccountTypesModule {}
