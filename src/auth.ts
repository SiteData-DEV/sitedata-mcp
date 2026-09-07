import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';

export const MCP_SCOPE = 'mcp:invoke';

export interface OAuthEnv {
  SITEDATA_OAUTH_ISSUER?: string;
  SITEDATA_MCP_RESOURCE?: string;
}

export type McpTokenClaims = JWTPayload & {
  sub: string;
  client_id: string;
  grant_id: string;
  scope: string;
};

const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function trimSlash(value: string) {
  return value.replace(/\/$/, '');
}

export function getOAuthConfig(request: Request, env: OAuthEnv) {
  const issuer = trimSlash(env.SITEDATA_OAUTH_ISSUER || 'https://sitedata.dev');
  const resource = env.SITEDATA_MCP_RESOURCE || `${new URL(request.url).origin}/mcp`;
  return { issuer, resource };
}

export function protectedResourceMetadata(request: Request, env: OAuthEnv) {
  const { issuer, resource } = getOAuthConfig(request, env);
  return {
    resource,
    authorization_servers: [issuer],
    bearer_methods_supported: ['header'],
    scopes_supported: [MCP_SCOPE],
  };
}

export function bearerChallenge(request: Request, env: OAuthEnv, error?: string) {
  const metadataUrl = `${new URL(request.url).origin}/.well-known/oauth-protected-resource/mcp`;
  const attributes = [
    `resource_metadata="${metadataUrl}"`,
    `scope="${MCP_SCOPE}"`,
  ];
  if (error) attributes.push(`error="${error}"`);
  return `Bearer ${attributes.join(', ')}`;
}

export function extractBearerToken(request: Request) {
  const match = /^Bearer\s+(.+)$/i.exec(request.headers.get('authorization') || '');
  return match?.[1]?.trim() || '';
}

export async function authenticateMcpRequest(request: Request, env: OAuthEnv) {
  const token = extractBearerToken(request);
  if (!token) return null;

  const { issuer, resource } = getOAuthConfig(request, env);
  let jwks = jwksCache.get(issuer);
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`));
    jwksCache.set(issuer, jwks);
  }

  const { payload } = await jwtVerify(token, jwks, {
    issuer,
    audience: resource,
    algorithms: ['ES256'],
  });
  if (
    typeof payload.sub !== 'string' ||
    typeof payload.client_id !== 'string' ||
    typeof payload.grant_id !== 'string' ||
    typeof payload.scope !== 'string' ||
    !payload.scope.split(/\s+/).includes(MCP_SCOPE)
  ) {
    throw new Error('Invalid SiteData MCP OAuth token claims');
  }
  return { token, claims: payload as McpTokenClaims };
}
