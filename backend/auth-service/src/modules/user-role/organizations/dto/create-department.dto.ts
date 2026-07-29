import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

/** POST /v1/departments body. */
export class CreateDepartmentDto {
  @IsUUID()
  organization_id!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  code?: string;
}
