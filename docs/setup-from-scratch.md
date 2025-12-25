# TypeScript Full-Stack Project Setup Guide

A comprehensive step-by-step guide to set up a TypeScript-based full-stack project with both UI (React) and server (Express) from scratch.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Initialization](#project-initialization)
3. [TypeScript Configuration](#typescript-configuration)
4. [Frontend Setup (React + Vite)](#frontend-setup-react--vite)
5. [Backend Setup (Express)](#backend-setup-express)
6. [Testing Setup (Vitest)](#testing-setup-vitest)
7. [Linting & Formatting](#linting--formatting)
8. [Build & Run Scripts](#build--run-scripts)
9. [Verification](#verification)
10. [Project Structure](#project-structure)

---

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js**: v22.16.0 or later (use [Volta](https://volta.sh/) or [nvm](https://github.com/nvm-sh/nvm) for version management)
- **pnpm**: v10.x or later (recommended package manager)

```bash
# Install pnpm globally
npm install -g pnpm

# Verify installations
node --version  # Should be 22.16.0 or later
pnpm --version  # Should be 10.x or later
```

---

## Project Initialization

### Step 1: Create Project Directory

```bash
# Create and navigate to project directory
mkdir my-fullstack-app
cd my-fullstack-app

# Initialize git
git init

# Initialize package.json
pnpm init
```

### Step 2: Configure package.json

Edit `package.json` to add basic metadata:

```json
{
  "name": "my-fullstack-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "packageManager": "pnpm@10.26.2"
}
```

**Important:** Set `"type": "module"` to enable ES modules throughout the project.

### Step 3: Create .gitignore

Create `.gitignore` in the project root:

```gitignore
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
coverage
```

---

## TypeScript Configuration

### Step 4: Install TypeScript

```bash
pnpm add -D typescript@~5.8.3
```

### Step 5: Create Multiple tsconfig Files

TypeScript configuration is split into 4 files for different execution contexts.

#### 5.1: Create `tsconfig.json` (Base Configuration)

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "noEmit": true,
    "noImplicitAny": true,
    "allowJs": true,
    "strict": true,
    "allowSyntheticDefaultImports": true,
    "noUncheckedSideEffectImports": true
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.js",
    "tests/**/*.ts",
    "tests/**/*.tsx",
    "tests/**/*.js",
    "tailwind.config.js",
    "postcss.config.cjs",
    "vite.config.ts",
    "eslint.config.mts"
  ],
  "exclude": ["**/assets/**/*", "node_modules", "dist"]
}
```

#### 5.2: Create `tsconfig.app.json` (Frontend/React)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"]
}
```

#### 5.3: Create `tsconfig.server.json` (Backend/Express)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "types": ["node"]
  },
  "include": [
    "src/server/**/*",
    "src/models/**/*",
    "src/utils/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "**/assets/**/*"
  ]
}
```

#### 5.4: Create `tsconfig.node.json` (Build Tools)

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["vite.config.ts"]
}
```

---

## Frontend Setup (React + Vite)

### Step 6: Install Frontend Dependencies

```bash
# Core frontend dependencies
pnpm add react@^18.3.1 react-dom@^18.3.1

pnpm add -D @vitejs/plugin-react@^4.3.4 \
  vite@^6.3.5 \
  @types/react@^18.3.18 \
  @types/react-dom@^18.3.5

# Styling (optional but recommended)
pnpm add -D tailwindcss@^4.1.8 \
  @tailwindcss/postcss@^4.1.8 \
  autoprefixer@^10.4.21 \
  postcss@^8.5.4 \
  daisyui@^5.0.43
```

### Step 7: Create Vite Configuration

Create `vite.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import * as path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
  },
})
```

### Step 8: Create Tailwind Configuration (Optional)

Create `tailwind.config.js`:

```javascript
import daisyui from 'daisyui'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}', './index.html'],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    logs: false,
    themes: ['light'],
  },
}
```

Create `postcss.config.cjs`:

```javascript
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
```

### Step 9: Create Frontend Entry Point

Create `index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Full-Stack App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Create `src/main.tsx`:

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

Create `src/App.tsx`:

```typescript
import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-6xl font-bold mb-8 text-primary">
        Welcome to My Full-Stack App
      </h1>
      <button
        onClick={() => setCount((count) => count + 1)}
        className="btn btn-primary text-xl"
      >
        Count: {count}
      </button>
    </main>
  )
}

export default App
```

Create `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}
```

Create `src/vite-env.d.ts`:

```typescript
/// <reference types="vite/client" />
```

---

## Backend Setup (Express)

### Step 11: Install Backend Dependencies

```bash
# Production dependencies
pnpm add express@^5.1.0 \
  cors@^2.8.5 \
  winston@^3.17.0

# Development dependencies
pnpm add -D @types/express@^5.0.3 \
  @types/cors@^2.8.19 \
  @types/node@^24.0.0 \
  tsx@^4.20.0 \
  concurrently@^9.1.2
```

### Step 12: Create Backend Files

Create directory structure:

```bash
mkdir -p src/server src/models src/utils
```

Create `src/server/config.ts`:

```typescript
export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  env: process.env.NODE_ENV || 'development',
}
```

Create `src/server/app.ts`:

```typescript
import express from 'express'
import cors from 'cors'

export function createApp() {
  const app = express()

  // Middleware
  app.use(cors())
  app.use(express.json())

  // Routes
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  app.get('/api/hello', (_req, res) => {
    res.json({ message: 'Hello from Express + TypeScript!' })
  })

  return app
}

export function initApp() {
  const app = createApp()
  const cfg = await import('./config.js').then((m) => m.config)
  return { app, cfg }
}
```

Create `src/server/index.ts`:

```typescript
import { initApp } from './app.js'

async function main() {
  const { app, cfg } = initApp()

  app.listen(cfg.port, () => {
    console.log(`Server listening on http://localhost:${cfg.port}`)
  })
}

main().catch(console.error)
```

---

## Testing Setup (Vitest)

### Step 13: Install Testing Dependencies

```bash
pnpm add -D vitest@^3.2.3 \
  @vitest/ui@^3.2.3 \
  @vitest/coverage-v8@^3.2.3 \
  jsdom@^26.1.0 \
  @testing-library/react@^16.1.0 \
  @testing-library/jest-dom@^6.6.3 \
  @testing-library/user-event@^14.5.2
```

### Step 14: Create Test Setup

Create `tests/setup.ts`:

```typescript
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock browser APIs that might not be available in test environment
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query as unknown as string,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
  takeRecords: vi.fn(() => []),
}))
```

Create directory for tests:

```bash
mkdir -p tests/ui tests/server tests/utils
```

Create sample test `tests/ui/App.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../../src/App.tsx'

describe('App Component', () => {
  it('renders welcome message', () => {
    render(<App />)
    expect(screen.getByText(/Welcome to My Full-Stack App/i)).toBeInTheDocument()
  })

  it('increments counter on button click', async () => {
    const { user } = render(<App />)
    const button = screen.getByRole('button', { name: /count: 0/i })

    await user.click(button)
    expect(screen.getByRole('button', { name: /count: 1/i })).toBeInTheDocument()
  })
})
```

---

## Linting & Formatting

### Step 15: Install ESLint

```bash
pnpm add -D eslint@^9.28.0 \
  @eslint/js@^9.28.0 \
  typescript-eslint@^8.34.0 \
  eslint-plugin-react@^7.38.0 \
  eslint-plugin-react-hooks@^5.1.0 \
  eslint-plugin-react-refresh@^0.4.18
```

Create `eslint.config.mts`:

```typescript
// @ts-check

import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import reactRefreshPlugin from 'eslint-plugin-react-refresh'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['src/**/*.{ts,tsx}', 'tests/**/*.{ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'react-refresh': reactRefreshPlugin,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules,
      ...reactHooksPlugin.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true, allowBoolean: true },
      ],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    ignores: ['**/assets/**/*', 'dist', 'node_modules', 'coverage'],
  },
  {
    files: ['**/tailwind.config.js'],
    rules: {},
  },
  {
    files: ['**/postcss.config.cjs'],
    languageOptions: {
      globals: {
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        process: 'readonly',
        console: 'readonly',
      },
    },
  },
)
```

### Step 16: Install Prettier

```bash
pnpm add -D prettier@^3.5.3
```

Create `.prettierrc`:

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "arrowParens": "always",
  "printWidth": 90,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "quoteProps": "as-needed"
}
```

---

## Build & Run Scripts

### Step 17: Add Scripts to package.json

Update your `package.json` scripts section:

```json
{
  "scripts": {
    "dev-server": "tsx --watch --watch-preserve-output src/server/index.ts",
    "dev-client": "vite",
    "dev": "concurrently -n \"Server,Client\" -c \"yellow,blue\" \"pnpm run dev-server\" \"pnpm run dev-client\"",
    "build": "tsc -p tsconfig.app.json && vite build",
    "preview": "vite preview",
    "check": "tsc -p tsconfig.app.json && tsc -p tsconfig.node.json",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint .",
    "format": "prettier --write 'src/**/*.{ts,tsx}' 'tests/**/*.{ts,tsx}' '*.{js,ts,mts,cjs}'"
  }
}
```

### Script Explanations:

| Script | Purpose |
|--------|---------|
| `dev-server` | Runs Express server with hot reload using tsx |
| `dev-client` | Runs Vite dev server for frontend |
| `dev` | Runs both client and server concurrently |
| `build` | Type-checks and builds frontend for production |
| `preview` | Previews production build locally |
| `check` | Type-checks React app and Vite config |
| `test` | Runs all tests once |
| `test:watch` | Runs tests in watch mode |
| `test:ui` | Opens Vitest UI for interactive testing |
| `test:coverage` | Runs tests with coverage report |
| `lint` | Lints all TypeScript files |
| `format` | Formats code with Prettier |

---

## Verification

### Step 18: Verify the Setup

Run each command to ensure everything works:

```bash
# Install all dependencies
pnpm install

# Type check
pnpm run check

# Lint code
pnpm run lint

# Format code
pnpm run format

# Run tests
pnpm run test

# Start development servers
pnpm run dev
```

**Expected Results:**

- `pnpm run check`: No type errors
- `pnpm run lint`: No linting errors
- `pnpm run format`: Code formatted successfully
- `pnpm run test`: All tests pass
- `pnpm run dev`: Both servers start:
  - Frontend: http://localhost:5173
  - Backend: http://localhost:3000

### Step 19: Test the API

With the dev server running, test the backend:

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test hello endpoint
curl http://localhost:3000/api/hello
```

---

## Project Structure

Your final project structure should look like this:

```
my-fullstack-app/
├── src/
│   ├── server/           # Backend code
│   │   ├── index.ts      # Server entry point
│   │   ├── app.ts        # Express app setup
│   │   └── config.ts     # Server configuration
│   ├── models/           # Shared data models
│   ├── utils/            # Shared utilities
│   ├── components/       # React components (optional)
│   ├── App.tsx           # Root React component
│   ├── main.tsx          # Frontend entry point
│   ├── index.css         # Global styles
│   └── vite-env.d.ts     # Vite type definitions
├── tests/
│   ├── ui/               # Frontend tests
│   ├── server/           # Backend tests
│   ├── utils/            # Utility tests
│   └── setup.ts          # Test setup
├── public/               # Static assets
├── index.html            # HTML entry point
├── package.json          # Dependencies and scripts
├── tsconfig.json         # Base TypeScript config
├── tsconfig.app.json     # Frontend TypeScript config
├── tsconfig.server.json  # Backend TypeScript config
├── tsconfig.node.json    # Build tools TypeScript config
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── postcss.config.cjs    # PostCSS configuration
├── eslint.config.mts     # ESLint configuration
├── .prettierrc           # Prettier configuration
└── .gitignore            # Git ignore rules
```

---

## Additional Configuration (Optional)

### Volta for Node Version Management

Create `.volta` section in `package.json`:

```json
{
  "volta": {
    "node": "22.16.0"
  }
}
```

Or create `.node-version` file:

```
22.16.0
```

### VS Code Configuration

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

Create `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss"
  ]
}
```

---

## Troubleshooting

### Common Issues

**1. Module resolution errors:**
- Ensure `"type": "module"` is in package.json
- Use `.js` extensions in imports (e.g., `import { x } from './app.js'`)

**2. TypeScript errors in React/TSX files:**
- Run `pnpm run check` to see type errors
- Ensure `jsx: "react-jsx"` is set in tsconfig.app.json

**3. ESLint errors with config files:**
- Check that globals are defined for CommonJS files (postcss.config.cjs)

**4. Tests not running:**
- Verify `tests/setup.ts` is configured in `vite.config.ts`
- Check that jsdom is installed

**5. Vite not starting:**
- Clear cache: `rm -rf node_modules/.vite`
- Delete node_modules and reinstall: `rm -rf node_modules && pnpm install`

---

## Next Steps

After completing this setup:

1. **Add environment variables**: Use `.env` files with `vite` for frontend and `dotenv` for backend
2. **Add database**: Integrate PostgreSQL, MongoDB, or your preferred database
3. **Add authentication**: Implement JWT, OAuth, or session-based auth
4. **Add API documentation**: Use tools like Swagger/OpenAPI
5. **Add CI/CD**: Set up GitHub Actions, GitLab CI, or similar
6. **Add Docker**: Containerize the application
7. **Add production server**: Use PM2 or similar for production deployment

---

## Summary

You now have a fully functional TypeScript full-stack development environment with:

- **Frontend**: React 18 + Vite + TypeScript
- **Backend**: Express + TypeScript (using tsx for development)
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint with TypeScript strict rules + React plugins
- **Formatting**: Prettier
- **Type Checking**: Multiple tsconfig files for different contexts
- **Development**: Hot reload for both client and server
- **Build**: Production-ready build process

All scripts work seamlessly with `pnpm run <script-name>` and the project is ready for development!

---

## Related Documentation

- [TypeScript Configuration Explained](./typescript-configuration-and-tooling.md)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vite.dev)
- [Express Documentation](https://expressjs.com)
- [Vitest Documentation](https://vitest.dev)
- [React Testing Library](https://testing-library.com/react)
