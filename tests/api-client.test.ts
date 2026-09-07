import assert from 'node:assert/strict';
import test from 'node:test';

import { callSiteDataApi, SiteDataApiError } from '../src/api-client.js';

test('sends GET tool arguments as query parameters with gateway authentication', async () => {
  const originalFetch = globalThis.fetch;
  let capturedUrl = '';
  let capturedInit: RequestInit | undefined;
  globalThis.fetch = async (input, init) => {
    capturedUrl = String(input);
    capturedInit = init;
    return Response.json({ code: 'ok', data: [] });
  };

  try {
    await callSiteDataApi(
      'https://sitedata.dev/',
      { method: 'GET', path: '/api/v1/rankings' },
      { rankingType: 'traffic_growth', newSites: false, month: '' },
      'access-token',
      'internal-secret'
    );
    const url = new URL(capturedUrl);
    assert.equal(url.pathname, '/api/v1/rankings');
    assert.equal(url.searchParams.get('rankingType'), 'traffic_growth');
    assert.equal(url.searchParams.get('newSites'), 'false');
    assert.equal(url.searchParams.has('month'), false);
    const headers = new Headers(capturedInit?.headers);
    assert.equal(headers.get('authorization'), 'Bearer access-token');
    assert.equal(headers.get('x-sitedata-mcp-secret'), 'internal-secret');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('sends POST tool arguments as JSON and preserves empty folder IDs', async () => {
  const originalFetch = globalThis.fetch;
  let capturedInit: RequestInit | undefined;
  globalThis.fetch = async (_input, init) => {
    capturedInit = init;
    return Response.json({ code: 'ok', data: {} });
  };

  try {
    await callSiteDataApi(
      'https://sitedata.dev',
      { method: 'POST', path: '/api/v1/favorites' },
      { action: 'update', kind: 'website', id: 'favorite-1', folderId: '' },
      'access-token',
      'internal-secret'
    );
    assert.equal(capturedInit?.method, 'POST');
    assert.equal(new Headers(capturedInit?.headers).get('content-type'), 'application/json');
    assert.deepEqual(JSON.parse(String(capturedInit?.body)), {
      action: 'update',
      kind: 'website',
      id: 'favorite-1',
      folderId: '',
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('retains the status and response body for API failures', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    Response.json(
      { code: 'membership_required', message: 'An active membership is required' },
      { status: 403 }
    );

  try {
    await assert.rejects(
      callSiteDataApi(
        'https://sitedata.dev',
        { method: 'GET', path: '/api/v1/rankings' },
        { rankingType: 'traffic_growth' },
        'access-token',
        'internal-secret'
      ),
      (error: unknown) =>
        error instanceof SiteDataApiError &&
        error.status === 403 &&
        (error.body as { code: string }).code === 'membership_required'
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
