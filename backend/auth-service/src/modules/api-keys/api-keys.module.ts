import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OpaqueTokenService } from '../../common/crypto/opaque-token.service';

import { ApiKeysController } from './api-keys.controller';
import { ApiKeysService } from './api-keys.service';
import { ApiKeyUsage } from './entities/api-key-usage.entity';
import { ApiKey } from './entities/api-key.entity';

/** identity.api_key + api_key_usage — machine-to-machine API key issuance/revocation. */
@Module({
  imports: [TypeOrmModule.forFeature([ApiKey, ApiKeyUsage])],
  controllers: [ApiKeysController],
  providers: [ApiKeysService, OpaqueTokenService],
  exports: [ApiKeysService],
})
export class ApiKeysModule {}
