# TypeScript Compiler Options Explained

This document provides a comprehensive explanation of all compiler options used in our monorepo's `tsconfig.json`, with special focus on how they apply to React and Node.js applications.

## Table of Contents
- [Understanding Development vs. Production](#understanding-development-vs-production)
- [The Big Three: Target, Module, and Module Resolution](#the-big-three-target-module-and-module-resolution)
- [Build Options](#build-options)
- [Type Checking Options](#type-checking-options)
- [Interop and Compatibility Options](#interop-and-compatibility-options)

---

## Understanding Development vs. Production

Before diving into specific compiler options, it's crucial to understand **when** and **where** these settings apply:

### Development Time (Your Editor & Type Checking)

**What happens:**
- TypeScript analyzes your code in VSCode/IDE
- `tsc --noEmit` or `tsc --build` runs type checking
- You see red squiggly lines for errors
- You get autocomplete and IntelliSense

**Which options apply:**
- All type-checking options (`strict`, `noImplicitAny`, etc.)
- Module resolution options (`moduleResolution`)
- Import validation and syntax checking

**Example:**
```typescript
// Development time - TypeScript catches this error
const user: User = { name: 123 }; // ❌ Error: Type 'number' is not assignable to type 'string'

// Your code never runs - this is just in your editor
```

### Build Time (Compilation/Bundling)

**What happens:**
- Your build tool (Vite, Webpack, esbuild) transforms code
- TypeScript may or may not be involved (depends on `noEmit`)
- Source code → production bundle

**Which options apply (if TypeScript compiles):**
- `target` - which JavaScript features to transform
- `module` - which module system to use
- `noEmit` - whether TypeScript produces output

**Example with our setup (`noEmit: true`):**
```bash
# TypeScript only checks types
npm run tsc --noEmit  # ✅ Type checking only, no output files

# Vite actually builds your code
npm run build         # Vite transforms and bundles everything
```

**Example if we used TypeScript to compile (`noEmit: false`):**
```typescript
// Your TypeScript source
const user = data?.profile?.name ?? 'Guest';

// After tsc with target: "ESNext"
const user = data?.profile?.name ?? 'Guest';  // No transformation

// After tsc with target: "ES5"
var user = (data && data.profile && data.profile.name) || 'Guest';  // Transformed!
```

### Production/Runtime (What Actually Runs)

**What happens:**
- Your built JavaScript code runs in browsers or Node.js
- No TypeScript involved at all - types are gone
- Only JavaScript syntax matters

**Which options matter:**
- **None directly!** TypeScript is completely removed
- What matters: Did your build tool produce compatible JavaScript?

**Example:**
```typescript
// Source code (development)
interface User {
  name: string;
}
const user: User = { name: 'Alice' };

// Production bundle (runtime)
const user = { name: 'Alice' };  // No types, no interface, pure JS
```

### The Complete Flow Visualization

```
┌─────────────────────────────────────────────────────────────┐
│ DEVELOPMENT TIME (Your Editor)                              │
│                                                              │
│ You write:                                                   │
│   const user: User = data?.name ?? 'Guest';                 │
│                                                              │
│ TypeScript checks:                                           │
│   - Is User type defined? ✓                                 │
│   - Is data?.name valid syntax? ✓ (target: ESNext)          │
│   - Do imports resolve? ✓ (moduleResolution: NodeNext)      │
│                                                              │
│ Options used: strict, noImplicitAny, moduleResolution       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ BUILD TIME (Compilation)                                     │
│                                                              │
│ With noEmit: true (our setup):                              │
│   → TypeScript doesn't produce files                        │
│   → Vite/Webpack compiles with their own rules              │
│                                                              │
│ Vite transforms:                                             │
│   - Bundles modules together                                │
│   - Transpiles for browser support (based on browserslist)  │
│   - Removes all TypeScript types                            │
│   - Tree-shakes unused code                                 │
│                                                              │
│ Options used by TS: target, module (if not noEmit)          │
│ Options used by Vite: browserslist, vite.config.ts          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PRODUCTION/RUNTIME (Browser or Node.js)                     │
│                                                              │
│ What actually runs:                                          │
│   const user = data?.name ?? 'Guest';                       │
│                                                              │
│ No TypeScript at all! Just JavaScript.                      │
│ Browser must support the syntax (or it was transpiled).     │
│                                                              │
│ Options used: NONE (TypeScript is gone)                     │
└─────────────────────────────────────────────────────────────┘
```

### Key Insight: React vs. Node.js

**React Applications:**
- **Development:** TypeScript checks types, validates imports
- **Build:** Vite/Webpack handles ALL transformation (TypeScript barely involved)
- **Production:** Bundled JavaScript runs in browsers
- **Result:** TypeScript's `target` and `module` don't affect final bundle much

**Node.js Applications:**
- **Development:** TypeScript checks types, validates imports
- **Build:** May use TypeScript to compile (if `noEmit: false`)
- **Production:** Node.js directly executes the JavaScript
- **Result:** TypeScript's `target` and `module` MUST match Node.js capabilities

**Example - Same TypeScript, Different Outputs:**

```typescript
// Your source code (identical for both React and Node.js)
export const greet = (name?: string) => {
  return `Hello ${name ?? 'Guest'}!`;
};
```

**React Build Process:**
```
Source (TypeScript)
  → TypeScript checks types only (noEmit: true)
  → Vite compiles & bundles
  → Final bundle.js (includes this + React + all dependencies)
  → Browser downloads and runs bundle.js
```

**Node.js Build Process:**
```
Source (TypeScript)
  → TypeScript compiles to JavaScript (noEmit: false)
  → Output: greet.js in dist/
  → Node.js executes: node dist/greet.js
```

---

## The Big Three: Target, Module, and Module Resolution

These three options work together to define how TypeScript transforms and interprets your code. Understanding their relationship is crucial for both React and Node.js development.

### 1. `"target": "ESNext"`

**What it does:** Specifies which JavaScript version TypeScript compiles your code down to.

**Our setting:** `ESNext` means "compile to the latest JavaScript features" - essentially, TypeScript won't downlevel transform modern JavaScript syntax.

**⏱️ When does this apply?**
- **Development:** Validates that you're using valid syntax for the target version
- **Build:** Transforms JavaScript features (only if TypeScript is doing the compilation)
- **Production:** No effect (build tool or runtime determines what actually runs)

#### Deep Dive with Examples

**React Application Context:**

```typescript
// Your TypeScript code
const Component = () => {
  const [state, setState] = useState<string>('hello');

  // ESNext feature: Optional chaining
  const value = user?.profile?.name;

  // ESNext feature: Nullish coalescing
  const displayName = value ?? 'Anonymous';

  // ESNext feature: Private class fields
  class MyService {
    #privateData = 'secret';
  }

  return <div>{displayName}</div>;
};
```

**With `target: "ESNext"`:**
- TypeScript **keeps** `?.` (optional chaining)
- TypeScript **keeps** `??` (nullish coalescing)
- TypeScript **keeps** `#privateData` (private fields)
- **Your bundler** (Vite, Webpack, etc.) handles browser compatibility
- Smaller compilation step, faster builds

**With `target: "ES5"` (old approach):**
```javascript
// TypeScript would transform to:
var _a, _b;
var value = (_b = (_a = user) === null || _a === void 0 ? void 0 : _a.profile) === null || _b === void 0 ? void 0 : _b.name;
var displayName = value !== null && value !== void 0 ? value : 'Anonymous';
```

**Why ESNext for React?**
- Modern build tools (Vite, esbuild) handle transpilation better than TypeScript
- Faster TypeScript compilation (no transformation needed)
- Better source maps and debugging
- Tree-shaking works better with modern syntax

**📍 Development vs. Production for React:**
```
DEVELOPMENT (Writing Code):
  ✓ TypeScript allows you to use ?. and ?? in your code
  ✓ IDE understands modern syntax
  ✓ Type checking works correctly

BUILD (npm run build with Vite):
  → TypeScript: Does NOT transform syntax (noEmit: true)
  → Vite/esbuild: Handles ALL transformation based on browserslist
  → Output: JavaScript optimized for target browsers (e.g., Chrome 90+)

PRODUCTION (Browser):
  → Runs the JavaScript that Vite produced
  → target: ESNext had zero effect on final bundle
  → Vite's configuration determined browser support
```

**Node.js Application Context:**

```typescript
// Node.js API server
import express from 'express';

class UserService {
  #cache = new Map();

  async getUser(id: string) {
    // ESNext: Top-level await (Node 14.8+)
    const cached = this.#cache.get(id);
    return cached ?? await fetchUser(id);
  }
}

// ESNext: Dynamic import
const config = await import('./config.js');
```

**With `target: "ESNext"`:**
- Uses native async/await (Node.js supports it natively since v7.6)
- Uses native private fields (Node.js 12+)
- No transformation overhead
- Direct execution with modern Node.js (16+)

**With `target: "ES2015"` (older Node.js):**
- Would transform private fields to WeakMaps
- Would transform some features for older Node versions
- Necessary if supporting Node.js <12

**📍 Development vs. Production for Node.js:**
```
DEVELOPMENT (Writing Code):
  ✓ TypeScript allows modern syntax
  ✓ Type checking works

BUILD (tsc with noEmit: false):
  → TypeScript transforms based on target
  → ESNext = no transformation, outputs modern JS
  → Output: dist/server.js with private fields, async/await, etc.

PRODUCTION (Node.js Runtime):
  → node dist/server.js
  → Node.js MUST support the JavaScript features
  → If target: ESNext, you need Node.js 16+ to run the output
  → If target: ES2015, older Node versions can run it
```

**Key Difference Between React and Node.js:**
- **React:** Target doesn't matter much because bundlers re-transpile anyway (TypeScript doesn't produce the final output)
- **Node.js:** Target MUST match your runtime version because Node.js runs TypeScript's output directly (if using Node 16+, ESNext is perfect)

---

### 2. `"module": "NodeNext"`

**What it does:** Specifies the module system TypeScript uses for module code generation.

**Our setting:** `NodeNext` means "use Node.js's native ESM (ECMAScript Modules) implementation."

**⏱️ When does this apply?**
- **Development:** Enforces ESM syntax rules (like requiring `.js` extensions in imports)
- **Build:** Determines how `import`/`export` statements are transformed
- **Production:** No direct effect (but affects what module format the runtime receives)

#### Deep Dive with Examples

**Understanding Module Systems:**

```typescript
// ESM (ECMAScript Modules) - Modern standard
import { useState } from 'react';
export const MyComponent = () => {};

// CommonJS - Node.js traditional format
const { useState } = require('react');
module.exports = { MyComponent };
```

**React Application Context:**

```typescript
// src/components/Button.tsx
import React from 'react';
import { ButtonProps } from './types.js'; // Note: .js extension!

export const Button: React.FC<ButtonProps> = ({ label }) => {
  return <button>{label}</button>;
};

// src/utils/api.ts
export async function fetchData() {
  // Dynamic imports for code splitting
  const { format } = await import('./formatters.js');
  return format(data);
}
```

**With `module: "NodeNext"`:**
```javascript
// Compiled output stays as ESM
import React from 'react';
import { ButtonProps } from './types.js';

export const Button = ({ label }) => {
  return React.createElement("button", null, label);
};
```

**With `module: "CommonJS"`:**
```javascript
// Would compile to:
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const types_1 = require("./types");

exports.Button = ({ label }) => {
  return React.createElement("button", null, label);
};
```

**Why NodeNext for React?**
- Modern bundlers (Vite, Webpack 5) prefer ESM
- Better tree-shaking (eliminating unused code)
- Native dynamic `import()` for code splitting
- Aligns with the JavaScript ecosystem's future

**📍 Development vs. Production for React:**
```
DEVELOPMENT:
  ✓ TypeScript enforces .js extensions: import { X } from './file.js'
  ✓ IDE validates ESM syntax rules
  ✓ Prevents mixing CommonJS and ESM incorrectly

BUILD (Vite):
  → TypeScript: Keeps imports as ESM (doesn't transform to require())
  → Vite: Bundles everything together, resolves all imports
  → Output: Single bundle.js (module format doesn't matter anymore)

PRODUCTION:
  → Browser loads bundle.js as a script
  → No import statements in final bundle (Vite resolved them all)
  → module: NodeNext didn't affect final output
```

**Node.js Application Context:**

```typescript
// package.json
{
  "type": "module", // Required for ESM in Node.js
  "name": "my-api"
}

// src/server.ts
import express from 'express';
import { router } from './routes/index.js'; // .js extension required!

const app = express();
app.use('/api', router);

// Conditional imports based on environment
if (process.env.NODE_ENV === 'development') {
  const { setupDevTools } = await import('./dev-tools.js');
  setupDevTools(app);
}
```

**With `module: "NodeNext"`:**
- Enforces `.js` extensions in imports (Node.js ESM requirement)
- Supports package.json `"exports"` field
- Allows mixing CommonJS and ESM (through proper package.json setup)
- Enables top-level await

**With `module: "CommonJS"`:**
```javascript
// Would require different syntax
const express = require('express');
const { router } = require('./routes/index'); // No .js needed

// No top-level await
async function startServer() {
  if (process.env.NODE_ENV === 'development') {
    const { setupDevTools } = require('./dev-tools');
    setupDevTools(app);
  }
}
```

**Critical NodeNext Requirement - File Extensions:**

```typescript
// ✅ CORRECT with NodeNext
import { User } from './models/user.js';
import type { Config } from './config.js';

// ❌ WRONG - TypeScript will error
import { User } from './models/user';
```

**📍 Development vs. Production for Node.js:**
```
DEVELOPMENT:
  ✓ TypeScript enforces .js extensions
  ✓ Validates ESM syntax (top-level await, etc.)
  ✓ Checks package.json "type": "module"

BUILD (tsc with noEmit: false):
  → TypeScript outputs ESM format
  → import/export statements stay as-is
  → Output: dist/server.js uses import/export

PRODUCTION (Node.js):
  → node dist/server.js
  → Node.js MUST be configured for ESM (package.json "type": "module")
  → Node.js natively handles import/export
  → module: NodeNext was critical - output must match Node's expectations
```

**Key Difference Between React and Node.js:**
- **React:** The bundler handles module resolution, so `NodeNext` is a modern choice but not strictly necessary (Vite rewrites everything anyway)
- **Node.js:** If using native ESM (package.json has `"type": "module"`), `NodeNext` is **essential** to match Node.js's exact behavior (Node.js runs TypeScript's output directly)

---

### 3. `"moduleResolution": "NodeNext"`

**What it does:** Determines how TypeScript locates and resolves module imports.

**Our setting:** `NodeNext` means "use Node.js's modern module resolution algorithm with full ESM support."

**⏱️ When does this apply?**
- **Development:** Validates import paths, checks package.json "exports" field, resolves types
- **Build:** No effect (doesn't transform code, just validates during development)
- **Production:** No effect (TypeScript is gone; runtime handles resolution)

**💡 Important:** This is ONLY for TypeScript's type checker. Your bundler (Vite) or runtime (Node.js) has its own resolution logic.

#### Deep Dive with Examples

**React Application Context:**

Consider this monorepo structure:
```
packages/
  ui/
    package.json
    src/
      components/
        Button.tsx
        index.ts
  models/
    package.json
    src/
      user.model.ts
      index.ts
```

```typescript
// packages/ui/src/components/MyForm.tsx

// Scenario 1: Relative import with NodeNext
import { Button } from './Button.js';
// NodeNext looks for: ./Button.tsx, ./Button.ts, ./Button.js

// Scenario 2: Package import with exports field
import { User } from '@my-app/models';
// NodeNext checks models/package.json "exports" field

// packages/models/package.json
{
  "name": "@my-app/models",
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./user": {
      "import": "./dist/user.model.js",
      "types": "./dist/user.model.d.ts"
    }
  }
}

// Now you can import specific paths:
import { User } from '@my-app/models/user'; // ✅ Works with NodeNext
```

**With `moduleResolution: "NodeNext"`:**
- Respects package.json `"exports"` field (subpath exports)
- Enforces `.js` extension in relative imports for ESM
- Understands conditional exports (`import` vs `require`)
- Resolves node_modules packages using modern algorithm

**With `moduleResolution: "Node"` (classic):**
- Ignores `"exports"` field
- Allows extensionless imports
- Only checks `"main"` or `"module"` in package.json
- May resolve incorrectly for dual-mode packages

**Example of exports field resolution:**

```typescript
// packages/models/package.json
{
  "exports": {
    "./internal/*": null  // Block internal imports
  }
}

// In your React component
import { User } from '@my-app/models'; // ✅ Works
import { Helper } from '@my-app/models/internal/helper'; // ❌ TypeScript error!
```

**Why NodeNext for React?**
- Properly resolves monorepo workspace packages
- Future-proof as libraries adopt `"exports"` field
- Prevents importing private/internal modules
- Better IDE autocomplete for package subpaths

**📍 Development vs. Production for React:**
```
DEVELOPMENT:
  ✓ TypeScript checks: import { User } from '@my-app/models'
  ✓ Looks up models/package.json "exports" field
  ✓ Finds type definitions: dist/index.d.ts
  ✓ Shows autocomplete and errors in IDE

BUILD (Vite):
  → TypeScript: Just validates imports (noEmit: true)
  → Vite resolver: Uses its OWN resolution logic
  → Vite doesn't care about TypeScript's moduleResolution
  → Vite follows its own rules (vite.config.ts, package.json)

PRODUCTION:
  → Bundle has no imports (everything is inlined)
  → moduleResolution had zero effect on output
  → Only mattered for development-time type checking
```

**Node.js Application Context:**

```typescript
// Your API server structure
src/
  services/
    user.service.ts
  utils/
    logger.ts
  index.ts

// src/services/user.service.ts
import { logger } from '../utils/logger.js'; // Must use .js with NodeNext
import { PrismaClient } from '@prisma/client';

// Node.js built-in modules
import { readFile } from 'node:fs/promises'; // 'node:' protocol preferred with NodeNext
import { join } from 'node:path';

class UserService {
  async getUser(id: string) {
    // NodeNext understands this is a built-in module
    const configPath = join(process.cwd(), 'config.json');
    const config = await readFile(configPath, 'utf-8');
    return JSON.parse(config);
  }
}
```

**With `moduleResolution: "NodeNext"`:**
- Enforces `.js` extensions for relative imports
- Understands `node:` protocol for built-ins
- Correctly resolves conditional package exports:

```typescript
// A package's package.json
{
  "exports": {
    ".": {
      "node": "./node-specific.js",    // Used in Node.js
      "browser": "./browser-specific.js" // Used in browsers
    }
  }
}

// With NodeNext, TypeScript knows you're in Node.js context
import { api } from 'some-package'; // Resolves to node-specific.js
```

**Complex Real-World Example - Monorepo Package Resolution:**

```typescript
// packages/api/src/server.ts
import { validateUser } from '@my-app/models';
import { Button } from '@my-app/ui/components/Button.js';

// tsconfig.json in packages/api/
{
  "compilerOptions": {
    "moduleResolution": "NodeNext"
  },
  "references": [
    { "path": "../models" },
    { "path": "../ui" }
  ]
}

// With NodeNext:
// 1. Checks @my-app/models/package.json "exports"
// 2. Follows TypeScript project references
// 3. Resolves types correctly across packages
// 4. Validates that .js extensions match actual files
```

**📍 Development vs. Production for Node.js:**
```
DEVELOPMENT:
  ✓ TypeScript validates: import { logger } from '../utils/logger.js'
  ✓ Checks .js extension exists (as .ts file)
  ✓ Validates package imports resolve correctly
  ✓ Enforces Node.js ESM rules

BUILD (tsc with noEmit: false):
  → TypeScript validates resolution during compilation
  → Outputs files with same import paths
  → dist/services/user.service.js still imports '../utils/logger.js'

PRODUCTION (Node.js):
  → Node.js uses its NATIVE resolution
  → Must find ../utils/logger.js successfully
  → If TypeScript's resolution doesn't match Node's = RUNTIME ERROR!
  → moduleResolution: NodeNext prevents this by matching Node exactly
```

**Key Difference Between React and Node.js:**
- **React:** Bundlers have their own resolution (Webpack's resolve, Vite's resolver), but NodeNext ensures TypeScript checking aligns with modern standards. Mismatches are unlikely to cause issues because Vite re-resolves everything.
- **Node.js:** NodeNext is **critical** - it must exactly match Node.js's runtime resolution to avoid runtime errors. If TypeScript says an import is valid but Node.js can't find it, your app crashes.

---

### How the Big Three Work Together

```typescript
// Example file: api-client.ts

// Step 1: moduleResolution finds the module
import { User } from '@my-app/models/user.js';
//       ↓
// NodeNext resolution:
// - Checks package.json "exports"
// - Validates .js extension exists
// - Locates @my-app/models/dist/user.d.ts

// Step 2: module determines import syntax
//       ↓
// NodeNext keeps it as ESM:
// import { User } from '@my-app/models/user.js';
// (not converted to require())

// Step 3: target determines JavaScript features
const user: User = {
  name: 'Alice',
  email: data?.email ?? 'unknown'
};
//       ↓
// ESNext keeps modern syntax:
// - Optional chaining (?.) stays
// - Nullish coalescing (??) stays
```

**Summary Table:**

| Aspect | React App | Node.js App |
|--------|-----------|-------------|
| **target: ESNext** | Bundler handles compatibility, TypeScript stays fast | Match Node.js version (ESNext for v16+) |
| **module: NodeNext** | Modern bundlers prefer ESM, better tree-shaking | Required for native ESM (`"type": "module"`) |
| **moduleResolution: NodeNext** | Handles monorepo packages & exports field | Must match Node.js runtime resolution exactly |

---

## Build Options

### `"noEmit": true`

**What it does:** Tells TypeScript not to generate JavaScript output files (.js, .d.ts, .js.map).

**⏱️ When does this apply?**
- **Development:** Affects whether TypeScript writes files during type checking
- **Build:** Determines if `tsc` creates output or just validates types
- **Production:** Indirect effect (changes what tool creates production code)

**Why we use it:**
- Our monorepo uses **build tools** for compilation (Vite for UI, esbuild for libraries)
- TypeScript is used **only for type checking**
- Avoids conflicts between TypeScript's output and your bundler's output

**Example Scenario:**

```typescript
// packages/ui/src/App.tsx
import { User } from '@my-app/models';

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  return <div>{user?.name}</div>;
};
```

**Without `noEmit: true`:**
```bash
npx tsc
# Creates:
# packages/ui/src/App.js
# packages/ui/src/App.d.ts
# This conflicts with Vite's build output!
```

**With `noEmit: true`:**
```bash
npx tsc
# Only checks for type errors, produces no files
# Vite handles actual compilation

npx vite build
# Creates optimized bundle in dist/
```

**📍 Development vs. Production:**
```
WITH noEmit: true (our setup):

DEVELOPMENT:
  → Run: npm run tsc --noEmit
  → TypeScript checks types only
  → No .js files created

BUILD:
  → Run: npm run build (runs Vite)
  → Vite handles ALL compilation
  → Output: dist/bundle.js (from Vite, not TypeScript)

PRODUCTION:
  → Runs Vite's output
  → TypeScript never created any production files

────────────────────────────────────────────────

WITH noEmit: false (alternative approach):

DEVELOPMENT:
  → Run: npm run tsc
  → TypeScript checks types AND creates .js files
  → Output: dist/ folder with JavaScript

BUILD:
  → Same as development (tsc is the build tool)
  → May add additional bundling step

PRODUCTION:
  → Runs TypeScript's output directly
  → Example: node dist/server.js
```

**When to use:**
- ✅ `noEmit: true` - Projects using bundlers (Vite, Webpack, esbuild)
- ✅ `noEmit: true` - Monorepos where different tools build different packages
- ✅ `noEmit: true` - When you want type checking separate from building
- ✅ `noEmit: false` - Simple Node.js scripts where `tsc` is your only build tool
- ✅ `noEmit: false` - Libraries that need to publish .js and .d.ts files to npm

---

## Type Checking Options

### `"noImplicitAny": true`

**What it does:** Forces you to explicitly type variables instead of letting TypeScript infer `any`.

**⏱️ When does this apply?**
- **Development:** Shows errors in your editor when types are missing
- **Build:** Prevents compilation if types are missing (fails type check)
- **Production:** No effect (types are removed; this only affects development)

**Example:**

```typescript
// ❌ Error with noImplicitAny: true
function processData(data) {
  // Error: Parameter 'data' implicitly has an 'any' type
  return data.map(item => item.value);
}

// ✅ Correct
function processData(data: Array<{ value: number }>) {
  return data.map(item => item.value);
}

// React example
// ❌ Error
const Button = ({ onClick }) => {
  // Error: Parameter 'onClick' implicitly has an 'any' type
  return <button onClick={onClick}>Click</button>;
};

// ✅ Correct
const Button = ({ onClick }: { onClick: () => void }) => {
  return <button onClick={onClick}>Click</button>;
};
```

**Why it's important:**
- Catches bugs at compile time
- Improves IDE autocomplete
- Makes code self-documenting
- Prevents runtime type errors

---

### `"strict": true`

**What it does:** Enables all strict type-checking options (including `noImplicitAny` and many more).

**⏱️ When does this apply?**
- **Development:** Shows comprehensive type errors in your editor
- **Build:** Prevents compilation if strict type rules are violated
- **Production:** No effect (only affects type checking, not runtime code)

This is actually a **superset** that enables:
- `noImplicitAny`
- `strictNullChecks`
- `strictFunctionTypes`
- `strictBindCallApply`
- `strictPropertyInitialization`
- `noImplicitThis`
- `alwaysStrict`

**Note:** Since `strict: true` already enables `noImplicitAny`, having both is redundant but harmless.

**Example - strictNullChecks:**

```typescript
// With strict: true
interface User {
  name: string;
  email?: string; // Optional
}

function sendEmail(user: User) {
  // ❌ Error: Object is possibly 'undefined'
  console.log(user.email.toLowerCase());

  // ✅ Correct: Handle null/undefined
  console.log(user.email?.toLowerCase() ?? 'No email');

  // ✅ Also correct: Type guard
  if (user.email) {
    console.log(user.email.toLowerCase());
  }
}

// React example
const UserProfile = ({ user }: { user: User | null }) => {
  // ❌ Error: Object is possibly 'null'
  return <div>{user.name}</div>;

  // ✅ Correct
  if (!user) return null;
  return <div>{user.name}</div>;

  // ✅ Also correct
  return <div>{user?.name ?? 'Guest'}</div>;
};
```

**Why it's critical:**
- Prevents the most common runtime errors (null/undefined)
- Forces defensive programming
- Makes refactoring safer

---

### `"noUncheckedSideEffectImports": true`

**What it does:** Requires imported modules to have type declarations, preventing side-effect-only imports that might fail at runtime.

**Example:**

```typescript
// Scenario: Importing a package without types

// ❌ Error with noUncheckedSideEffectImports
import 'some-plugin-without-types';
// Error: Module has no exported members

// ✅ Solution 1: Add type declarations
// Create types/some-plugin-without-types.d.ts
declare module 'some-plugin-without-types' {
  export function initialize(): void;
}

// ✅ Solution 2: Explicit side-effect import
import 'some-plugin-without-types' assert { "resolution-mode": "import" };

// ✅ Solution 3: Install types
npm install --save-dev @types/some-plugin-without-types
```

**React Example:**

```typescript
// Common scenario: CSS imports
import './App.css'; // May error if no declaration

// Fix: Create global.d.ts
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

// Now this works
import styles from './App.module.css';
<div className={styles.container}>...</div>
```

**Why it's useful:**
- Catches missing dependencies early
- Ensures all imports have type safety
- Prevents runtime import failures

---

## Interop and Compatibility Options

### `"allowJs": true`

**What it does:** Allows importing `.js` files in TypeScript projects.

**Use cases:**

```typescript
// src/utils/legacy-helper.js (existing JavaScript file)
export function formatDate(date) {
  return date.toISOString();
}

// src/components/NewComponent.tsx (TypeScript)
import { formatDate } from '../utils/legacy-helper.js';
// ✅ Works with allowJs: true

const MyComponent = () => {
  const formatted = formatDate(new Date());
  return <div>{formatted}</div>;
};
```

**Migration scenario:**

```
Phase 1: Legacy codebase (all .js)
  ↓ Add TypeScript
Phase 2: allowJs: true, migrate file by file
  ↓ Rename .js → .ts one at a time
Phase 3: Full TypeScript
```

**Why we use it:**
- Gradual migration from JavaScript to TypeScript
- Include configuration files (vite.config.js, svelte.config.js)
- Work with JavaScript libraries or plugins

---

### `"allowSyntheticDefaultImports": true`

**What it does:** Allows default imports from modules that don't have a default export, improving compatibility with CommonJS modules.

**⏱️ When does this apply?**
- **Development:** Allows cleaner import syntax in your TypeScript code
- **Build:** No effect on output (doesn't transform code)
- **Production:** No effect (bundler/runtime handles actual interop)

**💡 Important:** This is **type-checking only**. Your bundler or runtime must support the interop.

**The Problem:**

```typescript
// Some CommonJS module (e.g., old version of 'react')
// Actual export:
module.exports = {
  createElement: function() {},
  Component: class {}
};

// ❌ Without allowSyntheticDefaultImports
import React from 'react';
// Error: Module has no default export

// ✅ You'd have to do:
import * as React from 'react';

// ✅ With allowSyntheticDefaultImports
import React from 'react'; // Works!
```

**Real-World React Example:**

```typescript
// Many libraries export differently

// Without allowSyntheticDefaultImports:
import * as express from 'express'; // Verbose
import * as React from 'react';

// With allowSyntheticDefaultImports:
import express from 'express'; // Clean
import React from 'react';
```

**Why we use it:**
- Cleaner import syntax
- Better compatibility with libraries that use CommonJS
- Works seamlessly with bundlers that handle this automatically
- Standard in modern React/Node.js projects

**Note:** This is a **type-checking only** flag. Your bundler (Vite, Webpack) or Node.js handles the actual runtime interop.

---

## Summary: All Options at a Glance

| Option | Value | Purpose |
|--------|-------|---------|
| `target` | `ESNext` | Compile to modern JavaScript |
| `module` | `NodeNext` | Use Node.js ESM format |
| `moduleResolution` | `NodeNext` | Resolve modules like Node.js ESM |
| `noEmit` | `true` | Type-check only, let bundlers build |
| `noImplicitAny` | `true` | Require explicit types |
| `allowJs` | `true` | Allow .js files in project |
| `strict` | `true` | Enable all strict checks |
| `allowSyntheticDefaultImports` | `true` | Allow clean default imports |
| `noUncheckedSideEffectImports` | `true` | Require types for all imports |

---

## Best Practices

### For React Applications:
```json
{
  "compilerOptions": {
    "target": "ESNext",           // Let bundler handle compatibility
    "module": "ESNext",           // Or "NodeNext" for modern setup
    "moduleResolution": "Bundler", // Or "NodeNext"
    "jsx": "react-jsx",           // Modern React (no import React needed)
    "noEmit": true,               // Vite/Webpack handles building
    "strict": true,               // Catch all type errors
    "esModuleInterop": true,      // CommonJS compatibility
    "skipLibCheck": true          // Faster builds
  }
}
```

### For Node.js Applications:
```json
{
  "compilerOptions": {
    "target": "ESNext",           // Match your Node.js version
    "module": "NodeNext",         // For native ESM
    "moduleResolution": "NodeNext", // Must match module
    "outDir": "./dist",           // If emitting files
    "noEmit": false,              // Usually emit for Node.js
    "strict": true,               // Type safety
    "esModuleInterop": true       // Import CommonJS libraries
  }
}
```

### For Monorepos:
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "noEmit": true,               // Each package builds separately
    "strict": true,
    "composite": true,            // Enable project references
    "declaration": true,          // Generate .d.ts files
    "declarationMap": true        // Better IDE navigation
  }
}
```

---

## Quick Reference: Development vs. Production

### Options That Only Affect Development

These options **only** affect type checking in your editor and CI. They have **zero** impact on production code:

| Option | What It Does | Where It Applies |
|--------|--------------|------------------|
| `strict` | Enables strict type checking | Development/Build type checking only |
| `noImplicitAny` | Requires explicit types | Development/Build type checking only |
| `noUncheckedSideEffectImports` | Validates all imports have types | Development/Build type checking only |
| `moduleResolution` | How TypeScript finds modules | Development/Build type checking only |
| `allowSyntheticDefaultImports` | Allows `import X from 'x'` syntax | Development/Build type checking only |
| `allowJs` | Allows importing .js files | Development/Build type checking only |

**Key Insight:** All type-checking options disappear at runtime. They exist to catch bugs early.

### Options That Affect Build Output (When noEmit: false)

These options **transform your code** when TypeScript compiles it:

| Option | What It Does | When It Matters |
|--------|--------------|-----------------|
| `target` | Which JS features to transform | Only if `noEmit: false` (TypeScript compiles) |
| `module` | Import/export format in output | Only if `noEmit: false` (TypeScript compiles) |
| `noEmit` | Whether TypeScript creates files | Determines who builds (TypeScript vs. bundler) |

**Key Insight:** With `noEmit: true`, these don't affect production because Vite/Webpack handles building.

### Complete Flow Examples

#### React Application (with noEmit: true)

```typescript
// 1. DEVELOPMENT - You write this
import { User } from '@my-app/models';

const App = () => {
  const user: User = { name: 'Alice' };
  return <div>{user?.name ?? 'Guest'}</div>;
};
```

```bash
# 2. TYPE CHECKING - npm run tsc --noEmit
# TypeScript checks:
# ✓ Is User type valid? (strict, noImplicitAny)
# ✓ Does @my-app/models exist? (moduleResolution: NodeNext)
# ✓ Is ?. and ?? valid syntax? (target: ESNext)
# → No output files created (noEmit: true)

# 3. BUILD - npm run build (Vite)
# Vite:
# → Bundles all modules together
# → Removes all TypeScript types
# → Transpiles based on browserslist (not target)
# → Output: dist/bundle.js
```

```javascript
// 4. PRODUCTION - What the browser runs
// From dist/bundle.js:
const App = () => {
  const user = { name: 'Alice' };
  return createElement('div', null, user?.name ?? 'Guest');
};
// TypeScript compiler options: NO EFFECT on this output!
// Vite configuration determined everything.
```

#### Node.js Application (with noEmit: false)

```typescript
// 1. DEVELOPMENT - You write this
import { logger } from './utils/logger.js';

export class UserService {
  #cache = new Map();

  async getUser(id: string) {
    return this.#cache.get(id) ?? await fetchUser(id);
  }
}
```

```bash
# 2. TYPE CHECKING & COMPILATION - npm run tsc
# TypeScript checks:
# ✓ Types are valid (strict)
# ✓ logger.js resolves correctly (moduleResolution: NodeNext)
# ✓ Syntax is valid for target (target: ESNext)
# TypeScript compiles:
# → Keeps ESM imports (module: NodeNext)
# → Keeps modern syntax (target: ESNext)
# → Output: dist/server.js
```

```javascript
// 3. PRODUCTION - dist/server.js (what TypeScript created)
import { logger } from './utils/logger.js';

export class UserService {
  #cache = new Map();  // Not transformed (target: ESNext)

  async getUser(id) {
    return this.#cache.get(id) ?? await fetchUser(id);
  }
}

// TypeScript compiler options: DIRECTLY AFFECTED this output!
// target: ESNext kept private fields and ??
// module: NodeNext kept import/export
```

```bash
# 4. RUNTIME - node dist/server.js
# Node.js must support:
# → ESM imports (because module: NodeNext)
# → Private fields (because target: ESNext)
# → Nullish coalescing (because target: ESNext)
# If Node.js doesn't support these = CRASH!
```

### The Critical Distinction

**React with Vite (noEmit: true):**
```
TypeScript: Type checking only
       ↓
    (no output)
       ↓
Vite: Does ALL the work
       ↓
  Production bundle
```
Result: TypeScript's `target` and `module` **barely matter** for final output.

**Node.js with tsc (noEmit: false):**
```
TypeScript: Type checking + compilation
       ↓
  JavaScript output
       ↓
Node.js: Runs it directly
```
Result: TypeScript's `target` and `module` **completely determine** what Node.js runs.

---

## Additional Resources

- [TypeScript Compiler Options Reference](https://www.typescriptlang.org/tsconfig)
- [Node.js ESM Documentation](https://nodejs.org/api/esm.html)
- [Package.json "exports" field](https://nodejs.org/api/packages.html#exports)
- [Vite Configuration](https://vitejs.dev/config/)
- [Understanding TypeScript's noEmit](https://www.typescriptlang.org/tsconfig#noEmit)
