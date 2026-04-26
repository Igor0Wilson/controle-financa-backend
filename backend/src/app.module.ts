import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AccountTypesModule } from './account-types/account-types.module';
import { ExpensesModule } from './expenses/expenses.module';
import { IncomeModule } from './income/income.module';
import { BalanceModule } from './balance/balance.module';
import { User } from './users/user.model';
import { AccountType } from './account-types/account-type.model';
import { Expense } from './expenses/expense.model';
import { Income } from './income/income.model';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'financeiro',
      models: [User, AccountType, Expense, Income],
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
    AuthModule,
    UsersModule,
    AccountTypesModule,
    ExpensesModule,
    IncomeModule,
    BalanceModule,
  ],
})
export class AppModule {}
