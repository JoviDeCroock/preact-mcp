# Claude Documentation - Preact MCP Server

This document contains technical details and learnings about the Preact MCP Server implementation for Claude Code.

## Project Overview

The Preact MCP Server is a Model Context Protocol implementation that provides Claude with access to Preact ecosystem documentation. It aggregates information from multiple Preact repositories to answer questions about Preact, Preact-ISO, and Signals.

## Architecture

### Core Components

#### 1. MCP Server (`src/index.ts`)
- **Purpose**: Main server implementation using the MCP SDK
- **Key Features**:
  - Stdio transport for communication with Claude
  - Tool registration and request handling
  - Error handling and validation
- **Tools Exposed**:
  - `query_preact_docs`: Multi-repository documentation search
  - `get_preact_readme`: Repository-specific README retrieval
  - `list_preact_repositories`: Available repository enumeration

#### 2. Data Source (`src/datasource.ts`)
- **Purpose**: Handles data fetching and caching from GitHub
- **Key Features**:
  - HTTP caching with 5-minute TTL to respect rate limits
  - Text search with context extraction
  - Error handling for network failures
  - Support for multiple repository sources

### Repository Sources

The server queries these Preact ecosystem repositories:

1. **preact/preact**: Core Preact library
   - README: `https://raw.githubusercontent.com/preactjs/preact/refs/heads/main/README.md`
   - Description: Fast 3kB React alternative

2. **preact/preact-iso**: Isomorphic utilities
   - README: `https://raw.githubusercontent.com/preactjs/preact-iso/refs/heads/main/README.md`
   - Description: SSR and hydration utilities

3. **preact/signals**: Reactive state management
   - README: `https://raw.githubusercontent.com/preactjs/signals/refs/heads/main/README.md`
   - Description: Fine-grained reactivity system

## Technical Implementation Details

### Search Algorithm
- Performs case-insensitive substring matching
- Returns context (2 lines before/after matches)
- Limits results to 10 matches per repository
- Formats results with markdown code blocks

### Caching Strategy
- In-memory cache with Map data structure
- Cache key: URL string
- Cache value: `{ data: string, timestamp: number }`
- TTL: 5 minutes (300,000ms)
- Automatic cache invalidation on expiry

### Error Handling
- Network request failures with descriptive messages
- Missing repository validation
- Graceful degradation when individual sources fail
- TypeScript strict mode for compile-time safety

## Dependencies

### Runtime Dependencies
- `@modelcontextprotocol/sdk`: ^1.15.0 - MCP protocol implementation
- `node-fetch`: ^3.3.2 - HTTP client for GitHub API calls

### Development Dependencies
- `typescript`: ^5.8.0 - Type checking and compilation
- `tsx`: ^4.20.0 - TypeScript execution for development
- `@types/node`: ^20.0.0 - Node.js type definitions

## Build and Deployment

### Build Process
1. TypeScript compilation to `dist/` directory
2. ES modules output for Node.js compatibility
3. Declaration files generation for type safety

### Integration with Claude Desktop
Configuration in `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "preact-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/preact-mcp/dist/index.js"]
    }
  }
}
```

## Usage Patterns

### Common Queries
- "How to use hooks in Preact?"
- "Signals tutorial and examples"
- "Server-side rendering with preact-iso"
- "Component lifecycle methods"
- "Performance optimization techniques"

### Query Strategies
- Use `repository: "all"` for comprehensive searches
- Specify individual repositories for focused results
- Use `type: "readme"` for getting started information
- Combine with natural language for best results

## Performance Considerations

### Rate Limiting
- GitHub raw content has generous rate limits
- Caching reduces API calls significantly
- No authentication required for public repositories

### Memory Usage
- Cache grows with unique URLs accessed
- No automatic cache size limiting implemented
- Consider LRU cache for production use

### Network Optimization
- Parallel requests when querying multiple repositories
- Graceful fallback on network failures
- Timeout handling for slow responses

## Security Considerations

### Data Sources
- Only fetches from trusted GitHub repositories
- Uses HTTPS for all external requests
- No user-provided URLs or dynamic repository selection

### Input Validation
- Query parameters are properly typed
- Repository names are validated against allowed list
- No code execution or file system access

## Future Enhancements

### Potential Improvements
1. **Enhanced Search**: Full-text search with scoring
2. **Code Examples**: Extract and index code snippets
3. **Version Support**: Query specific repository versions/tags
4. **API Documentation**: Parse and index API reference docs
5. **Community Content**: Include discussions, issues, and PRs

### Scalability Considerations
- Database backend for persistent caching
- Search index for better performance
- CDN integration for faster content delivery
- Webhook-based cache invalidation

## Troubleshooting

### Common Issues
1. **Build Failures**: Usually TypeScript compilation errors
2. **Network Errors**: GitHub API rate limiting or connectivity
3. **Integration Issues**: Incorrect path in Claude Desktop config
4. **Cache Problems**: Stale data or memory usage

### Debugging Tips
- Check `npm run build` output for TypeScript errors
- Verify network connectivity to GitHub
- Test server startup with `npm run dev`
- Validate Claude Desktop configuration syntax

## Testing Strategy

### Manual Testing
- Tool invocation through Claude interface
- Repository-specific queries
- Error condition handling
- Cache behavior validation

### Automated Testing Opportunities
- Unit tests for search algorithm
- Integration tests for GitHub API
- Cache behavior verification
- Error handling validation

## Lessons Learned

### MCP Development
- MCP SDK provides robust protocol handling
- Stdio transport is simple and effective
- Tool schema validation is critical for good UX

### GitHub Integration
- Raw content URLs are reliable and fast
- Rate limiting is rarely an issue for documentation
- Error handling must be comprehensive

### Documentation Search
- Context around matches is essential
- Simple substring search is often sufficient
- Result limiting prevents overwhelming responses