import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsIn, IsOptional, IsString } from "class-validator";

export class ListReservationsQuery {
  @ApiPropertyOptional() @IsOptional() @IsString() userId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() equipmentId?: string;
  @ApiPropertyOptional({ enum:["ACTIVE","CANCELLED","EXPIRED","FULFILLED"] })
  @IsOptional() @IsString() @IsIn(["ACTIVE","CANCELLED","EXPIRED","FULFILLED"])
  status?: "ACTIVE"|"CANCELLED"|"EXPIRED"|"FULFILLED";
  @ApiPropertyOptional() @IsOptional() @IsDateString() from?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() to?: string;
}
