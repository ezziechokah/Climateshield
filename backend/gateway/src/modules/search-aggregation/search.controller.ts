import { ValidationError } from '@climateshield/http-errors';
import { Controller, Get, Query, Req } from '@nestjs/common';
import type { Request } from 'express';

import type { SearchResponse } from './search.service';
import { SearchService } from './search.service';

/**
 * `GET /v1/search?q=` — protected (no `@Public()`): RBAC scoping is
 * enforced entirely by propagating the caller's own bearer token to each
 * fanned-out downstream call (see `search-source-client.ts`), so an
 * unauthenticated caller must not reach this endpoint at all.
 */
@Controller({ path: 'search' })
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(@Query('q') q: string | undefined, @Req() req: Request): Promise<SearchResponse> {
    if (!q || q.trim().length === 0) {
      throw new ValidationError('Query parameter "q" is required.', { field: 'q' });
    }
    return this.searchService.search(q.trim(), req.headers.authorization);
  }
}
