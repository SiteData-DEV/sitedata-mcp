import {
  apiCatalog as fallbackCatalog,
  type JsonSchema,
  type PublicApiDefinition,
} from './catalog-fallback.js';

const CATALOG_PATH = '/api/v1/mcp/catalog';
const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 10_000;

type CatalogCacheEntry = {
  expiresAt: number;
  catalog: readonly PublicApiDefinition[];
};

const catalogCache = new Map<string, CatalogCacheEntry>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isJsonSchema(value: unknown): value is JsonSchema {
  if (!isRecord(value)) return false;
  if (!['object', 'string', 'integer', 'number', 'boolean', 'array'].includes(String(value.type))) {
    return false;
  }
  if (value.description !== undefined && typeof value.description !== 'string') return false;
  if (value.required !== undefined && (!Array.isArray(value.required) || !value.required.every((item) => typeof item === 'string'))) {
    return false;
  }
  if (value.enum !== undefined && (!Array.isArray(value.enum) || !value.enum.every((item) => ['string', 'number', 'boolean'].includes(typeof item)))) {
    return false;
  }
  if (value.type === 'object' && value.properties !== undefined) {
    if (!isRecord(value.properties) || !Object.values(value.properties).every(isJsonSchema)) return false;
  }
  if (value.type === 'array' && value.items !== undefined && !isJsonSchema(value.items)) return false;
  return true;
}

function isPublicDefinition(value: unknown): value is PublicApiDefinition {
  if (!isRecord(value)) return false;
  return (
    (value.method === 'GET' || value.method === 'POST') &&
    typeof value.id === 'string' &&
    typeof value.path === 'string' &&
    /^\/api\/v1\/[a-z0-9/_-]+$/.test(value.path) &&
    typeof value.mcpName === 'string' &&
    /^sitedata_[a-z0-9_]+$/.test(value.mcpName) &&
    typeof value.description === 'string' &&
    typeof value.readOnly === 'boolean' &&
    isJsonSchema(value.inputSchema) &&
    value.inputSchema.type === 'object'
  );
}

function parseCatalog(value: unknown): readonly PublicApiDefinition[] {
  if (!isRecord(value) || value.code !== 'ok' || !isRecord(value.data)) {
    throw new Error('Catalog response has an invalid envelope.');
  }
  const data = value.data;
  if (data.schemaVersion !== 1 || !Array.isArray(data.apis)) {
    throw new Error('Catalog response has an unsupported schema version.');
  }
  const catalog = data.apis.filter(isPublicDefinition);
  if (catalog.length !== data.apis.length || catalog.length === 0) {
    throw new Error('Catalog response contains an invalid API definition.');
  }
  if (new Set(catalog.map((item) => item.mcpName)).size !== catalog.length) {
    throw new Error('Catalog response contains duplicate MCP tool names.');
  }
  return catalog;
}

async function fetchCatalog(baseUrl: string): Promise<readonly PublicApiDefinition[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}${CATALOG_PATH}`, {
      headers: { accept: 'application/json' },
      signal: controller.signal,
    });
    const text = await response.text();
    if (!response.ok) throw new Error(`Catalog request failed with status ${response.status}.`);
    return parseCatalog(text ? JSON.parse(text) : null);
  } finally {
    clearTimeout(timeout);
  }
}

export async function loadApiCatalog(
  baseUrl: string,
  cacheTtlMs = DEFAULT_CACHE_TTL_MS
): Promise<readonly PublicApiDefinition[]> {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '');
  const cached = catalogCache.get(normalizedBaseUrl);
  if (cached && cached.expiresAt > Date.now()) return cached.catalog;

  try {
    const catalog = await fetchCatalog(normalizedBaseUrl);
    catalogCache.set(normalizedBaseUrl, {
      catalog,
      expiresAt: Date.now() + Math.max(0, cacheTtlMs),
    });
    return catalog;
  } catch (error) {
    console.warn('Unable to load the remote SiteData catalog; using the bundled fallback.', error);
    return fallbackCatalog;
  }
}

export function clearCatalogCache() {
  catalogCache.clear();
}

export { fallbackCatalog };
