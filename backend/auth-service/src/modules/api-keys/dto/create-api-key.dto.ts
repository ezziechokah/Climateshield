import { IsIn, IsObject, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

import { ApiKeyTier } from '../entities/api-key.entity';

/** POST /v1/api-keys body. */
export class CreateApiKeyDto {
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  name!: string;

  @IsOptional()
  @IsIn(['public', 'partner'])
  tier?: ApiKeyTier;

  @IsOptional()
  @IsObject()
  scope?: Record<string, unknown>;
}
