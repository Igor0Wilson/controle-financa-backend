import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
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

    // Rate limiting global: max 60 requests por minuto por IP
    ThrottlerModule.forRoot([
      {
        name: 'global',
        ttl: 60000,
        limit: 60,
      },
    ]),

    SequelizeModule.forRootAsync({
      useFactory: () => {
        const databaseUrl = process.env.DATABASE_URL;

        if (databaseUrl) {
          // Conexão via URL (Neon / produção)
          return {
            dialect: 'postgres' as const,
            dialectModule: require('pg'),
            dialectOptions: {
              ssl: {
                require: true,
                rejectUnauthorized: false,
              },
            },
            uri: databaseUrl,
            models: [User, AccountType, Expense, Income],
            autoLoadModels: true,
            synchronize: false,
            logging: false,
            define: {
              charset: 'utf8',
              underscored: true,
            },
          };
        }

        // Fallback para desenvolvimento local (sem Neon)
        return {
          dialect: 'postgres' as const,
          dialectModule: require('pg'),
          host: process.env.DB_HOST || 'localhost',
          port: Number(process.env.DB_PORT) || 5432,
          username: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASS || '',
          database: process.env.DB_NAME || 'financeiro',
          models: [User, AccountType, Expense, Income],
          autoLoadModels: true,
          synchronize: false,
          logging: false,
          define: {
            charset: 'utf8',
            underscored: true,
          },
        };
      },
    }),

    AuthModule,
    UsersModule,
    AccountTypesModule,
    ExpensesModule,
    IncomeModule,
    BalanceModule,
  ],
  providers: [
    // Aplica ThrottlerGuard globalmente em todos os endpoints
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

