import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsOptional, IsString, MinLength } from "class-validator";

export class CreateReservationDto {
  @ApiProperty() @IsString() @MinLength(3) equipmentId!: string;
  @ApiProperty() @IsDateString() startAt!: string;
  @ApiProperty() @IsDateString() endAt!: string;
  @ApiProperty({ required:false }) @IsOptional() @IsString() notes?: string;
}
