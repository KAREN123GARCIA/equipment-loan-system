import { IsDateString, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateLoanDto {
  @IsUUID()
  equipmentId!: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
