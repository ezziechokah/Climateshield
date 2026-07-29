import { Controller } from '@nestjs/common';

import { SessionsService } from './sessions.service';

/**
 * Deliberately registers no HTTP routes. `docs/12_API_Specification.md`'s
 * Authentication endpoint catalog exposes session lifecycle only through
 * `POST /v1/auth/login|refresh|logout` (implemented in `auth/`), which call
 * `SessionsService` directly via in-process dependency injection — there is
 * no cataloged `/v1/sessions` resource, and this task's constraint is that
 * the write surface is exactly what that catalog defines (no ad hoc
 * endpoints). This class exists (per
 * docs/backend/prompts/02_auth_service.md's file list) as the module's
 * documented seam for session-related HTTP routes if/when the API spec
 * ever adds one (e.g. a "list my devices" endpoint).
 */
@Controller()
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {
    // Referenced to keep the DI wiring meaningful even with zero routes today.
    void this.sessionsService;
  }
}
