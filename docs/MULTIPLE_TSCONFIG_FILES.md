# Multiple TypeScript Configuration Files in Monorepos

This document explains why we need multiple `tsconfig.json` files in a monorepo and how the `extends` mechanism works, particularly focusing on the `include` and `exclude` behavior.

## Table of Contents
- [The Problem: One Size Doesn't Fit All](#the-problem-one-size-doesnt-fit-all)
- [Solution: Layered Configuration Strategy](#solution-layered-configuration-strategy)
- [Real Examples from Our Monorepo](#real-examples-from-our-monorepo)
- [The Critical Question: Does include/exclude Extend?](#the-critical-question-does-includeexclude-extend)
- [Best Practices](#best-practices)

---

## The Problem: One Size Doesn't Fit All

In a monorepo, different packages have different needs:

| Package Type | Purpose | TypeScript Needs |
|-------------|---------|------------------|
| **@seeds/models** | Shared library/models | Needs to **emit** `.js` and `.d.ts` files |
| **@seeds/ui** | Svelte frontend app | Only needs **type checking**, Vite builds it |
| Config files | Build configuration | Need type checking but different includes |

**The Challenge:** You can't have one `tsconfig.json` that serves all these purposes simultaneously.

---

## Solution: Layered Configuration Strategy

### Layer 1: Root `tsconfig.json` - The Foundation

Located at: `/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "noEmit": true,              // Default: don't emit files
    "noImplicitAny": true,
    "allowJs": true,
    "strict": true,
    "allowSyntheticDefaultImports": true,
    "noUncheckedSideEffectImports": true
  },
  "include": [
    "packages/**/src/**/*.ts",
    "packages/**/src/**/*.js",
    "packages/**/src/**/*.svelte",
    "packages/**/tests/**/*.ts",
    "packages/**/tests/**/*.js",
    "packages/**/tests/**/*.svelte"
  ],
  "exclude": ["**/assets/**/*", "node_modules", "dist"]
}
```

**Purpose:**
- Defines **shared compiler options** for the entire monorepo
- Provides **IDE-level type checking** across all packages
- Used when running `tsc` at the root for validation
- Sets sensible defaults that packages can override

**Key Point:** This config has `noEmit: true` because it's meant for **type checking only**, not building.

---

### Layer 2: Package-Level `tsconfig.json` - Package Defaults

**Example: `packages/models/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.json"
}
```

**Purpose:**
- Inherits all settings from root
- Used by **IDEs** (VS Code) for type checking while coding
- Used by **linters and type checkers** when you run commands in this directory

**What it inherits:**
- ✅ All `compilerOptions` from root
- ✅ All `include` patterns from root
- ✅ All `exclude` patterns from root

**Example Use Case:**
```bash
cd packages/models
npx tsc --noEmit  # Uses this tsconfig.json
```

This would type-check the models package using inherited settings.

---

### Layer 3: Build-Specific `tsconfig.build.json` - Production Output

**Example: `packages/models/tsconfig.build.json`**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "noEmit": false,        // Override: DO emit files
    "outDir": "dist",       // Where to put compiled files
    "rootDir": "src",       // Where source files are
    "declaration": true     // Generate .d.ts files
  },
  "include": ["src"]        // Override: only include src/
}
```

**Purpose:**
- **Override** root settings for building production output
- Used by the **build script** in package.json
- Generates actual `.js` and `.d.ts` files for distribution

**Package.json build script:**
```json
{
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "dev": "tsc -p tsconfig.build.json --watch --preserveWatchOutput"
  }
}
```

**What happens during build:**
```bash
pnpm run build

# TypeScript uses tsconfig.build.json
# 1. Reads src/ directory (from include)
# 2. Compiles TypeScript to JavaScript (noEmit: false)
# 3. Outputs to dist/ directory (outDir)
# 4. Generates .d.ts type declaration files (declaration: true)
```

**Result:**
```
packages/models/
├── src/
│   ├── seed-packet.model.ts
│   └── index.ts
└── dist/                    ← Created by tsconfig.build.json
    ├── seed-packet.model.js
    ├── seed-packet.model.d.ts
    ├── index.js
    └── index.d.ts
```

---

## Real Examples from Our Monorepo

### Example 1: @seeds/models Package

**Structure:**
```
packages/models/
├── tsconfig.json            # IDE and type checking
├── tsconfig.build.json      # Building for distribution
├── package.json
├── src/
│   ├── seed-packet.model.ts
│   ├── seed-packet-collection.model.ts
│   └── index.ts
└── tests/
    └── seed-packet.test.ts
```

**`tsconfig.json`** - For development/IDE:
```json
{
  "extends": "../../tsconfig.json"
}
```

**What this means:**
- When you open `seed-packet.model.ts` in VS Code, TypeScript uses this config
- Inherits `noEmit: true`, so no files are generated
- Includes both `src/**/*.ts` AND `tests/**/*.ts` (from root)
- You get type checking for tests while developing

**`tsconfig.build.json`** - For building:
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true
  },
  "include": ["src"]
}
```

**What this means:**
- `pnpm run build` uses this config
- **Overrides** `noEmit: false` to actually generate files
- **Overrides** `include` to ONLY compile `src/` (not tests!)
- Outputs `.js` and `.d.ts` files to `dist/`

**Why separate configs?**
- ✅ Development: Type-check both source and tests
- ✅ Production: Only build source files
- ✅ Tests don't end up in the distributed package

---

### Example 2: @seeds/ui Package (More Complex)

**Structure:**
```
packages/ui/
├── tsconfig.json           # IDE for config files
├── tsconfig.app.json       # Svelte application
├── tsconfig.node.json      # Node.js server
├── tsconfig.server.json    # Server-specific
├── package.json
├── src/
│   ├── App.svelte
│   └── server/
│       └── index.ts
├── vite.config.ts
├── svelte.config.js
└── tailwind.config.js
```

**Why so many tsconfig files?**

The UI package has **three different runtime environments**:

1. **Svelte Frontend** (runs in browser)
2. **Express Server** (runs in Node.js)
3. **Build Configuration Files** (runs in Node.js at build time)

**`tsconfig.json`** - For config files:
```json
{
  "extends": "../../tsconfig.json",
  "include": [
    "tailwind.config.js",
    "postcss.config.cjs",
    "vite.config.ts",
    "svelte.config.js",
    "eslint.config.mts"
  ]
}
```

**Purpose:** Type-check build configuration files only.

**`tsconfig.app.json`** - For Svelte app:
```json
{
  "extends": "@tsconfig/svelte/tsconfig.json",
  "compilerOptions": {
    "target": "ESNext",
    "composite": true,
    "module": "ESNext",
    "allowJs": true,
    "checkJs": true,
    "isolatedModules": true
  },
  "include": ["src/**/*.ts", "src/**/*.js", "src/**/*.svelte"],
  "exclude": ["**/assets/**/*"]
}
```

**Purpose:** Type-check Svelte components with Svelte-specific settings.

**Package.json check script:**
```json
{
  "scripts": {
    "check": "svelte-check --tsconfig ./tsconfig.app.json && tsc -p tsconfig.node.json"
  }
}
```

This runs:
1. `svelte-check` with `tsconfig.app.json` for Svelte files
2. `tsc` with `tsconfig.node.json` for Node.js server files

---

## The Critical Question: Does include/exclude Extend?

### Short Answer: **NO, they are REPLACED, not merged!**

This is one of the most important and often misunderstood aspects of TypeScript configuration.

### How `extends` Works

When a tsconfig extends another:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": { ... },
  "include": [ ... ],
  "exclude": [ ... ]
}
```

**Behavior:**

| Property | Behavior | Example |
|----------|----------|---------|
| `compilerOptions` | **Merged** (child overrides parent keys) | ✅ Parent has `noEmit: true`, child sets `noEmit: false` → result: `false` |
| `include` | **Replaced** (child completely replaces parent) | ❌ Parent has `["**/*.ts"]`, child has `["src"]` → result: `["src"]` only |
| `exclude` | **Replaced** (child completely replaces parent) | ❌ Parent has `["node_modules"]`, child has `["dist"]` → result: `["dist"]` only |

### Detailed Example

**Root tsconfig.json:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noEmit": true,
    "target": "ESNext"
  },
  "include": [
    "packages/**/src/**/*.ts",
    "packages/**/tests/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "**/assets/**/*"
  ]
}
```

**Child tsconfig.build.json:**
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "noEmit": false,      // Override one property
    "outDir": "dist"      // Add new property
  },
  "include": ["src"]      // REPLACE include completely
}
```

**Effective Configuration for tsconfig.build.json:**

```json
{
  "compilerOptions": {
    "strict": true,       // ✅ Inherited from parent
    "noEmit": false,      // ✅ Overridden by child
    "target": "ESNext",   // ✅ Inherited from parent
    "outDir": "dist"      // ✅ Added by child
  },
  "include": [
    "src"                 // ❌ Completely replaced! Parent's include is gone
  ],
  "exclude": [
    "node_modules",       // ✅ Still inherited because child didn't override
    "dist",
    "**/assets/**/*"
  ]
}
```

### Real-World Implications

**Scenario 1: Child doesn't specify include/exclude**

```json
// packages/models/tsconfig.json
{
  "extends": "../../tsconfig.json"
  // No include or exclude
}
```

**Result:** Inherits root's `include` and `exclude` patterns.

**Scenario 2: Child specifies include**

```json
// packages/models/tsconfig.build.json
{
  "extends": "../../tsconfig.json",
  "include": ["src"]
}
```

**Result:**
- ✅ Uses `["src"]` (child's include)
- ❌ Root's `include` is **completely ignored**
- ✅ Still inherits root's `exclude` (because not overridden)

**Scenario 3: Child specifies both include and exclude**

```json
// packages/ui/tsconfig.app.json
{
  "extends": "@tsconfig/svelte/tsconfig.json",
  "include": ["src/**/*.svelte"],
  "exclude": ["**/assets/**/*"]
}
```

**Result:**
- Uses child's `include` only
- Uses child's `exclude` only
- Parent's include/exclude are **both completely replaced**

### Common Pitfall

```json
// ❌ WRONG: Thinking this adds to parent's include
{
  "extends": "../../tsconfig.json",
  "include": ["src"]
  // Assumption: now includes both parent's patterns AND "src"
  // Reality: ONLY includes "src", parent's include is gone!
}
```

**If you want to add patterns, you must repeat parent patterns:**

```json
// ✅ CORRECT: Explicitly list all patterns you want
{
  "extends": "../../tsconfig.json",
  "include": [
    "packages/**/src/**/*.ts",    // From parent
    "packages/**/tests/**/*.ts",  // From parent
    "src"                         // Your addition
  ]
}
```

**But this defeats the purpose of extends!** That's why we use separate configs for different purposes instead.

---

## Configuration Inheritance Flowchart

```
┌─────────────────────────────────────────────────────────┐
│ Root tsconfig.json                                      │
│ - Shared compiler options                              │
│ - Default include/exclude for IDE                      │
└─────────────────┬───────────────────────────────────────┘
                  │
                  │ extends
                  ↓
    ┌─────────────────────────────┬─────────────────────────────┐
    │                             │                             │
    ↓                             ↓                             ↓
┌────────────────────┐  ┌──────────────────────┐  ┌─────────────────────┐
│ packages/models/   │  │ packages/ui/         │  │ packages/ui/        │
│ tsconfig.json      │  │ tsconfig.json        │  │ tsconfig.app.json   │
│                    │  │                      │  │                     │
│ Purpose: IDE       │  │ Purpose: Config      │  │ Purpose: Svelte app │
│ Inherits: ALL      │  │ Inherits: Compiler   │  │ Custom: Svelte      │
│                    │  │ Overrides: include   │  │ settings            │
└─────────┬──────────┘  └──────────────────────┘  └─────────────────────┘
          │
          │ extends
          ↓
┌──────────────────────┐
│ packages/models/     │
│ tsconfig.build.json  │
│                      │
│ Purpose: Build       │
│ Overrides:           │
│ - noEmit: false      │
│ - include: ["src"]   │
│ - outDir: "dist"     │
└──────────────────────┘
```

---

## Best Practices

### 1. Root Config: Shared Defaults Only

```json
{
  "compilerOptions": {
    // Only shared settings that apply to ALL packages
    "strict": true,
    "target": "ESNext",
    "noEmit": true  // Safe default for type checking
  }
}
```

**Don't include package-specific settings in root!**

### 2. Package Config: Light Extension

```json
{
  "extends": "../../tsconfig.json"
  // Keep it minimal, only override what's necessary
}
```

**Purpose:** IDE support and general type checking.

### 3. Build Config: Specific Overrides

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "outDir": "dist",
    "declaration": true
  },
  "include": ["src"]  // Only source files, not tests
}
```

**Purpose:** Production build output.

### 4. Naming Conventions

| File | Purpose | When Used |
|------|---------|-----------|
| `tsconfig.json` | Default/IDE config | Always loaded by IDE |
| `tsconfig.build.json` | Build output | `tsc -p tsconfig.build.json` |
| `tsconfig.app.json` | Application code | Specific tooling (svelte-check) |
| `tsconfig.node.json` | Node.js code | Server-side type checking |
| `tsconfig.test.json` | Test files | Test runner configuration |

### 5. Package.json Scripts Pattern

```json
{
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "type-check": "tsc --noEmit",  // Uses default tsconfig.json
    "test": "vitest run"            // Test runner has own config
  }
}
```

### 6. When to Create a New tsconfig

Create a new tsconfig when you have:

✅ **Different runtime environments**
- Example: Browser code vs Node.js server
- Solution: `tsconfig.app.json` and `tsconfig.node.json`

✅ **Different build outputs**
- Example: Development (with tests) vs production (without tests)
- Solution: `tsconfig.json` and `tsconfig.build.json`

✅ **Different tooling requirements**
- Example: Svelte-specific settings
- Solution: `tsconfig.app.json` with Svelte presets

❌ **Don't create when:**
- You just want to change one option temporarily (use CLI flags instead)
- Settings can be shared (use the common parent config)

---

## Quick Reference: Our Monorepo Structure

```
ts-monorepos-v2/
├── tsconfig.json                    # Root: Shared settings for all
│
├── packages/
│   ├── models/
│   │   ├── tsconfig.json           # IDE: Inherits root
│   │   ├── tsconfig.build.json     # Build: Emits .js + .d.ts
│   │   └── package.json
│   │       └── "build": "tsc -p tsconfig.build.json"
│   │
│   └── ui/
│       ├── tsconfig.json           # Config files only
│       ├── tsconfig.app.json       # Svelte app
│       ├── tsconfig.node.json      # Node.js server
│       └── package.json
│           └── "check": "svelte-check --tsconfig ./tsconfig.app.json"
```

---

## Summary

### Why Multiple tsconfig Files?

1. **Different Purposes:**
   - IDE type checking vs production builds
   - Development (with tests) vs distribution (without tests)

2. **Different Environments:**
   - Browser code vs Node.js code
   - Svelte components vs plain TypeScript

3. **Different Tools:**
   - TypeScript compiler vs bundlers (Vite)
   - Test runners vs build tools

### Key Takeaways

| Concept | Key Point |
|---------|-----------|
| **compilerOptions** | Merged (child overrides parent) ✅ |
| **include** | Replaced (child replaces parent) ❌ |
| **exclude** | Replaced (child replaces parent) ❌ |
| **Root config** | Shared defaults, IDE support |
| **Package config** | Light extension for development |
| **Build config** | Specific overrides for production |

### The Golden Rule

> Each tsconfig.json file should serve **one clear purpose**. If you find yourself fighting with configurations or getting unexpected behavior, you probably need a separate config file for that specific use case.

---

## Additional Resources

- [TypeScript Handbook - tsconfig.json](https://www.typescriptlang.org/tsconfig)
- [TypeScript Handbook - Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [TypeScript Configuration Inheritance](https://www.typescriptlang.org/tsconfig#extends)
