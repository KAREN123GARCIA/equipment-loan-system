import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString } from "class-validator";

export class UpdateReservationStatusDto {
  @ApiProperty({ enum:["ACTIVE","CANCELLED","EXPIRED","FULFILLED"] })
  @IsString() @IsIn(["ACTIVE","CANCELLED","EXPIRED","FULFILLED"])
  status!: "ACTIVE"|"CANCELLED"|"EXPIRED"|"FULFILLED";
  @ApiProperty({ required:false }) @IsOptional() @IsString() reason?: string;
}
