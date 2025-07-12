# Preact MCP Server

A Model Context Protocol (MCP) server that provides access to Preact documentation and code from multiple repositories including Preact core, Preact-ISO, and Signals.

## Features

- **Multi-repository support**: Query documentation from Preact, Preact-ISO, and Signals
- **Smart caching**: 5-minute cache to avoid GitHub rate limiting
- **Flexible search**: Search across READMEs, documentation, and code
- **Context-aware results**: Returns relevant sections with surrounding context

## Installation

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd preact-mcp
```

2. Install dependencies:
```bash
pnpm install
```

3. Build the project:
```bash
pnpm build
```

## Usage

### Running the Server

Start the MCP server:
```bash
pnpm dev
```

### Claude Desktop Integration

Add to your Claude Desktop/Cursor configuration

```json
{
  "mcpServers": {
    "preact-mcp": {
      "command": "npx",
      "args": ["-y", "preact-mcp"]
    }
  }
}
```

Or to Claude code

```
claude mcp add preact npx -y preact-mcp
```

## Available Tools

### 1. query_preact_docs
Search Preact documentation and code across repositories.

**Parameters:**
- `query` (required): Search term or question
- `repository` (optional): `preact`, `preact-iso`, `signals`, or `all` (default: `all`)
- `type` (optional): `docs`, `code`, `readme`, or `all` (default: `all`)

**Example:**
```
Query: "How to use signals with components"
Repository: signals
Type: readme
```

### 2. get_preact_readme
Get the complete README content from a specific repository.

**Parameters:**
- `repository` (required): `preact`, `preact-iso`, or `signals`

### 3. list_preact_repositories
List all available repositories that can be queried.

## Supported Repositories

- **preact**: Fast 3kB React alternative with the same modern API
- **preact-iso**: Isomorphic utilities for Preact
- **signals**: Reactive state management for Preact

## Development

### Project Structure

```
src/
├── index.ts      # Main MCP server implementation
├── datasource.ts # Data fetching and caching logic
└── types.ts      # TypeScript type definitions
```

### Scripts

- `npm run build` - Build TypeScript to JavaScript
- `npm run dev` - Run in development mode with tsx
- `npm start` - Run the compiled server

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and ensure the build passes
5. Submit a pull request

## Troubleshooting

### Common Issues

**Server won't start**: Ensure all dependencies are installed and the project is built.

**No results from queries**: Check network connectivity and GitHub API rate limits.

**Claude Desktop integration issues**: Verify the path in the configuration file is correct and the server builds successfully.

## License

[Add your license here]