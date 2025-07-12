export type Repository = 'preact' | 'preact-iso' | '@preact/signals-core' | '@preact/signals' | '@preact/signals-react' | '@preact/preset-vite' | 'create-preact' | 'playwright-ct' | 'vitest-browser-preact' | 'htm';

export type Package = {
  name: Repository;
  description: string;
  readmeUrl: string;
  docsUrl?: string;
};

export const PACKAGES: Package[] = [
  {
    name: 'preact',
    description: 'The README for the core Preact library',
    readmeUrl: 'https://raw.githubusercontent.com/preactjs/preact/main/README.md',
    docsUrl: 'https://preactjs.com/llms.txt',
  },
  {
    name: 'preact-iso',
    description: 'The README for the Preact ISO library',
    readmeUrl: 'https://raw.githubusercontent.com/preactjs/preact-iso/main/README.md',
  },
  {
    name: '@preact/signals-core',
    description: 'The README for the core Signals library',
    readmeUrl: 'https://raw.githubusercontent.com/preactjs/signals/main/packages/core/README.md',
    docsUrl: 'https://preactjs.com/llms.txt',
  },
  {
    name: '@preact/signals',
    description: 'The README for the Preact Signals bindings for Preact',
    readmeUrl: 'https://raw.githubusercontent.com/preactjs/signals/main/packages/preact/README.md',
    docsUrl: 'https://preactjs.com/llms.txt',
  },
  {
    name: '@preact/signals-react',
    description: 'The README for the Preact Signals bindings for React',
    readmeUrl: 'https://raw.githubusercontent.com/preactjs/signals/main/packages/react/README.md',
  },
  {
    name: '@preact/preset-vite',
    description: 'The README for the Preact Vite preset',
    readmeUrl: 'https://raw.githubusercontent.com/preactjs/preset-vite/main/README.md',
  },
  {
    name: 'create-preact',
    description: 'The README for the Create Preact app tool',
    readmeUrl: 'https://raw.githubusercontent.com/preactjs/create-preact/main/README.md',
  },
  {
    name: 'playwright-ct',
    description: 'The README for the Playwright component testing integration for Preact',
    readmeUrl: 'https://raw.githubusercontent.com/preactjs/playwright-ct/main/README.md',
  },
  {
    name: 'vitest-browser-preact',
    description: 'The README for the Vitest browser Preact integration',
    readmeUrl: 'https://raw.githubusercontent.com/jovidecroock/vitest-browser-preact/main/README.md',
  },
  {
    name: 'htm',
    description: 'The README for the HTM library used with Preact',
    readmeUrl: 'https://raw.githubusercontent.com/developit/htm/master/README.md',
  }
]