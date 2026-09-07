import assert from 'node:assert/strict';
import test from 'node:test';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { clearCatalogCache, fallbackCatalog } from '../src/catalog.js';
import { createMcpServer } from '../src/server.js';

test('publishes the SiteData tools with annotations matching their side effects', async () => {
  const originalFetch = globalThis.fetch;
  clearCatalogCache();
  globalThis.fetch = async () =>
    Response.json({
      code: 'ok',
      message: 'OK',
      data: { schemaVersion: 1, apis: fallbackCatalog },
    });

  const server = await createMcpServer({
    baseUrl: 'https://sitedata.dev',
    accessToken: 'test-access-token',
    internalSecret: 'test-internal-secret',
  });
  const client = new Client({ name: 'test-client', version: '1.0.0' });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  try {
    await server.connect(serverTransport);
    await client.connect(clientTransport);

    const { tools } = await client.listTools();
    assert.equal(tools.length, 2);
    const rankings = tools.find((tool) => tool.name === 'sitedata_rankings');
    const favorites = tools.find((tool) => tool.name === 'sitedata_favorites');
    assert.deepEqual(rankings?.annotations, {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    });
    assert.deepEqual(favorites?.annotations, {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
      openWorldHint: true,
    });
    assert.deepEqual(rankings?.inputSchema.required, ['rankingType']);
    assert.deepEqual(favorites?.inputSchema.required, ['action']);
  } finally {
    await client.close();
    await server.close();
    globalThis.fetch = originalFetch;
    clearCatalogCache();
  }
});

test('returns the payment URL when a rankings call requires membership', async () => {
  const originalFetch = globalThis.fetch;
  clearCatalogCache();
  globalThis.fetch = async (input) => {
    const path = new URL(String(input)).pathname;
    if (path === '/api/v1/mcp/catalog') {
      return Response.json({
        code: 'ok',
        message: 'OK',
        data: { schemaVersion: 1, apis: fallbackCatalog },
      });
    }
    return Response.json(
      {
        code: 'membership_required',
        message:
          'An active SiteData membership is required to access rankings.',
        data: null,
      },
      { status: 403 }
    );
  };

  const server = await createMcpServer({
    baseUrl: 'https://sitedata.dev',
    accessToken: 'test-access-token',
    internalSecret: 'test-internal-secret',
  });
  const client = new Client({ name: 'test-client', version: '1.0.0' });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  try {
    await server.connect(serverTransport);
    await client.connect(clientTransport);
    const result = await client.callTool({
      name: 'sitedata_rankings',
      arguments: { rankingType: 'traffic_growth' },
    });

    assert.equal(result.isError, true);
    const content = result.content as Array<{ type: string; text?: string }>;
    assert.match(
      content[0]?.type === 'text' ? content[0].text || '' : '',
      /https:\/\/sitedata\.dev\/payment/
    );
    assert.equal(
      (result.structuredContent as { paymentUrl?: string })?.paymentUrl,
      'https://sitedata.dev/payment'
    );
  } finally {
    await client.close();
    await server.close();
    globalThis.fetch = originalFetch;
    clearCatalogCache();
  }
});
