import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  accountTypeId: string;

  @IsNumber()
  @Min(0.01)
  value: number;

  @IsDateString()
  dueDate: string;

  @IsBoolean()
  isRecurring: boolean;

  @IsBoolean()
  @IsOptional()
  isInstallment?: boolean;

  @IsInt()
  @IsOptional()
  @Min(2)
  installmentCount?: number;

  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;
}
