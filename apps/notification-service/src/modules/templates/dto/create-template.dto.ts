import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTemplateDto {
  @ApiProperty({ example: 'LoanDueSoon.email' })
  @IsString() @IsNotEmpty() @MaxLength(120)
  key!: string;

  @ApiProperty({ example: 'email', enum: ['email', 'inapp'] })
  @IsIn(['email', 'inapp'])
  channel!: 'email' | 'inapp';

  @ApiProperty({ example: 'Your loan is due soon' })
  @IsString() @IsNotEmpty() @MaxLength(200)
  subject!: string;

  @ApiProperty({ example: 'Hello {{userName}}, your loan for {{equipmentName}} is due at {{dueDate}}.' })
  @IsString() @IsNotEmpty()
  body!: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional() @IsBoolean()
  enabled?: boolean;
}
