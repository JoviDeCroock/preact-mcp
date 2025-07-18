#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
	CallToolRequestSchema,
	ListToolsRequestSchema,
	Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { PreactDataSource } from "./datasource.js";
import { PACKAGES, Repository } from "./constants.js";

const server = new Server(
	{
		name: "preact-mcp",
		version: "1.0.0",
		description: "Query Preact documentation and ecosystem"
	},
	{
		capabilities: {
			tools: {},
		},
	},
);

const dataSource = new PreactDataSource();

const tools: Tool[] = [
	{
		name: "query_preact_docs",
		description: "Query Preact documentation from multiple repositories.",
		inputSchema: {
			type: "object",
			properties: {
				query: {
					type: "string",
					description: "The search query for the Preact documentation",
				},
				repository: {
					type: "string",
					enum: PACKAGES.map((pkg) => pkg.name),
					description: "Which repository to search in (default: preact)",
				},
			},
			required: ["query"],
		},
	},
	{
		name: "get_preact_readme",
		description: "Get the README content from a specific Preact repository",
		inputSchema: {
			type: "object",
			properties: {
				repository: {
					type: "string",
					enum: PACKAGES.map((pkg) => pkg.name),
					description: "The repository to get README from",
				},
			},
			required: ["repository"],
		},
	},
	{
		name: "list_preact_repositories",
		description:
			"List all available Preact repositories that can be queried, this allows you to have information about the Preact ecosystem.",
		inputSchema: {
			type: "object",
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
					type: "text",
					text: "Error: No arguments provided",
				},
			],
			isError: true,
		};
	}

	try {
		switch (name) {
			case "query_preact_docs":
				return await dataSource.queryDocs(
					args.query as string,
					(args.repository as Repository) || "preact",
				);

			case "get_preact_readme":
				return await dataSource.getReadme(args.repository as Repository);

			case "list_preact_repositories":
				return {
					content: [
						{
							type: "text",
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
					type: "text",
					text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
				},
			],
			isError: true,
		};
	}
});

async function main() {
	const transport = new StdioServerTransport();
	try {
		await server.connect(transport);
		console.error("Preact MCP server v1.0.0 running on stdio");
	} catch (error) {
		console.error("Failed to start server:", error);
		// Retry once after 1 second
		setTimeout(async () => {
			try {
				await server.connect(transport);
				console.error("Preact MCP server v1.0.0 running on stdio (retry successful)");
			} catch (retryError) {
				console.error("Retry failed:", retryError);
				process.exit(1);
			}
		}, 1000);
	}
}

main().catch((error) => {
	console.error("Server error:", error);
	process.exit(1);
});
