# Preact MCP Server

A Model Context Protocol (MCP) server that provides access to Preact documentation, code examples, and the broader Preact ecosystem. This server allows AI assistants to query and retrieve information from various Preact-related repositories and documentation sources.

## Features

🔍 **Documentation Search**: Query Preact documentation with semantic search capabilities  
📚 **Multi-Repository Support**: Access 10+ Preact ecosystem packages  
📖 **README Access**: Get README content from any supported repository  
⚡ **Fast & Cached**: Built-in caching for improved performance  
🎯 **Smart Prioritization**: Code examples and tutorials get higher priority in search results

## Supported Repositories

- **preact** - Core Preact library with React compatibility
- **preact-iso** - Isomorphic router and SSR utilities  
- **@preact/signals-core** - Core reactive state management
- **@preact/signals** - Preact-specific signals implementation
- **@preact/signals-react** - React compatibility for signals
- **@preact/preset-vite** - Vite preset for Preact
- **create-preact** - Project scaffolding tool
- **playwright-ct** - Component testing with Playwright
- **vitest-browser-preact** - Browser testing with Vitest
- **htm** - JSX alternative using template literals

## Installation

### Prerequisites

- Node.js 18 or higher
- An MCP-compatible AI assistant (Claude Desktop, etc.)

### NPM Installation

```bash
npm install -g preact-mcp
```

### From Source

```bash
git clone https://github.com/JoviDeCroock/preact-mcp.git
cd preact-mcp
pnpm install
pnpm build
```

## Configuration

### Claude Desktop

Add the Preact MCP server to your Claude Desktop configuration:

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`  
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Linux**: `~/.config/Claude/claude_desktop_config.json`

#### Using NPM Package

```json
{
  "mcpServers": {
    "preact-mcp": {
      "command": "npx",
      "args": ["preact-mcp"]
    }
  }
}
```

#### Using Local Build

```json
{
  "mcpServers": {
    "preact-mcp": {
      "command": "node",
      "args": ["/path/to/preact-mcp/dist/index.js"]
    }
  }
}
```

### Other MCP Clients

For other MCP-compatible clients, use the stdio transport with the command:

```bash
npx preact-mcp
# or
node /path/to/preact-mcp/dist/index.js
```

## Available Tools

### `query_preact_docs`

Search through Preact documentation and code examples.

**Parameters:**
- `query` (required): Search query string
- `repository` (optional): Specific repository to search (defaults to "preact")

**Example:**
```
Query: "useState hook examples"
Repository: "preact"
```

### `get_preact_readme`

Get the complete README content from a specific Preact repository.

**Parameters:**
- `repository` (required): Repository name to get README from

**Example:**
```
Repository: "@preact/signals"
```

### `list_preact_repositories`

List all available Preact repositories with descriptions.

**Parameters:** None

## Usage Examples

### Getting Started with Preact

```
Ask: "How do I create a simple Preact component?"
Tool: query_preact_docs
Query: "create component JSX"
Repository: "preact"
```

### Learning About Signals

```
Ask: "Show me how to use Preact signals for state management"
Tool: query_preact_docs  
Query: "signals state management examples"
Repository: "@preact/signals"
```

### Setting Up a New Project

```
Ask: "How do I start a new Preact project?"
Tool: get_preact_readme
Repository: "create-preact"
```

### Exploring the Ecosystem

```
Ask: "What Preact packages are available?"
Tool: list_preact_repositories
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and formatting: `pnpm format`
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Related Projects

- [Model Context Protocol](https://modelcontextprotocol.io/) - The protocol specification
- [Preact](https://preactjs.com/) - Fast 3kB React alternative
- [Claude Desktop](https://claude.ai/desktop) - AI assistant with MCP support

---

*This MCP server is maintained by [Jovi De Croock](https://github.com/JoviDeCroock) and the Preact community.*
