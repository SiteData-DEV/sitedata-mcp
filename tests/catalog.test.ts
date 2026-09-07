import assert from 'node:assert/strict';
import test from 'node:test';
import { clearCatalogCache, fallbackCatalog, loadApiCatalog } from '../src/catalog.js';

test('bundled catalog matches the SiteData public MCP APIs', () => {
  assert.equal(fallbackCatalog.length, 2);
  assert.equal(new Set(fallbackCatalog.map((item) => item.mcpName)).size, 2);
  assert.deepEqual(
    fallbackCatalog.map(({ method, mcpName, readOnly }) => ({ method, mcpName, readOnly })),
    [
      { method: 'GET', mcpName: 'sitedata_rankings', readOnly: true },
      { method: 'POST', mcpName: 'sitedata_favorites', readOnly: false },
    ]
  );
});

test('loads GET and POST tools from the SiteData catalog endpoint', async () => {
  const originalFetch = globalThis.fetch;
  clearCatalogCache();
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        code: 'ok',
        message: 'OK',
        data: { schemaVersion: 1, apis: fallbackCatalog },
      }),
      { status: 200, headers: { 'content-type': 'application/json' } }
    );

  try {
    const catalog = await loadApiCatalog('https://sitedata.dev');
    assert.equal(catalog.length, 2);
    assert.equal(catalog[1]?.path, '/api/v1/favorites');
    assert.equal(catalog[1]?.method, 'POST');
  } finally {
    globalThis.fetch = originalFetch;
    clearCatalogCache();
  }
});

test('falls back to the bundled catalog when the remote response is invalid', async () => {
  const originalFetch = globalThis.fetch;
  const originalWarn = console.warn;
  clearCatalogCache();
  console.warn = () => undefined;
  globalThis.fetch = async () => Response.json({ code: 'ok', data: { schemaVersion: 2 } });

  try {
    const catalog = await loadApiCatalog('https://invalid-catalog.example');
    assert.equal(catalog, fallbackCatalog);
  } finally {
    globalThis.fetch = originalFetch;
    console.warn = originalWarn;
    clearCatalogCache();
  }
});
