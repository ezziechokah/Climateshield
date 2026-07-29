import type { AlertIssuedPayload } from '@climateshield/event-bus';
import { JWT_VERIFIER, SESSION_REVOCATION_CHECKER, type JwtVerifier, type SessionRevocationChecker } from '@climateshield/rbac-guard';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, type OnGatewayConnection, type OnGatewayDisconnect } from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';

/**
 * True if a client whose token carries `scope` (its `admin_boundary_scope`
 * claim) should receive an event about `boundaryId`. An absent/empty scope
 * means the token carries no boundary restriction — per
 * security/jwt-config.json, `admin_boundary_scope` is an OPTIONAL claim
 * (e.g. a national-level Administrator has none), so its absence means
 * unrestricted visibility, not zero visibility; a NON-empty scope is an
 * exact allowlist (the Gateway does no boundary-hierarchy expansion itself
 * — that is GIS Service's domain knowledge, not the Gateway's, per
 * docs/backend/prompts/01_gateway.md#constraints's "no business logic").
 * Exported standalone so `realtime.gateway.spec.ts` can unit-test the
 * scoping rule directly, in addition to the full-socket integration test.
 */
export function isBoundaryInScope(scope: string[] | undefined, boundaryId: string): boolean {
  if (!scope || scope.length === 0) {
    return true;
  }
  return scope.includes(boundaryId);
}

function extractToken(client: Socket): string | undefined {
  const authToken = (client.handshake.auth as Record<string, unknown> | undefined)?.token;
  if (typeof authToken === 'string' && authToken.length > 0) {
    return authToken;
  }
  const header = client.handshake.headers.authorization;
  if (typeof header === 'string') {
    const [scheme, token] = header.split(' ');
    if (scheme?.toLowerCase() === 'bearer' && token) {
      return token;
    }
  }
  const queryToken = client.handshake.query?.token;
  return typeof queryToken === 'string' ? queryToken : undefined;
}

/**
 * Fans out `alert.issued` (and, by the same mechanism, any future
 * catalog event `event-consumer.service.ts` wires up) to connected
 * WebSocket clients, filtered to each client's `admin_boundary_scope` —
 * per docs/backend/prompts/01_gateway.md#requirements: "fans out ...
 * real-time events ... to connected authenticated clients, scoped to each
 * client's admin_boundary_scope."
 *
 * Authentication happens once, at handshake (`handleConnection`), verifying
 * the same access token the client used for its REST session — a
 * connection that fails verification (missing/invalid/expired/revoked
 * token) is rejected and disconnected immediately, never left open
 * unauthenticated (fail closed, per docs/17_Coding_Standards.md#error-handling).
 */
@Injectable()
@WebSocketGateway({
  namespace: 'realtime',
  cors: { origin: true, credentials: true },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  server!: Server;

  /** socketId -> the connected client's `admin_boundary_scope` (undefined = unrestricted). */
  private readonly clientScopes = new Map<string, string[] | undefined>();

  constructor(
    @Inject(JWT_VERIFIER) private readonly jwtVerifier: JwtVerifier,
    @Inject(SESSION_REVOCATION_CHECKER) private readonly revocationChecker: SessionRevocationChecker,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token = extractToken(client);
      if (!token) {
        throw new Error('No access token supplied in the connection handshake.');
      }
      const claims = await this.jwtVerifier.verify(token);
      const revoked = await this.revocationChecker.isRevoked(claims.sub, claims.iat);
      if (revoked) {
        throw new Error('Session has been revoked.');
      }
      this.clientScopes.set(client.id, claims.admin_boundary_scope);
    } catch (err) {
      this.logger.warn(`Rejecting WebSocket connection ${client.id}: ${(err as Error).message}`);
      client.emit('connection_error', { message: 'Authentication failed.' });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket): void {
    this.clientScopes.delete(client.id);
  }

  /** Called by `EventConsumerService` for every `alert.issued` message consumed from Kafka. */
  broadcastAlertIssued(payload: AlertIssuedPayload): void {
    for (const [socketId, scope] of this.clientScopes.entries()) {
      if (isBoundaryInScope(scope, payload.admin_boundary_id)) {
        this.server.to(socketId).emit('alert.issued', payload);
      }
    }
  }

  /** Test/diagnostic helper — not part of the gateway's runtime contract. */
  connectedClientCount(): number {
    return this.clientScopes.size;
  }
}
