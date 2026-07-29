import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OpaqueTokenService } from '../../common/crypto/opaque-token.service';
import { PasswordService } from '../../common/crypto/password.service';
import { SessionsModule } from '../sessions/sessions.module';
import { TokensModule } from '../tokens/tokens.module';
import { Agency } from '../user-role/organizations/entities/agency.entity';
import { Role } from '../user-role/roles/entities/role.entity';
import { User } from '../user-role/users/entities/user.entity';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailVerificationToken } from './entities/email-verification-token.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { InternalAuthController } from './internal-auth.controller';

/** Login, MFA verify, SSO callback, password reset, refresh, logout — per docs/backend/prompts/02_auth_service.md. */
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Agency, Role, PasswordResetToken, EmailVerificationToken]),
    SessionsModule,
    TokensModule,
  ],
  controllers: [AuthController, InternalAuthController],
  providers: [AuthService, PasswordService, OpaqueTokenService],
  exports: [AuthService],
})
export class AuthModule {}
