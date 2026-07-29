import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserSession } from './entities/user-session.entity';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';

/** identity.user_session CRUD + revocation (single-use rotating refresh tokens, reuse detection). */
@Module({
  imports: [TypeOrmModule.forFeature([UserSession])],
  controllers: [SessionsController],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
