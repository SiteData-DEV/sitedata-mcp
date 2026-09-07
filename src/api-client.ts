import type { PublicApiDefinition } from './catalog-fallback.js';

const REQUEST_TIMEOUT_MS = 45_000;

export class SiteDataApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: unknown
  ) {
    super(`SiteData request failed with status ${status}`);
  }
}

export async function callSiteDataApi(
  baseUrl: string,
  definition: Pick<PublicApiDefinition, 'method' | 'path'>,
  args: Record<string, unknown>,
  accessToken: string,
  internalSecret: string
) {
  const url = new URL(`${baseUrl.replace(/\/$/, '')}${definition.path}`);
  const headers = new Headers({
    accept: 'application/json',
    authorization: `Bearer ${accessToken}`,
    'x-sitedata-mcp-secret': internalSecret,
  });
  const init: RequestInit = { method: definition.method, headers };

  if (definition.method === 'GET') {
    for (const [key, value] of Object.entries(args)) {
      if (value === undefined || value === null || value === '') continue;
      url.searchParams.set(key, String(value));
    }
  } else {
    headers.set('content-type', 'application/json');
    init.body = JSON.stringify(args);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const text = await response.text();
    let body: unknown = text;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      // Preserve a non-JSON response for structured error reporting.
    }
    if (!response.ok) throw new SiteDataApiError(response.status, body);
    return body;
  } finally {
    clearTimeout(timeout);
  }
}
