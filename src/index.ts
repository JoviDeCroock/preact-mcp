#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { PreactDataSource } from './datasource.js';
import { PACKAGES, Repository } from './constants.js';

const server = new Server(
  {
    name: 'preact-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const dataSource = new PreactDataSource();

const tools: Tool[] = [
  {
    name: 'query_preact_docs',
    description: 'Query Preact documentation and code from multiple repositories (preact, preact-iso, signals)',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query for Preact documentation or code',
        },
        repository: {
          type: 'string',
          enum: PACKAGES.map(pkg => pkg.name),
          description: 'Which repository to search in (default: preact)',
        }
      },
      required: ['query'],
    },
  },
  {
    name: 'get_preact_readme',
    description: 'Get the README content from a specific Preact repository',
    inputSchema: {
      type: 'object',
      properties: {
        repository: {
          type: 'string',
          enum: ['preact', 'preact-iso', 'signals'],
          description: 'The repository to get README from',
        },
      },
      required: ['repository'],
    },
  },
  {
    name: 'list_preact_repositories',
    description: 'List all available Preact repositories that can be queried',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!args) {
    return {
      content: [
        {
          type: 'text',
          text: 'Error: No arguments provided',
        },
      ],
      isError: true,
    };
  }

  try {
    switch (name) {
      case 'query_preact_docs':
        return await dataSource.queryDocs(
          args.query as string,
          (args.repository as Repository || 'preact'),
        );

      case 'get_preact_readme':
        return await dataSource.getReadme(args.repository as Repository);

      case 'list_preact_repositories':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(PACKAGES, null, 2),
            },
          ],
        };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Preact MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});