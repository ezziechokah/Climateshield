import { Public } from '@climateshield/rbac-guard';
import { Controller, Delete, Get, Patch, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';

import { ProxyService } from './proxy.service';

/**
 * One controller method per row in docs/12_API_Specification.md#endpoint-catalog
 * (grouped into one controller class per catalog section for readability),
 * each a thin call into `ProxyService.forward` — no business logic, no
 * payload transformation, per docs/backend/prompts/01_gateway.md#constraints.
 * `@Public()` (imported directly from `@climateshield/rbac-guard`, not
 * reimplemented) marks the explicit small set of routes that opt out of the
 * global auth guard — see api-catalog.ts's module doc for which routes and why.
 *
 * Every method here has a matching row in `API_CATALOG`
 * (api-catalog.ts) — `service-registry.spec.ts` and
 * `route-coverage.spec.ts` both fail if the two ever drift apart.
 */

@Controller({ path: 'auth' })
export class AuthProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @Public()
  @Post('login')
  login(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.proxy.forward(req, res, 'auth-service');
  }

  @Public()
  @Post('sso/callback')
  ssoCallback(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.proxy.forward(req, res, 'auth-service');
  }

  @Public()
  @Post('refresh')
  refresh(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.proxy.forward(req, res, 'auth-service');
  }

  @Post('logout')
  logout(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.proxy.forward(req, res, 'auth-service');
  }

  @Public()
  @Post('mfa/verify')
  mfaVerify(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.proxy.forward(req, res, 'auth-service');
  }

  @Public()
  @Post('password-reset')
  passwordReset(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.proxy.forward(req, res, 'auth-service');
  }
}

@Controller({ path: 'users' })
export class UsersProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @Get()
  list(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.proxy.forward(req, res, 'auth-service');
  }

  @Post()
  create(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.proxy.forward(req, res, 'auth-service');
  }

  @Get(':id')
  getOne(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.proxy.forward(req, res, 'auth-service');
  }

  @Patch(':id')
  update(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.proxy.forward(req, res, 'auth-service');
  }

  @Delete(':id')
  deactivate(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.proxy.forward(req, res, 'auth-service');
  }
}

@Controller({ path: 'roles' })
export class RolesProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @Get()
  list(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.proxy.forward(req, res, 'auth-service');
  }

  @Post()
  create(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.proxy.forward(req, res, 'auth-service');
  }

  @Patch(':id')
  update(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.proxy.forward(req, res, 'auth-service');
  }
}

@Controller({ path: 'permissions' })
export class PermissionsProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @Get()
  list(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.proxy.forward(req, res, 'auth-service');
  }
}

@Controller({ path: 'stations' })
export class StationsProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @Get()
  list(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.proxy.forward(req, res, 'climate-data-service');
  }
}

@Controller({ path: 'observations' })
export class ObservationsProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @Get()
  list(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.proxy.forward(req, res, 'climate-data-service');
  }

  @Post()
  create(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.proxy.forward(req, res, 'climate-data-service');
  }
}

@Controller({ path: 'forecast-models' })
export class ForecastModelsProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @Get()
  list(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.proxy.forward(req, res, 'climate-data-service');
  }
}

@Controller({ path: 'forecast-runs' })
export class ForecastRunsProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @Get(':id/values')
  values(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.proxy.forward(req, res, 'climate-data-service');
  }
}

@Controller({ path: 'climate-indices' })
export class ClimateIndicesProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @Get()
  list(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.proxy.forward(req, res, 'climate-data-service');
  }
}

@Controller({ path: 'risk-assessments' })
export class RiskAssessmentsProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @Get()
  list(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.proxy.forward(req, res, 'risk-assessment-service');
  }

  @Get(':id')
  getOne(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.proxy.forward(req, res, 'risk-assessment-service');
  }
}

@Controller({ path: 'risk-models' })
export class RiskModelsProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @Get()
  list(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.proxy.forward(req, res, 'risk-assessment-service');
  }

  @Post(':id/recompute')
  recompute(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.proxy.forward(req, res, 'risk-assessment-service');
  }
}

@Controller({ path: 'gis' })
export class GisProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @Get('layers')
  layers(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.proxy.forward(req, res, 'gis-service');
  }

  @Get('layers/:id/tiles/:z/:x/:y')
  tiles(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.proxy.forward(req, res, 'gis-service');
  }

  @Get('query')
  query(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.proxy.forward(req, res, 'gis-service');
  }

  @Get('satellite-products')
  satelliteProducts(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.proxy.forward(req, res, 'gis-service');
  }
}

@Controller({ path: 'report-templates' })
export class ReportTemplatesProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @Get()
  list(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.proxy.forward(req, res, 'reporting-service');
  }
}

@Controller({ path: 'reports' })
export class ReportsProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @Post()
  create(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.proxy.forward(req, res, 'reporting-service');
  }

  @Get(':id')
  getOne(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.proxy.forward(req, res, 'reporting-service');
  }
}

@Controller({ path: 'ai' })
export class AiProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @Post('query')
  query(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.proxy.forward(req, res, 'ai-engine');
  }

  @Get('conversations/:id')
  getConversation(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.proxy.forward(req, res, 'ai-engine');
  }

  @Get('knowledge-base')
  knowledgeBase(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.proxy.forward(req, res, 'ai-engine');
  }
}

@Controller({ path: 'alerts' })
export class AlertsProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @Get()
  list(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.proxy.forward(req, res, 'alerting-service');
  }

  @Post(':id/approve')
  approve(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.proxy.forward(req, res, 'alerting-service');
  }

  @Post(':id/reject')
  reject(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.proxy.forward(req, res, 'alerting-service');
  }
}

@Controller({ path: 'alert-subscriptions' })
export class AlertSubscriptionsProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @Post()
  create(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.proxy.forward(req, res, 'alerting-service');
  }

  @Delete(':id')
  remove(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.proxy.forward(req, res, 'alerting-service');
  }
}

@Controller({ path: 'audit-logs' })
export class AuditLogsProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @Get()
  list(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.proxy.forward(req, res, 'admin-audit-service');
  }
}

@Controller({ path: 'system' })
export class SystemProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @Public()
  @Get('health')
  health(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.proxy.forward(req, res, 'admin-audit-service');
  }
}

@Controller({ path: 'api-keys' })
export class ApiKeysProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @Get()
  list(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.proxy.forward(req, res, 'admin-audit-service');
  }

  @Post()
  create(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.proxy.forward(req, res, 'admin-audit-service');
  }

  @Delete(':id')
  revoke(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.proxy.forward(req, res, 'admin-audit-service');
  }
}

/** Every proxy controller class, for `ProxyModule.controllers` and for `route-coverage.spec.ts`'s reflection-based audit. */
export const PROXY_CONTROLLERS = [
  AuthProxyController,
  UsersProxyController,
  RolesProxyController,
  PermissionsProxyController,
  StationsProxyController,
  ObservationsProxyController,
  ForecastModelsProxyController,
  ForecastRunsProxyController,
  ClimateIndicesProxyController,
  RiskAssessmentsProxyController,
  RiskModelsProxyController,
  GisProxyController,
  ReportTemplatesProxyController,
  ReportsProxyController,
  AiProxyController,
  AlertsProxyController,
  AlertSubscriptionsProxyController,
  AuditLogsProxyController,
  SystemProxyController,
  ApiKeysProxyController,
];
