import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { callSiteDataApi } from './api-client.js';
import { loadApiCatalog } from './catalog.js';
import { toToolError, toToolResult } from './response.js';
import { jsonSchemaToZodShape } from './schema.js';

export async function createMcpServer({
  baseUrl,
  accessToken,
  internalSecret,
}: {
  baseUrl: string;
  accessToken: string;
  internalSecret: string;
}) {
  const server = new McpServer({ name: 'sitedata', version: '0.1.1' });
  const apiCatalog = await loadApiCatalog(baseUrl);

  for (const definition of apiCatalog) {
    server.registerTool(
      definition.mcpName,
      {
        description: definition.description,
        inputSchema: jsonSchemaToZodShape(definition.inputSchema),
        annotations: {
          readOnlyHint: definition.readOnly,
          destructiveHint: !definition.readOnly,
          idempotentHint: definition.readOnly,
          openWorldHint: true,
        },
      },
      async (args: Record<string, unknown>, _extra: unknown) => {
        try {
          return toToolResult(
            await callSiteDataApi(
              baseUrl,
              definition,
              args,
              accessToken,
              internalSecret
            )
          );
        } catch (error) {
          return toToolError(error);
        }
      }
    );
  }

  return server;
}
