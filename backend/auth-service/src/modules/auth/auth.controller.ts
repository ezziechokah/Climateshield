import { Public } from '@climateshield/rbac-guard';
import { Body, Controller, HttpCode, HttpStatus, Inject, Post, Req, Res } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import type { CookieOptions, Request, Response } from 'express';

import configuration from '../../config/configuration';

import { AuthService, LoginResult, PublicUserView, TokenIssueResult } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { MfaVerifyDto } from './dto/mfa-verify.dto';
import { PasswordResetDto } from './dto/password-reset.dto';
import { SsoCallbackDto } from './dto/sso-callback.dto';

interface AccessTokenResponseBody {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  user: PublicUserView;
}

/**
 * `/v1/auth/*` per docs/12_API_Specification.md#authentication. The refresh
 * token is NEVER returned in a JSON body — only ever as an
 * HttpOnly/Secure/SameSite=Strict cookie, per
 * docs/backend/02_Identity_and_Access_Service_Architecture.md#authentication-architecture.
 */
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(configuration.KEY) private readonly config: ConfigType<typeof configuration>,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AccessTokenResponseBody | { mfa_required: true; mfa_challenge_token: string }> {
    const result = await this.authService.login(dto.email, dto.password, this.requestMeta(req));
    return this.finalizeLoginResult(result, res);
  }

  @Public()
  @Post('sso/callback')
  @HttpCode(HttpStatus.OK)
  async ssoCallback(
    @Body() dto: SsoCallbackDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AccessTokenResponseBody | { mfa_required: true; mfa_challenge_token: string }> {
    const result = await this.authService.ssoCallback(dto.id_token, this.requestMeta(req));
    return this.finalizeLoginResult(result, res);
  }

  @Public()
  @Post('mfa/verify')
  @HttpCode(HttpStatus.OK)
  async mfaVerify(
    @Body() dto: MfaVerifyDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AccessTokenResponseBody> {
    const result = await this.authService.mfaVerify(dto.challenge_token, dto.code, this.requestMeta(req));
    this.setRefreshCookie(res, result.refresh_token, result.refresh_token_ttl_seconds);
    return this.stripRefreshToken(result);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<AccessTokenResponseBody> {
    const rawRefreshToken = req.cookies?.[this.config.cookies.refreshTokenName] as string | undefined;
    const result = await this.authService.refresh(rawRefreshToken, this.requestMeta(req));
    this.setRefreshCookie(res, result.refresh_token, result.refresh_token_ttl_seconds);
    return this.stripRefreshToken(result);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<{ message: string }> {
    const rawRefreshToken = req.cookies?.[this.config.cookies.refreshTokenName] as string | undefined;
    await this.authService.logout(rawRefreshToken);
    res.clearCookie(this.config.cookies.refreshTokenName, this.cookieOptions(0));
    return { message: 'Logged out.' };
  }

  @Public()
  @Post('password-reset')
  @HttpCode(HttpStatus.OK)
  async passwordReset(@Body() dto: PasswordResetDto): Promise<{ message: string }> {
    return this.authService.passwordReset(dto);
  }

  private finalizeLoginResult(
    result: LoginResult,
    res: Response,
  ): AccessTokenResponseBody | { mfa_required: true; mfa_challenge_token: string } {
    if ('mfa_required' in result) {
      return result;
    }
    this.setRefreshCookie(res, result.refresh_token, result.refresh_token_ttl_seconds);
    return this.stripRefreshToken(result);
  }

  private stripRefreshToken(result: TokenIssueResult): AccessTokenResponseBody {
    return {
      access_token: result.access_token,
      token_type: result.token_type,
      expires_in: result.expires_in,
      user: result.user,
    };
  }

  private requestMeta(req: Request): { ipAddress: string | null; userAgent: string | null } {
    const userAgent = req.headers['user-agent'];
    return {
      ipAddress: req.ip ?? null,
      userAgent: typeof userAgent === 'string' ? userAgent : null,
    };
  }

  private setRefreshCookie(res: Response, token: string, ttlSeconds: number): void {
    res.cookie(this.config.cookies.refreshTokenName, token, this.cookieOptions(ttlSeconds * 1000));
  }

  private cookieOptions(maxAgeMs: number): CookieOptions {
    return {
      httpOnly: true,
      secure: this.config.cookies.secure,
      sameSite: 'strict',
      path: '/v1/auth',
      domain: this.config.cookies.domain,
      maxAge: maxAgeMs,
    };
  }
}
