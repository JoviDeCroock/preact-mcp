import MiniSearch from 'minisearch';
import { PACKAGES, Repository } from './constants';

interface DocumentSection {
  id: string;
  title: string;
  description: string;
  content: string;
  codeExamples: string[];
  tags: string[];
  searchableText: string;
  repository: string;
  category: string;
  related: string[];
}

export class PreactDataSource {
  private cache = new Map<string, { data: string; timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private documentSections = new Map<string, DocumentSection>();
  private searchIndex = new MiniSearch({
    fields: ['title', 'description', 'searchableText', 'tags', 'category'],
    storeFields: ['title', 'description', 'repository', 'category', 'tags'],
    searchOptions: {
      boost: { title: 3, description: 2, category: 2, tags: 1.5 },
      fuzzy: 0.2,
      prefix: true,
      combineWith: 'OR'
    }
  });

  async getReadme(repository: Repository) {
    const repo = PACKAGES.find(r => r.name === repository);
    if (!repo) {
      throw new Error(`Repository '${repository}' not found`);
    }

    const content = await this.fetchWithCache(repo.readmeUrl);
    if (!content) {
      throw new Error(`Failed to fetch README for ${repo.name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: `# ${repo.name} README\n\n${content}`,
        },
      ],
    };
  }

  async queryDocs(query: string, repository: Repository, includeExamples: boolean = true) {
    const repo = PACKAGES.find(r => r.name === repository);
    if (!repo) {
      throw new Error(`Repository '${repository}' not found`);
    }

    const results: string[] = [];

    try {
      if (repo.docsUrl) {
        try {
          const docsContent = await this.fetchDocumentation(repo.docsUrl);
          const sections = await this.parseAndIndexDocumentation(docsContent, repo.name);
          const matches = this.searchSections(query, repo.name, includeExamples);
          if (matches.length > 0) {
            results.push(`## ${repo.name} Documentation Results:\n${matches.join('\n\n')}`);
          }
        } catch (error) {
          results.push(`## ${repo.name} Documentation: Unable to fetch (${error instanceof Error ? error.message : 'Unknown error'})`);
        }
      } 
      
      if (repository !== 'preact') {
        const readme = await this.fetchWithCache(repo.readmeUrl);
        results.push(`## ${repo.name} README Results:\n${readme}`);
      }
    } catch (error) {
      results.push(`## ${repo.name}: Error - ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  private async parseAndIndexDocumentation(content: string, repository: string): Promise<DocumentSection[]> {
    // Enhanced parsing logic that properly handles the llms.txt format
    const sections = this.parseDocumentation(content, repository);
    
    // Clear existing sections for this repository
    for (const [key, section] of this.documentSections) {
      if (section.repository === repository) {
        this.documentSections.delete(key);
      }
    }
    
    // Store new sections
    sections.forEach(section => {
      this.documentSections.set(section.id, section);
    });
    
    // Update search index
    this.searchIndex.removeAll(this.searchIndex.search('*', { filter: (result: any) => result.repository === repository }));
    this.searchIndex.addAll(sections);
    
    return sections;
  }

  private parseDocumentation(content: string, repository: string): DocumentSection[] {
    // Split on the pattern: --- followed by **Description:**
    const splitPattern = /---\s*\n\s*\*\*Description:\*\*/;
    const rawSections = content.split(splitPattern);
    
    // Skip the first part (usually contains header info)
    const sections = rawSections.slice(1).map((section, index) => {
      const lines = section.trim().split('\n');
      
      // Extract description (first line after the split)
      const description = lines[0]?.trim() || '';
      
      // Find title - look for markdown headers in the content
      const title = this.extractTitle(section) || `Section ${index + 1}`;
      
      // Extract code examples
      const codeExamples = this.extractCodeExamples(section);
      
      // Generate tags based on content analysis
      const tags = this.extractTags(section, title);
      
      // Determine category
      const category = this.categorizeContent(title, section);
      
      // Find related concepts
      const related = this.findRelatedConcepts(title, section);
      
      // Create searchable text
      const searchableText = this.createSearchableText(title, description, section);
      
      return {
        id: `${repository}-${this.slugify(title)}-${index}`,
        title,
        description,
        content: section,
        codeExamples,
        tags,
        searchableText,
        repository,
        category,
        related
      };
    });
    
    return sections.filter(section => section.title && section.description);
  }

  private extractTitle(content: string): string {
    // Look for various header patterns
    const lines = content.split('\n');
    
    for (const line of lines) {
      // Match markdown headers (# ## ###)
      const headerMatch = line.match(/^#+\s*(.+)$/);
      if (headerMatch) {
        return headerMatch[1].trim();
      }
      
      // Match bold text that looks like a title
      const boldMatch = line.match(/^\*\*([^*]+)\*\*$/);
      if (boldMatch) {
        return boldMatch[1].trim();
      }
      
      // Match function/method signatures
      const funcMatch = line.match(/^`([^`]+)`/);
      if (funcMatch && funcMatch[1].includes('(')) {
        return funcMatch[1].trim();
      }
    }
    
    // Fallback to first non-empty line
    const firstLine = lines.find(line => line.trim().length > 0);
    return firstLine?.trim().substring(0, 50) || 'Unknown';
  }

  private extractCodeExamples(content: string): string[] {
    const codeBlocks: string[] = [];
    const codeBlockRegex = /```[\s\S]*?```/g;
    let match;
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      codeBlocks.push(match[0]);
    }
    
    // Also look for inline code that might be examples
    const inlineCodeRegex = /`([^`]+)`/g;
    const inlineMatches: string[] = [];
    
    while ((match = inlineCodeRegex.exec(content)) !== null) {
      if (match[1].length > 10) { // Only longer inline code snippets
        inlineMatches.push(match[1]);
      }
    }
    
    return [...codeBlocks, ...inlineMatches.slice(0, 3)]; // Limit inline examples
  }

  private extractTags(content: string, title: string): string[] {
    const tags = new Set<string>();
    
    // Add title-based tags
    const titleWords = title.toLowerCase().split(/\W+/).filter(word => word.length > 2);
    titleWords.forEach(word => tags.add(word));
    
    // Concept-based tags
    const concepts = [
      'hooks', 'state', 'props', 'component', 'jsx', 'render', 'effect', 'context',
      'router', 'signal', 'fragment', 'portal', 'suspense', 'lazy', 'memo',
      'ref', 'lifecycle', 'event', 'form', 'testing', 'typescript', 'ssr'
    ];
    
    concepts.forEach(concept => {
      if (content.toLowerCase().includes(concept)) {
        tags.add(concept);
      }
    });
    
    // Function/method tags
    if (content.includes('function') || content.includes('=>') || title.includes('()')) {
      tags.add('function');
    }
    
    // API tags
    if (content.includes('API') || content.includes('interface')) {
      tags.add('api');
    }
    
    return Array.from(tags);
  }

  private categorizeContent(title: string, content: string): string {
    const titleLower = title.toLowerCase();
    const contentLower = content.toLowerCase();
    
    if (titleLower.includes('hook') || contentLower.includes('usehook') || titleLower.startsWith('use')) {
      return 'hooks';
    }
    
    if (titleLower.includes('component') || contentLower.includes('class component') || contentLower.includes('function component')) {
      return 'components';
    }
    
    if (titleLower.includes('api') || titleLower.includes('reference')) {
      return 'api';
    }
    
    if (titleLower.includes('guide') || titleLower.includes('tutorial') || titleLower.includes('getting started')) {
      return 'guides';
    }
    
    if (titleLower.includes('signal')) {
      return 'signals';
    }
    
    if (titleLower.includes('router') || titleLower.includes('routing')) {
      return 'routing';
    }
    
    if (titleLower.includes('test') || titleLower.includes('debug')) {
      return 'testing';
    }
    
    if (titleLower.includes('typescript') || titleLower.includes('type')) {
      return 'typescript';
    }
    
    return 'general';
  }

  private findRelatedConcepts(title: string, content: string): string[] {
    const related = new Set<string>();
    
    // Hook relationships
    if (title.toLowerCase().includes('usestate')) {
      related.add('useState').add('useEffect').add('hooks');
    }
    
    if (title.toLowerCase().includes('useeffect')) {
      related.add('useEffect').add('lifecycle').add('useState');
    }
    
    // Component relationships
    if (content.toLowerCase().includes('component')) {
      related.add('props').add('state').add('render');
    }
    
    // Signal relationships
    if (content.toLowerCase().includes('signal')) {
      related.add('reactive').add('state management').add('computed');
    }
    
    return Array.from(related);
  }

  private createSearchableText(title: string, description: string, content: string): string {
    // Create enhanced searchable text with key phrases
    const keyPhrases = [];
    
    // Add title variations
    keyPhrases.push(title);
    keyPhrases.push(title.replace(/[()]/g, ''));
    
    // Add description
    keyPhrases.push(description);
    
    // Extract key sentences that contain important concepts
    const sentences = content.split(/[.!?]+/);
    sentences.forEach(sentence => {
      if (sentence.includes('used to') || sentence.includes('allows you to') || sentence.includes('returns')) {
        keyPhrases.push(sentence.trim());
      }
    });
    
    return keyPhrases.join(' ').toLowerCase();
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private searchSections(query: string, repository?: string, includeExamples: boolean = true): string[] {
    const searchOptions: any = {
      filter: repository ? (result: any) => result.repository === repository : undefined
    };
    
    const searchResults = this.searchIndex.search(query, searchOptions);
    
    return searchResults.slice(0, 10).map(result => {
      const section = this.documentSections.get(result.id);
      if (!section) return '';
      
      return this.formatSearchResult(section, query, includeExamples);
    }).filter(result => result.length > 0);
  }

  private formatSearchResult(section: DocumentSection, query: string, includeExamples: boolean): string {
    const parts = [];
    
    // Title with category
    parts.push(`## ${section.title}`);
    if (section.category !== 'general') {
      parts.push(`**Category:** ${section.category}`);
    }
    
    // Description
    parts.push(`**Description:** ${section.description}`);
    
    // Code examples if requested and available
    if (includeExamples && section.codeExamples.length > 0) {
      parts.push('**Example:**');
      // Show the most relevant example (first one for now)
      parts.push(section.codeExamples[0]);
    }
    
    // Context and usage info
    const contextInfo = this.getContextualInfo(section, query);
    if (contextInfo) {
      parts.push(`**Usage:** ${contextInfo}`);
    }
    
    // Related concepts
    if (section.related.length > 0) {
      parts.push(`**Related:** ${section.related.join(', ')}`);
    }
    
    // Tags for discoverability
    if (section.tags.length > 0) {
      parts.push(`**Tags:** ${section.tags.join(', ')}`);
    }
    
    return parts.join('\n\n');
  }

  private getContextualInfo(section: DocumentSection, query: string): string {
    const contextMap = new Map([
      ['hooks', 'Use hooks in functional components to manage state and side effects'],
      ['usestate', 'Hook for managing local component state. Returns [state, setState]'],
      ['useeffect', 'Hook for side effects like API calls, subscriptions, DOM manipulation'],
      ['component', 'Building blocks of Preact applications. Can be functional or class-based'],
      ['jsx', 'Syntax extension for describing UI structure. Compiles to h() calls'],
      ['signal', 'Reactive primitive for fine-grained state management with automatic updates'],
      ['router', 'Navigate between different views/pages in your application'],
      ['context', 'Share data between components without prop drilling'],
      ['ref', 'Direct access to DOM elements or component instances'],
      ['portal', 'Render children into a different DOM subtree'],
      ['suspense', 'Handle loading states for async components and data']
    ]);
    
    const queryLower = query.toLowerCase();
    const titleLower = section.title.toLowerCase();
    
    // Check for direct matches
    for (const [key, info] of contextMap) {
      if (queryLower.includes(key) || titleLower.includes(key)) {
        return info;
      }
    }
    
    // Category-based context
    switch (section.category) {
      case 'hooks':
        return 'React-style hooks for functional components';
      case 'components':
        return 'Reusable UI building blocks';
      case 'api':
        return 'Core Preact APIs and utilities';
      case 'signals':
        return 'Fine-grained reactive state management';
      case 'routing':
        return 'Navigation and URL handling';
      default:
        return '';
    }
  }
}