# How TypeScript and Vite Work Together

## Overview

When you run a React (or Svelte) application built with TypeScript and Vite, three key configuration files work together, each serving a distinct purpose:

1. **`tsconfig.json`** - TypeScript compiler configuration (type checking)
2. **`vite.config.ts`** - Vite bundler configuration (building & serving)
3. **`package.json`** - Project metadata and module system configuration

**Key Insight**: Vite does NOT use TypeScript to transpile your code. Instead, it uses esbuild (written in Go) for lightning-fast transpilation, and only uses TypeScript for type checking.

---

## The Three Files and Their Roles

### 1. `tsconfig.json` - TypeScript Configuration

**Purpose**: Defines how the TypeScript compiler (`tsc`) checks your code for type errors.

**When it's used**:
- When you run `tsc` or `tsc --noEmit` (type checking only)
- When your IDE/editor checks types in real-time
- When you run `svelte-check` or similar tools

**What it does**:
- ✅ Type checking
- ✅ Editor intellisense and autocomplete
- ❌ Does NOT transpile code during Vite dev/build (Vite uses esbuild instead)

**Example**:
```json
{
  "compilerOptions": {
    "target": "ESNext",           // What JS version to target
    "module": "ESNext",            // What module system to use
    "moduleResolution": "bundler", // How to resolve imports
    "strict": true,                // Enable strict type checking
    "noEmit": true,                // Don't output JS files (Vite handles that)
    "jsx": "react-jsx",            // How to transform JSX (for React)
    "isolatedModules": true        // Each file can be transpiled independently
  }
}
```

**Key Options Explained**:

- **`noEmit: true`**: Critical for Vite projects! Tells TypeScript to ONLY check types, not generate output files. Vite handles the transpilation.

- **`isolatedModules: true`**: Ensures each file can be transpiled independently (required for esbuild/Vite). Prevents features like `const enum` that require cross-file analysis.

- **`moduleResolution: "bundler"`**: Modern resolution strategy that aligns with how bundlers (like Vite) resolve modules. Allows imports like `import styles from './App.module.css'`.

- **`jsx: "react-jsx"`**: For React 17+, transforms JSX without needing to import React in every file.

---

### 2. `vite.config.ts` - Vite Configuration

**Purpose**: Defines how Vite bundles, transforms, and serves your application.

**When it's used**:
- `npm run dev` or `vite` (development server)
- `npm run build` or `vite build` (production build)
- `npm run preview` or `vite preview` (preview production build)

**What it does**:
- ✅ Transpiles TypeScript to JavaScript (using esbuild)
- ✅ Bundles modules
- ✅ Handles HMR (Hot Module Replacement)
- ✅ Optimizes assets
- ✅ Configures dev server
- ❌ Does NOT perform type checking (that's `tsc`'s job)

**Example**:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],           // Enable React support

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),  // Path alias
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.json'],
  },

  build: {
    outDir: 'dist',             // Output directory
    sourcemap: true,            // Generate source maps
    minify: 'esbuild',          // Minification strategy
  },

  server: {
    port: 3000,                 // Dev server port
    open: true,                 // Open browser on start
  },
})
```

**Key Options Explained**:

- **`plugins`**: Vite plugins transform specific file types. For React, `@vitejs/plugin-react` handles JSX transformation and React Fast Refresh.

- **`resolve.alias`**: Creates import shortcuts. With `'@': './src'`, you can write `import { Foo } from '@/components/Foo'` instead of relative paths.

- **`resolve.extensions`**: File extensions Vite tries when resolving imports without extensions.

- **`build.minify: 'esbuild'`**: Uses esbuild for minification (faster than Terser).

---

### 3. `package.json` - Project Configuration

**Purpose**: Defines project metadata, dependencies, scripts, and the module system.

**Key field**: `"type"`

```json
{
  "name": "my-app",
  "type": "module",  // 👈 This is critical!
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

**The `"type"` field**:

| Value | Meaning | File Extensions | Import/Export |
|-------|---------|-----------------|---------------|
| `"module"` | ESM (ECMAScript Modules) | `.js` files are ES modules | Use `import`/`export` |
| `"commonjs"` or omitted | CommonJS | `.js` files are CommonJS | Use `require()`/`module.exports` |

**Example - With `"type": "module"`**:
```javascript
// ✅ Valid in .js files
import express from 'express'
export const app = express()

// ❌ Invalid - CommonJS syntax not allowed
const express = require('express')
module.exports = app
```

**Example - Without `"type"` (CommonJS default)**:
```javascript
// ✅ Valid in .js files
const express = require('express')
module.exports = app

// ❌ Invalid - ESM syntax not allowed without .mjs extension
import express from 'express'
export const app = express()
```

**Overriding the default**:
- Use `.mjs` extension to force ESM
- Use `.cjs` extension to force CommonJS

---

## How They Work Together

### Development Flow (`npm run dev`)

```
1. You run: npm run dev
   ↓
2. Vite starts the dev server
   ↓
3. Vite reads vite.config.ts
   ↓
4. Browser requests /src/main.tsx
   ↓
5. Vite uses esbuild to transpile TypeScript → JavaScript
   ↓
6. Vite serves the transpiled code to the browser
   ↓
7. TypeScript compiler (tsc) runs separately (or in your IDE)
   for type checking only
```

**Key Point**: During development, Vite does NOT wait for type checking. It serves code immediately, even if there are type errors. You typically run type checking separately:

```json
{
  "scripts": {
    "dev": "vite",                    // Start dev server (no type check)
    "type-check": "tsc --noEmit",     // Type check only
    "build": "tsc --noEmit && vite build"  // Type check THEN build
  }
}
```

### Build Flow (`npm run build`)

```
1. You run: npm run build
   ↓
2. (If you have "tsc && vite build")
   ↓
3. First: tsc --noEmit runs
   - Checks all types
   - Fails if type errors found
   - Outputs nothing (--noEmit)
   ↓
4. Then: vite build runs
   - Reads vite.config.ts
   - Uses esbuild to transpile TypeScript
   - Bundles all modules
   - Optimizes and minifies
   - Outputs to dist/ folder
```

---

## Relationship Between `tsconfig.json` and `package.json`

The `"type"` field in `package.json` and the `"module"` option in `tsconfig.json` are related but serve different purposes:

### `package.json` → `"type"` field
- Controls how **Node.js interprets `.js` files** at runtime
- Determines syntax for `.js`, `.jsx`, `.ts`, `.tsx` files

### `tsconfig.json` → `"module"` option
- Controls what **module format TypeScript emits** when transpiling
- Options: `"commonjs"`, `"esnext"`, `"node16"`, `"nodenext"`, etc.

### Compatibility Matrix

| package.json `"type"` | tsconfig.json `"module"` | Result |
|----------------------|--------------------------|--------|
| `"module"` | `"ESNext"` or `"ES2020"` | ✅ Recommended for Vite projects |
| `"module"` | `"NodeNext"` | ✅ Works, uses Node's ESM resolution |
| `"commonjs"` or omitted | `"CommonJS"` | ✅ Traditional Node.js projects |
| `"module"` | `"CommonJS"` | ⚠️ Mismatch - tsc emits CommonJS but Node expects ESM |
| `"commonjs"` | `"ESNext"` | ⚠️ Mismatch - tsc emits ESM but Node expects CommonJS |

**Example: Vite + React Project (Recommended)**

`package.json`:
```json
{
  "type": "module"
}
```

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "noEmit": true
  }
}
```

**Why this works**:
- `package.json` tells Node.js to treat `.js` files as ESM
- `tsconfig.json` tells TypeScript to understand ESM syntax
- `noEmit: true` means TypeScript doesn't output files anyway (Vite does that)
- Vite always outputs ESM in dev, and optimized bundles for production

---

## Multiple `tsconfig` Files in a Project

It's common to have multiple TypeScript configurations for different parts of your project:

### Example Structure:
```
my-app/
├── tsconfig.json           # Base config (extends by others)
├── tsconfig.app.json       # For application code
├── tsconfig.node.json      # For Node.js code (vite.config.ts, etc.)
└── tsconfig.server.json    # For backend/server code
```

### Why Multiple Configs?

Different parts of your codebase run in different environments and need different TypeScript settings.

**Example 1: `tsconfig.app.json` (Browser Code)**
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],  // Browser APIs
    "module": "ESNext",
    "jsx": "react-jsx",
    "isolatedModules": true,
    "noEmit": true
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"]
}
```

**Example 2: `tsconfig.node.json` (Node.js/Config Files)**
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],           // No DOM
    "module": "ESNext",
    "moduleResolution": "bundler",
    "noEmit": true
  },
  "include": ["vite.config.ts", "vitest.config.ts"]
}
```

**Example 3: `tsconfig.server.json` (Backend Server)**
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",        // Node.js resolution
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "noEmit": false              // Actually emit .js files for server
  },
  "include": ["src/server/**/*.ts"]
}
```

### Running Type Checks with Multiple Configs

```json
{
  "scripts": {
    "type-check": "tsc -p tsconfig.app.json && tsc -p tsconfig.node.json"
  }
}
```

Or using a tool like `svelte-check`:
```json
{
  "scripts": {
    "check": "svelte-check --tsconfig ./tsconfig.app.json && tsc -p tsconfig.node.json"
  }
}
```

---

## Real-World Example: Full Setup

Let's look at a complete Vite + React + TypeScript setup:

### File Structure
```
my-react-app/
├── src/
│   ├── main.tsx              # Entry point
│   ├── App.tsx
│   └── vite-env.d.ts         # Vite type definitions
├── public/
│   └── index.html
├── tsconfig.json             # Base TypeScript config
├── tsconfig.app.json         # App-specific config
├── tsconfig.node.json        # Node/config files
├── vite.config.ts            # Vite configuration
└── package.json
```

### `package.json`
```json
{
  "name": "my-react-app",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -p tsconfig.app.json && vite build",
    "preview": "vite preview",
    "type-check": "tsc -p tsconfig.app.json --noEmit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

### `tsconfig.json` (Base)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

### `tsconfig.app.json` (Application Code)
```json
{
  "extends": "./tsconfig.json",
  "include": ["src"],
  "exclude": ["src/**/*.spec.ts"]
}
```

### `tsconfig.node.json` (Config Files)
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "bundler"
  },
  "include": ["vite.config.ts"]
}
```

### `vite.config.ts`
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },

  server: {
    port: 3000,
    open: true,
  },
})
```

---

## Common Scenarios and Solutions

### Scenario 1: "Type errors but code still runs in dev"

**Why**: Vite doesn't wait for type checking during development.

**Solution**: Run type checking separately or before build:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build"  // Type check before build
  }
}
```

Or use a plugin like `vite-plugin-checker`:
```typescript
import checker from 'vite-plugin-checker'

export default defineConfig({
  plugins: [
    react(),
    checker({ typescript: true })  // Shows type errors in browser overlay
  ]
})
```

### Scenario 2: "Cannot use import statement outside a module"

**Cause**: Missing `"type": "module"` in `package.json`

**Solution**:
```json
{
  "type": "module"
}
```

Or rename file to `.mjs` extension.

### Scenario 3: "Cannot find module '@/components/Button'"

**Cause**: Path alias configured in `vite.config.ts` but not in `tsconfig.json`

**Solution**: Add to both configs:

`vite.config.ts`:
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src')
  }
}
```

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Scenario 4: "Module not found" for CSS/image imports

**Cause**: TypeScript doesn't know about asset imports

**Solution**: Create `vite-env.d.ts`:
```typescript
/// <reference types="vite/client" />

// For CSS modules
declare module '*.module.css' {
  const classes: { [key: string]: string }
  export default classes
}

// For images
declare module '*.png' {
  const src: string
  export default src
}
```

Include it in `tsconfig.app.json`:
```json
{
  "include": ["src", "vite-env.d.ts"]
}
```

---

## Summary

### Quick Reference

| Aspect | `tsconfig.json` | `vite.config.ts` | `package.json` |
|--------|----------------|------------------|----------------|
| **Purpose** | Type checking | Building & bundling | Module system & metadata |
| **Used by** | `tsc`, IDEs | Vite dev server & build | Node.js runtime |
| **Transpilation** | ❌ Not used in Vite | ✅ Uses esbuild | N/A |
| **Type checking** | ✅ Yes | ❌ No | N/A |
| **Module format** | Defines what to emit | Uses ESM internally | Tells Node how to interpret .js files |

### Key Takeaways

1. **Vite uses esbuild for transpilation, not TypeScript** - That's why it's so fast
2. **TypeScript is only for type checking** - Set `noEmit: true` in Vite projects
3. **`package.json` "type": "module"`** - Use this for modern ESM-based projects
4. **Multiple tsconfig files** - Different configs for app code, Node code, and server code
5. **Type check before build** - `tsc --noEmit && vite build` prevents shipping type errors
6. **Path aliases need both configs** - Add to `vite.config.ts` AND `tsconfig.json`

### Workflow

```
Development:
  npm run dev → Vite (fast, no type check) + IDE type checking

Production:
  npm run build → tsc --noEmit (type check) + vite build (transpile & bundle)
```

This separation of concerns allows Vite to be lightning-fast while still maintaining type safety through TypeScript.
