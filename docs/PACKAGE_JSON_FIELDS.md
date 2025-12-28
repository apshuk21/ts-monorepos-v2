# Package.json Build Scripts and Entry Points Explained

This document explains the build and development scripts in our monorepo packages, and the critical `types` and `module` fields that tell other packages how to import and use your library.

## Table of Contents
- [Build vs Dev Scripts](#build-vs-dev-scripts)
- [Package Entry Points: types and module](#package-entry-points-types-and-module)
- [How Other Packages Import Your Library](#how-other-packages-import-your-library)
- [Complete Example Flow](#complete-example-flow)
- [Best Practices](#best-practices)

---

## Build vs Dev Scripts

### Our Scripts in `packages/models/package.json`

```json
{
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "dev": "tsc -p tsconfig.build.json --watch --preserveWatchOutput"
  }
}
```

At first glance, they look similar, but they serve very different purposes.

---

### The `build` Script - One-Time Compilation

```bash
pnpm run build
```

**What it does:**
```bash
tsc -p tsconfig.build.json
```

**Breakdown:**
- `tsc` - TypeScript compiler
- `-p tsconfig.build.json` - Use this specific config file (instead of default `tsconfig.json`)

**Behavior:**
1. Reads all TypeScript files from `src/` directory
2. Compiles them to JavaScript (`.js` files)
3. Generates TypeScript declaration files (`.d.ts` files)
4. Outputs everything to `dist/` directory
5. **Exits immediately** when done

**Output:**
```
packages/models/
├── src/
│   ├── index.ts
│   ├── seed-packet.model.ts
│   └── seed-packet-collection.model.ts
└── dist/                                    ← Created by build
    ├── index.js                             ← Compiled JavaScript
    ├── index.d.ts                           ← Type definitions
    ├── seed-packet.model.js
    ├── seed-packet.model.d.ts
    ├── seed-packet-collection.model.js
    └── seed-packet-collection.model.d.ts
```

**When to use:**
- ✅ Before publishing to npm
- ✅ In CI/CD pipelines
- ✅ Before deploying to production
- ✅ When you need a clean, one-time build

---

### The `dev` Script - Watch Mode for Development

```bash
pnpm run dev
```

**What it does:**
```bash
tsc -p tsconfig.build.json --watch --preserveWatchOutput
```

**Breakdown:**
- `tsc -p tsconfig.build.json` - Same as build
- `--watch` - Watch mode (stays running)
- `--preserveWatchOutput` - Keep previous output visible

**Behavior:**
1. Does everything `build` does initially
2. **Keeps running** and watches for file changes
3. When you save a `.ts` file, automatically recompiles ONLY changed files
4. Updates output in `dist/` directory
5. Preserves console output between rebuilds (easier to read)

**Visual Comparison:**

**Without `--watch` (build script):**
```bash
$ pnpm run build
[HH:MM:SS] Starting compilation...
[HH:MM:SS] Compilation complete. Watching for file changes...
# Process exits immediately after compilation
```

**With `--watch` (dev script):**
```bash
$ pnpm run dev
[HH:MM:SS] Starting compilation in watch mode...
[HH:MM:SS] Found 0 errors. Watching for file changes.

# Process keeps running
# You edit src/seed-packet.model.ts and save

[HH:MM:SS] File change detected. Starting incremental compilation...
[HH:MM:SS] Found 0 errors. Watching for file changes.

# Still running, waiting for more changes...
```

---

### The `--preserveWatchOutput` Flag Deep Dive

**Without `--preserveWatchOutput`:**

Every time a file changes, TypeScript **clears the terminal** and shows fresh output:

```bash
$ tsc --watch

# You save a file... terminal clears

[HH:MM:SS] File change detected. Starting incremental compilation...
[HH:MM:SS] Found 0 errors. Watching for file changes.

# You save again... terminal clears again

[HH:MM:SS] File change detected. Starting incremental compilation...
[HH:MM:SS] Found 0 errors. Watching for file changes.
```

**Problem:** You lose your previous build history and any errors that appeared earlier.

**With `--preserveWatchOutput`:**

Output accumulates, so you can see the history:

```bash
$ tsc --watch --preserveWatchOutput

[10:00:00] Starting compilation in watch mode...
[10:00:02] Found 0 errors. Watching for file changes.

# You save a file...

[10:05:30] File change detected. Starting incremental compilation...
[10:05:31] Found 0 errors. Watching for file changes.

# You introduce an error and save...

[10:07:15] File change detected. Starting incremental compilation...
[10:07:16] src/seed-packet.model.ts:42:5 - error TS2322: Type 'string' is not assignable to type 'number'.

42     price: "invalid"
       ~~~~~

[10:07:16] Found 1 error. Watching for file changes.

# You fix it...

[10:08:00] File change detected. Starting incremental compilation...
[10:08:01] Found 0 errors. Watching for file changes.

# All history preserved! You can scroll up to see what happened.
```

**Why it's useful:**
- ✅ See build history and errors over time
- ✅ Easier debugging (scroll back to see when errors appeared)
- ✅ Better for development workflows
- ✅ Works well with `concurrently` when running multiple watchers

---

### When to Use Each Script

| Scenario | Script | Why |
|----------|--------|-----|
| **Developing models package** | `dev` | Auto-recompiles on save, see changes immediately |
| **Another package imports @seeds/models** | `dev` (in models) | Keep models rebuilding while you work on UI |
| **Preparing for production** | `build` | Clean, one-time compilation |
| **CI/CD pipeline** | `build` | Fast, exits when done |
| **Publishing to npm** | `build` | Ensure fresh build |
| **First time setup** | `build` | Create initial dist/ folder |

---

### Real Development Workflow Example

**Scenario:** You're working on the UI package which imports the models package.

**Terminal 1 - Models package in watch mode:**
```bash
cd packages/models
pnpm run dev

[10:00:00] Starting compilation in watch mode...
[10:00:02] Found 0 errors. Watching for file changes.
# Stays running...
```

**Terminal 2 - UI package development:**
```bash
cd packages/ui
pnpm run dev

# Vite starts, serves your UI
```

**What happens:**
1. You edit `packages/models/src/seed-packet.model.ts`
2. Save the file
3. **Automatically** TypeScript recompiles → updates `dist/seed-packet.model.js`
4. Your UI's Vite dev server **detects** the change in `node_modules/@seeds/models`
5. **Hot reloads** your UI with the new model

**Without watch mode:**
You'd have to manually run `pnpm run build` in models every time you change something!

---

## Package Entry Points: types and module

### What Are Entry Points?

When another package imports your library:

```typescript
// In packages/ui/src/App.svelte
import { SeedPacket } from '@seeds/models';
```

Node.js and TypeScript need to know:
1. **Which JavaScript file** to load (runtime)
2. **Which TypeScript definition file** to use for type checking (development)

That's what `types` and `module` fields tell them.

---

### The Fields in `packages/models/package.json`

```json
{
  "name": "@seeds/models",
  "version": "0.0.2",
  "type": "module",
  "types": "dist/index.d.ts",
  "module": "dist/index.js"
}
```

Let's break down each field:

---

### `"type": "module"`

**What it does:** Tells Node.js this package uses **ECMAScript Modules (ESM)** instead of CommonJS.

**Impact:**
- All `.js` files are treated as ESM (can use `import`/`export`)
- Enables `import` syntax in Node.js
- Required when using `"module": "NodeNext"` in tsconfig.json

**Without this field:**
```javascript
// Would be interpreted as CommonJS
const { SeedPacket } = require('@seeds/models');
module.exports = { ... };
```

**With `"type": "module"`:**
```javascript
// Interpreted as ESM
import { SeedPacket } from '@seeds/models';
export { ... };
```

---

### `"types": "dist/index.d.ts"`

**What it does:** Tells TypeScript where to find **type definitions** for your package.

**When TypeScript encounters:**
```typescript
import { SeedPacket } from '@seeds/models';
```

**It looks for:**
1. Checks `package.json` for `"types"` field
2. Finds `"types": "dist/index.d.ts"`
3. Loads `packages/models/dist/index.d.ts`
4. **Now TypeScript knows** the shape of `SeedPacket`

**The type definition file (`dist/index.d.ts`):**
```typescript
// Generated by TypeScript from src/index.ts
export * from './seed-packet-collection.model.js';
export * from './seed-packet.model.js';
```

**Which points to:**
```typescript
// dist/seed-packet.model.d.ts (simplified)
export interface SeedPacket {
    id: string;
    name: string;
    price: number;
    quantity: number;
    // ... more fields
}
```

**Why it matters:**
- ✅ **IDE autocomplete** - VS Code knows what methods/properties exist
- ✅ **Type checking** - Catches errors at compile time
- ✅ **IntelliSense** - Shows documentation and parameter hints
- ✅ **Refactoring** - Safe renames across packages

**Without the `types` field:**
```typescript
import { SeedPacket } from '@seeds/models';
// ❌ TypeScript error: Could not find a declaration file for module '@seeds/models'
```

---

### `"module": "dist/index.js"`

**What it does:** Tells bundlers (Vite, Webpack, Rollup) and Node.js where to find the **JavaScript entry point** for ESM imports.

**When someone imports your package:**
```typescript
import { SeedPacket } from '@seeds/models';
```

**At runtime (not type checking), Node.js/bundler:**
1. Checks `package.json` for `"module"` field (for ESM)
2. Finds `"module": "dist/index.js"`
3. Loads `packages/models/dist/index.js`
4. **Executes** the JavaScript code

**The entry file (`dist/index.js`):**
```javascript
// Generated by TypeScript from src/index.ts
export * from './seed-packet-collection.model.js';
export * from './seed-packet.model.js';
```

**Which contains the actual runtime code:**
```javascript
// dist/seed-packet.model.js (simplified)
export class SeedPacket {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.price = data.price;
        // ... actual implementation
    }
}
```

**Why it matters:**
- ✅ **Runtime execution** - The actual code that runs
- ✅ **Tree-shaking** - Bundlers can eliminate unused exports
- ✅ **Module resolution** - Node.js knows what file to load
- ✅ **ESM support** - Modern import/export syntax

---

### Alternative/Legacy Fields

For historical context, here are related fields you might see:

| Field | Purpose | Module System |
|-------|---------|---------------|
| `"main"` | Entry point for CommonJS (`require()`) | CommonJS |
| `"module"` | Entry point for ESM (`import`) | ESM |
| `"types"` or `"typings"` | TypeScript type definitions | N/A (types only) |
| `"exports"` | Modern, fine-grained control | Both (conditional) |

**Our package uses:**
- `"type": "module"` - Package is ESM
- `"module"` - ESM entry point
- `"types"` - TypeScript types

**We don't use `"main"` because** we're not supporting CommonJS (our target is modern Node.js and bundlers).

---

### Visual Flow: How Import Resolution Works

```
┌─────────────────────────────────────────────────────────────┐
│ packages/ui/src/App.svelte                                  │
│                                                             │
│ import { SeedPacket } from '@seeds/models';                │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────────┐
│ Resolution Process                                          │
│                                                             │
│ 1. Find package: node_modules/@seeds/models/               │
│ 2. Read: node_modules/@seeds/models/package.json           │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ↓
        ┌────────┴────────┐
        │                 │
        ↓                 ↓
┌───────────────┐  ┌──────────────┐
│ TypeScript    │  │ Runtime      │
│ (Type Check)  │  │ (Execution)  │
└───────┬───────┘  └──────┬───────┘
        │                 │
        ↓                 ↓
    "types":          "module":
 "dist/index.d.ts"  "dist/index.js"
        │                 │
        ↓                 ↓
┌───────────────┐  ┌──────────────┐
│ Loads types:  │  │ Loads code:  │
│               │  │              │
│ interface     │  │ export class │
│ SeedPacket {  │  │ SeedPacket { │
│   id: string  │  │   constructor│
│   name: string│  │   ...        │
│ }             │  │ }            │
└───────────────┘  └──────────────┘
        │                 │
        ↓                 ↓
┌────────────────────────────────┐
│ Result:                        │
│ - Type-safe development ✅     │
│ - Working runtime code ✅      │
└────────────────────────────────┘
```

---

## How Other Packages Import Your Library

### Example: UI Package Imports Models Package

**packages/ui/src/components/SeedList.svelte:**

```typescript
import { SeedPacket } from '@seeds/models';

const seeds: SeedPacket[] = [
  { id: '1', name: 'Tomato', price: 2.99, quantity: 50 }
];
```

**What happens behind the scenes:**

**Step 1: TypeScript Type Checking**
```
TypeScript sees: import { SeedPacket } from '@seeds/models'
         ↓
Looks in: packages/models/package.json
         ↓
Finds: "types": "dist/index.d.ts"
         ↓
Loads: packages/models/dist/index.d.ts
         ↓
Which exports from: dist/seed-packet.model.d.ts
         ↓
Result: TypeScript knows SeedPacket's type
         ✅ Autocomplete works
         ✅ Type errors caught
```

**Step 2: Build Time (Vite bundling)**
```
Vite sees: import { SeedPacket } from '@seeds/models'
         ↓
Looks in: packages/models/package.json
         ↓
Finds: "module": "dist/index.js"
         ↓
Loads: packages/models/dist/index.js
         ↓
Which exports from: dist/seed-packet.model.js
         ↓
Result: JavaScript code bundled into UI app
         ✅ Runtime code included
         ✅ Tree-shaking applied (only used exports)
```

**Step 3: Runtime (Browser execution)**
```
Browser executes bundled code
         ↓
Your UI has working SeedPacket class/functions
         ✅ App works!
```

---

### What Happens If Fields Are Missing?

**Missing `"types"` field:**
```typescript
import { SeedPacket } from '@seeds/models';
// ❌ TypeScript Error: Could not find a declaration file for module '@seeds/models'.
// Try `npm i --save-dev @types/seeds__models` if it exists or add a new declaration (.d.ts) file

// Your IDE won't have autocomplete
const seed: SeedPacket = { ... };  // ❌ 'SeedPacket' refers to a value, but is being used as a type
```

**Missing `"module"` field (with `"type": "module"`):**
```typescript
import { SeedPacket } from '@seeds/models';
// ❌ Runtime Error: Cannot find module '@seeds/models'
// Or bundler might fail to resolve the package
```

**Missing `"type": "module"` (when using ESM code):**
```javascript
// Node.js tries to load as CommonJS
// ❌ SyntaxError: Cannot use import statement outside a module
```

---

## Complete Example Flow

Let's trace a complete example from development to production.

### Step 1: Develop the Models Package

**Terminal:**
```bash
cd packages/models
pnpm run dev
```

**What runs:**
```bash
tsc -p tsconfig.build.json --watch --preserveWatchOutput
```

**Output:**
```
[10:00:00] Starting compilation in watch mode...
[10:00:02] Found 0 errors. Watching for file changes.
```

**File structure now:**
```
packages/models/
├── src/
│   ├── index.ts                          ← Your source
│   └── seed-packet.model.ts
├── dist/                                 ← Generated
│   ├── index.js                          ← JavaScript
│   ├── index.d.ts                        ← Types
│   ├── seed-packet.model.js
│   └── seed-packet.model.d.ts
└── package.json
    ├── "types": "dist/index.d.ts"        ← Points here
    └── "module": "dist/index.js"         ← Points here
```

---

### Step 2: Import in UI Package

**packages/ui/src/App.svelte:**

```typescript
<script lang="ts">
  import { SeedPacket } from '@seeds/models';

  let seeds: SeedPacket[] = [];

  // TypeScript knows the shape of SeedPacket ✅
  // IDE autocomplete works ✅
</script>
```

**How it resolves:**

**TypeScript (while you code):**
```
@seeds/models
    ↓
packages/models/package.json → "types": "dist/index.d.ts"
    ↓
dist/index.d.ts → export * from './seed-packet.model.js'
    ↓
dist/seed-packet.model.d.ts → export interface SeedPacket { ... }
    ↓
✅ Types available in IDE
```

**Vite (when you run `pnpm run dev`):**
```
@seeds/models
    ↓
packages/models/package.json → "module": "dist/index.js"
    ↓
dist/index.js → export * from './seed-packet.model.js'
    ↓
dist/seed-packet.model.js → export class SeedPacket { ... }
    ↓
✅ Code bundled and runs in browser
```

---

### Step 3: Make Changes to Models

**You edit:** `packages/models/src/seed-packet.model.ts`

**Add a new field:**
```typescript
export interface SeedPacket {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;  // ← New field
}
```

**Watch mode detects change:**
```
[10:05:30] File change detected. Starting incremental compilation...
[10:05:31] Found 0 errors. Watching for file changes.
```

**Updated files:**
- `dist/seed-packet.model.js` ← New JavaScript
- `dist/seed-packet.model.d.ts` ← New type definitions

**In your UI:**
- TypeScript immediately sees new `category` field ✅
- Vite hot-reloads with updated code ✅
- No manual rebuild needed ✅

---

### Step 4: Production Build

**When ready to deploy:**

```bash
# In models package
cd packages/models
pnpm run build  # One-time build

# In UI package
cd packages/ui
pnpm run build  # Vite production build
```

**Result:**
- Models: Clean `dist/` with optimized JS and types
- UI: Bundled, minified app with models included

---

## Best Practices

### 1. Package.json Entry Points

```json
{
  "name": "@your-org/package-name",
  "version": "1.0.0",
  "type": "module",                    // ✅ Use ESM
  "types": "./dist/index.d.ts",        // ✅ Types entry point
  "module": "./dist/index.js",         // ✅ ESM entry point
  "exports": {                         // ✅ Modern alternative (optional)
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  }
}
```

### 2. Build Scripts

```json
{
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "dev": "tsc -p tsconfig.build.json --watch --preserveWatchOutput",
    "clean": "rm -rf dist",
    "prebuild": "pnpm run clean"       // Clean before build
  }
}
```

### 3. Always Use .js Extensions in Source

**Even though you're writing TypeScript:**

```typescript
// ✅ CORRECT
export * from './seed-packet.model.js';

// ❌ WRONG
export * from './seed-packet.model';
```

**Why:** With `"module": "NodeNext"`, Node.js requires explicit file extensions for ESM.

### 4. Development Workflow

**For library packages:**
```bash
pnpm run dev  # Keep this running while developing
```

**For consuming packages:**
```bash
# Terminal 1: Library in watch mode
cd packages/models && pnpm run dev

# Terminal 2: App in dev mode
cd packages/ui && pnpm run dev
```

### 5. tsconfig.build.json Settings

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "noEmit": false,        // ✅ Must emit files
    "declaration": true,    // ✅ Must generate .d.ts
    "outDir": "dist",       // ✅ Output directory
    "rootDir": "src"        // ✅ Source directory
  },
  "include": ["src"]        // ✅ Only source, not tests
}
```

---

## Summary

### Build vs Dev Scripts

| Aspect | `build` | `dev` |
|--------|---------|-------|
| **Command** | `tsc -p tsconfig.build.json` | `tsc -p tsconfig.build.json --watch --preserveWatchOutput` |
| **Runs once** | ✅ Yes | ❌ No (keeps running) |
| **Watch mode** | ❌ No | ✅ Yes |
| **Auto-recompile** | ❌ No | ✅ Yes |
| **Preserve output** | N/A | ✅ Yes |
| **Use case** | Production, CI/CD | Development |
| **When to use** | Before deploy, publishing | While coding |

### Package.json Fields

| Field | Purpose | Used By | Points To |
|-------|---------|---------|-----------|
| `"type": "module"` | Declares ESM package | Node.js | N/A |
| `"types"` | Type definitions entry | TypeScript, IDEs | `dist/index.d.ts` |
| `"module"` | ESM JavaScript entry | Bundlers, Node.js | `dist/index.js` |

### The Complete Picture

```
Your TypeScript Source (src/)
           ↓
  Build/Dev Script (tsc)
           ↓
  Generated Output (dist/)
           ↓
Package.json Points Here
    ↓              ↓
"types"       "module"
    ↓              ↓
Type Checking  Runtime Code
    ↓              ↓
  IDE Support  App Works
```

---

## Additional Resources

- [Node.js ESM Documentation](https://nodejs.org/api/esm.html)
- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
- [Package.json Exports Field](https://nodejs.org/api/packages.html#exports)
- [TypeScript Declaration Files](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html)
