/** Bundled copy of the public MCP catalog exposed by sitedata_web. */

export type JsonSchema = {
  type: 'object' | 'string' | 'integer' | 'number' | 'boolean' | 'array';
  title?: string;
  description?: string;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  enum?: Array<string | number | boolean>;
  items?: JsonSchema;
  default?: string | number | boolean;
  additionalProperties?: boolean;
};

export type PublicApiId = 'rankings' | 'favorites';

export interface PublicApiDefinition {
  readonly id: string;
  readonly method: 'GET' | 'POST';
  readonly path: `/api/v1/${string}`;
  readonly inputSchema: JsonSchema;
  readonly mcpName: `sitedata_${string}`;
  readonly description: string;
  readonly readOnly: boolean;
}

const objectSchema = (
  properties: Record<string, JsonSchema>,
  required: string[] = []
): JsonSchema => ({
  type: 'object',
  properties,
  ...(required.length > 0 ? { required } : {}),
  additionalProperties: false,
});

const definitions: readonly PublicApiDefinition[] = [
  {
    id: 'rankings',
    method: 'GET',
    path: '/api/v1/rankings',
    mcpName: 'sitedata_rankings',
    description:
      'Return the complete SiteData website ranking for an active paid member. Results are not paginated.',
    readOnly: true,
    inputSchema: objectSchema(
      {
        rankingType: {
          type: 'string',
          enum: ['traffic_growth', 'domain_rating_growth', 'payment_traffic'],
          description: 'Ranking dataset',
        },
        period: {
          type: 'string',
          enum: ['current', 'archive'],
          description: 'Current or archived ranking',
        },
        month: {
          type: 'string',
          description: 'Required for archive, formatted YYYY-MM',
        },
        newSites: { type: 'boolean', description: 'Only newly detected sites' },
        gateway: {
          type: 'string',
          description: 'Payment gateway code for payment_traffic',
        },
        locale: { type: 'string', description: 'Response locale' },
        tagType: {
          type: 'string',
          enum: [
            'category',
            'use_case',
            'site_type',
            'business_model',
            'affiliate_program',
          ],
        },
        tagCode: {
          type: 'string',
          description: 'Tag code; must be supplied with tagType',
        },
      },
      ['rankingType']
    ),
  },
  {
    id: 'favorites',
    method: 'POST',
    path: '/api/v1/favorites',
    mcpName: 'sitedata_favorites',
    description:
      "List and manage the authenticated user's website and keyword favorites and folders.",
    readOnly: false,
    inputSchema: objectSchema(
      {
        action: {
          type: 'string',
          enum: [
            'list',
            'add',
            'update',
            'delete',
            'create_folder',
            'rename_folder',
            'delete_folder',
          ],
        },
        kind: { type: 'string', enum: ['all', 'website', 'keyword'] },
        id: { type: 'string' },
        domain: { type: 'string' },
        keyword: { type: 'string' },
        remark: { type: 'string' },
        folderId: {
          type: 'string',
          description: 'Folder ID; use an empty value to move a favorite out of a folder',
        },
        name: { type: 'string', description: 'Folder name' },
      },
      ['action']
    ),
  },
] as const;

export const apiCatalog = definitions;

const definitionById = new Map<PublicApiId, PublicApiDefinition>(
  definitions.map((definition) => [definition.id as PublicApiId, definition])
);

export function getApiDefinition(id: PublicApiId): PublicApiDefinition {
  const definition = definitionById.get(id);
  if (!definition) throw new Error(`Unknown public API: ${id}`);
  return definition;
}

export function getPublicApiPaths(): readonly string[] {
  return definitions.map((definition) => definition.path);
}
