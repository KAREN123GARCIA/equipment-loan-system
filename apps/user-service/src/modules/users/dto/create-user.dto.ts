import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, Length, Matches } from "class-validator";

export class CreateUserDto {
  @ApiProperty({ example: "jdoe" })
  @IsString()
  @Length(3, 50)
  @Matches(/^[a-zA-Z0-9._-]+$/, { message: "username must be alphanumeric with . _ - allowed" })
  username!: string;

  @ApiProperty({ example: "jdoe@example.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "John", required: false })
  @IsOptional()
  @IsString()
  @Length(1, 80)
  firstName?: string;

  @ApiProperty({ example: "Doe", required: false })
  @IsOptional()
  @IsString()
  @Length(1, 80)
  lastName?: string;
}
