import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { EquipmentStatus } from "@prisma/client";

export class CreateEquipmentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  assetTag!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  category?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  brand?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  model?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  serialNumber?: string;

  @IsEnum(EquipmentStatus)
  @IsOptional()
  status?: EquipmentStatus;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  location?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;
}
