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
    description: 'The core Preact library, includes React compatibility, a lean core library and the Preact hooks implementation.',
    readmeUrl: 'https://raw.githubusercontent.com/preactjs/preact/main/README.md',
    docsUrl: 'https://preactjs.com/llms.txt',
  },
  {
    name: 'preact-iso',
    description: 'Preact-ISO is a router to build applications with Preact isomorphically, it also contains utilities for pre-rendering and hydration.',
    readmeUrl: 'https://raw.githubusercontent.com/preactjs/preact-iso/main/README.md',
  },
  {
    name: '@preact/signals-core',
    description: 'The core Preact Signals library, which provides a reactive state management system for JS applications.',
    readmeUrl: 'https://raw.githubusercontent.com/preactjs/signals/main/packages/core/README.md',
    docsUrl: 'https://preactjs.com/llms.txt',
  },
  {
    name: '@preact/signals',
    description: 'The Preact Signals library, which provides a reactive state management system for Preact applications.',
    readmeUrl: 'https://raw.githubusercontent.com/preactjs/signals/main/packages/preact/README.md',
    docsUrl: 'https://preactjs.com/llms.txt',
  },
  {
    name: '@preact/signals-react',
    description: 'The Preact Signals React library, which provides a reactive state management system for Preact applications using React compatibility.',
    readmeUrl: 'https://raw.githubusercontent.com/preactjs/signals/main/packages/react/README.md',
  },
  {
    name: '@preact/preset-vite',
    description: 'The Preact Vite preset, which provides a set of optimizations and configurations for using Preact with Vite.',
    readmeUrl: 'https://raw.githubusercontent.com/preactjs/preset-vite/main/README.md',
  },
  {
    name: 'create-preact',
    description: 'The Create Preact app tool, which helps you set up a new Preact project with sensible defaults.',
    readmeUrl: 'https://raw.githubusercontent.com/preactjs/create-preact/main/README.md',
  },
  {
    name: 'playwright-ct',
    description: 'The Playwright component testing integration for Preact',
    readmeUrl: 'https://raw.githubusercontent.com/preactjs/playwright-ct/main/README.md',
  },
  {
    name: 'vitest-browser-preact',
    description: 'The Vitest browser Preact integration',
    readmeUrl: 'https://raw.githubusercontent.com/jovidecroock/vitest-browser-preact/main/README.md',
  },
  {
    name: 'htm',
    description: 'The HTM library used with Preact',
    readmeUrl: 'https://raw.githubusercontent.com/developit/htm/master/README.md',
  }
]