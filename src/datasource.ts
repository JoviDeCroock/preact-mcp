import fetch from 'node-fetch';

interface Repository {
  name: string;
  description: string;
  readmeUrl: string;
  docsUrl?: string;
}

export class PreactDataSource {
  private repositories: Repository[] = [
    {
      name: 'preact',
      description: 'Fast 3kB React alternative with the same modern API',
      readmeUrl: 'https://raw.githubusercontent.com/preactjs/preact/refs/heads/main/README.md',
      docsUrl: 'https://preactjs.com/',
    },
    {
      name: 'preact-iso',
      description: 'Isomorphic utilities for Preact',
      readmeUrl: 'https://raw.githubusercontent.com/preactjs/preact-iso/refs/heads/main/README.md',
    },
    {
      name: 'signals',
      description: 'Reactive state management for Preact',
      readmeUrl: 'https://raw.githubusercontent.com/preactjs/signals/refs/heads/main/README.md',
    },
  ];

  private cache = new Map<string, { data: string; timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  getRepositories(): Repository[] {
    return this.repositories;
  }

  async getReadme(repository: string) {
    const repo = this.repositories.find(r => r.name === repository);
    if (!repo) {
      throw new Error(`Repository '${repository}' not found`);
    }

    const content = await this.fetchWithCache(repo.readmeUrl);
    
    return {
      content: [
        {
          type: 'text',
          text: `# ${repo.name} README\n\n${content}`,
        },
      ],
    };
  }

  async queryDocs(query: string, repository: string = 'all', type: string = 'all') {
    const repos = repository === 'all' 
      ? this.repositories 
      : this.repositories.filter(r => r.name === repository);

    if (repos.length === 0) {
      throw new Error(`Repository '${repository}' not found`);
    }

    const results: string[] = [];

    for (const repo of repos) {
      try {
        if (type === 'readme' || type === 'all') {
          const readme = await this.fetchWithCache(repo.readmeUrl);
          const matches = this.searchInText(readme, query);
          if (matches.length > 0) {
            results.push(`## ${repo.name} README Results:\n${matches.join('\n\n')}`);
          }
        }

        if (repo.docsUrl && (type === 'docs' || type === 'all')) {
          try {
            const docsContent = await this.fetchDocumentation(repo.docsUrl);
            const matches = this.searchInText(docsContent, query);
            if (matches.length > 0) {
              results.push(`## ${repo.name} Documentation Results:\n${matches.join('\n\n')}`);
            }
          } catch (error) {
            results.push(`## ${repo.name} Documentation: Unable to fetch (${error instanceof Error ? error.message : 'Unknown error'})`);
          }
        }
      } catch (error) {
        results.push(`## ${repo.name}: Error - ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    const responseText = results.length > 0 
      ? results.join('\n\n---\n\n')
      : `No results found for query: "${query}"`;

    return {
      content: [
        {
          type: 'text',
          text: responseText,
        },
      ],
    };
  }

  private async fetchWithCache(url: string): Promise<string> {
    const cached = this.cache.get(url);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const text = await response.text();
      this.cache.set(url, { data: text, timestamp: now });
      return text;
    } catch (error) {
      throw new Error(`Failed to fetch ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async fetchDocumentation(baseUrl: string): Promise<string> {
    const response = await fetch(baseUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.text();
  }

  private searchInText(text: string, query: string): string[] {
    const lines = text.split('\n');
    const results: string[] = [];
    const queryLower = query.toLowerCase();
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.toLowerCase().includes(queryLower)) {
        const start = Math.max(0, i - 2);
        const end = Math.min(lines.length, i + 3);
        const context = lines.slice(start, end).join('\n');
        results.push(`**Match found (line ${i + 1}):**\n\`\`\`\n${context}\n\`\`\``);
      }
    }
    
    return results.slice(0, 10); // Limit to 10 results
  }
}