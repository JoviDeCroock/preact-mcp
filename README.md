# preact-mcp

MCP server for querying Preact documentation and ecosystem.

## Installation

```bash
npm install -g preact-mcp
```

## Usage with Claude

Add the server using Claude's MCP command:

```bash
claude mcp add preact-mcp
```

## Usage with Cursor

Add to your Cursor settings (Settings → Extensions → MCP):

```json
{
  "mcpServers": {
    "preact": {
      "command": "npx",
      "args": ["preact-mcp"]
    }
  }
}
```

Or add to your `.cursorrules` file:

```
MCP Server: preact-mcp
Command: npx preact-mcp
Description: Query Preact documentation and ecosystem
```

## Available Tools

- **query_preact_docs** - Search Preact documentation
- **get_preact_readme** - Get README from any Preact repository  
- **list_preact_repositories** - List all available Preact packages

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

## Configuration Paths

- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

## Development

```bash
pnpm install
pnpm build
pnpm start
```

## License

MIT License - see [LICENSE](LICENSE) file for details.
