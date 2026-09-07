import assert from 'node:assert/strict';
import test from 'node:test';

import {
  bearerChallenge,
  extractBearerToken,
  protectedResourceMetadata,
} from '../src/auth.js';
import worker from '../src/index.js';

const env = {
  SITEDATA_OAUTH_ISSUER: 'https://sitedata.dev/',
  SITEDATA_MCP_RESOURCE: 'https://mcp.sitedata.dev/mcp',
};

test('publishes MCP protected resource metadata', () => {
  const metadata = protectedResourceMetadata(
    new Request('https://mcp.sitedata.dev/.well-known/oauth-protected-resource/mcp'),
    env
  );
  assert.deepEqual(metadata, {
    resource: 'https://mcp.sitedata.dev/mcp',
    authorization_servers: ['https://sitedata.dev'],
    bearer_methods_supported: ['header'],
    scopes_supported: ['mcp:invoke'],
  });
});

test('creates an OAuth discovery challenge for unauthenticated clients', () => {
  const request = new Request('https://mcp.sitedata.dev/mcp');
  assert.equal(
    bearerChallenge(request, env),
    'Bearer resource_metadata="https://mcp.sitedata.dev/.well-known/oauth-protected-resource/mcp", scope="mcp:invoke"'
  );
});

test('extracts bearer tokens case-insensitively', () => {
  const request = new Request('https://mcp.sitedata.dev/mcp', {
    headers: { authorization: 'bearer test-token' },
  });
  assert.equal(extractBearerToken(request), 'test-token');
});

test('serves discovery metadata and challenges unauthenticated MCP requests', async () => {
  const metadataResponse = await worker.fetch(
    new Request('https://mcp.sitedata.dev/.well-known/oauth-protected-resource/mcp'),
    env
  );
  assert.equal(metadataResponse.status, 200);
  assert.equal(
    (await metadataResponse.json() as { resource: string }).resource,
    env.SITEDATA_MCP_RESOURCE
  );

  const response = await worker.fetch(new Request('https://mcp.sitedata.dev/mcp'), {
    ...env,
    MCP_INTERNAL_SECRET: 'test-internal-secret',
  });
  assert.equal(response.status, 401);
  assert.match(response.headers.get('www-authenticate') || '', /resource_metadata=/);
});

test('rejects MCP traffic when the internal gateway secret is missing', async () => {
  const response = await worker.fetch(new Request('https://mcp.sitedata.dev/mcp'), env);
  assert.equal(response.status, 503);
});
