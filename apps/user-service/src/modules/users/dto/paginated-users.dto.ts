import { ApiProperty } from "@nestjs/swagger";

export class UserResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() username!: string;
  @ApiProperty() email!: string;
  @ApiProperty({ required: false }) firstName?: string | null;
  @ApiProperty({ required: false }) lastName?: string | null;
  @ApiProperty() status!: "ACTIVE" | "DISABLED";
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;
}

export class PaginatedUsersDto {
  @ApiProperty() page!: number;
  @ApiProperty() limit!: number;
  @ApiProperty() total!: number;
  @ApiProperty({ type: [UserResponseDto] }) items!: UserResponseDto[];
}
