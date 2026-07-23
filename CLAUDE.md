# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev              # Vite dev server (port 1420)
npm run tauri dev        # Full Tauri dev mode (frontend + Rust backend)
npm run tauri build      # Production build (MSI/NSIS installer)

# Frontend only
npm run build            # tsc -b && vite build
npm run preview          # Vite preview server
npm run lint             # ESLint flat config
npm run format           # Prettier (with Tailwind plugin)

# Rust backend
cargo build              # Compile Tauri backend (debug)
cargo test               # Run all Rust unit tests
cargo test <test_name>   # Run specific Rust test
cargo test <module>::tests::<test_name> -- --exact  # Run exact Rust test

# Rust tests run from `src-tauri/` directory
```

## Architecture

**Tauri 2.0 desktop app** — React 19 frontend, Rust backend, Markdown file storage.

### Data Flow

```
React Component → Zustand Store → invoke("command_name") → Tauri Command → Storage Layer → Markdown File
                                                                                            ↓
AI API (fetch from frontend) ← result ← GreetingStore ← parseGreetingResult ← callAIAPI(response)
```

- **Tauri commands** bridge frontend and backend. The frontend calls `invoke()` from `@tauri-apps/api/core`, backend exposes `#[tauri::command]` functions registered in `lib.rs::run()`.
- **AI API calls** go directly from the frontend via `fetch()` to an OpenAI-compatible endpoint (e.g., Deepseek), NOT proxied through Rust. The `generateGreeting()` function in `src/lib/ai.ts` handles the full flow: build prompt → call API → parse JSON response.
- **Data storage** is YAML frontmatter in Markdown files, not SQLite. Data lives in `{app_data_dir}/{profiles|positions|applications}/` with files named `{id}_{title}.md`. Each model has a `Create*Input`/`Update*Input` pattern on both sides.

### Frontend Structure (`src/`)

| Path | Purpose |
|------|---------|
| `pages/` | Route-level components (Dashboard, PositionList, PositionDetail, Greeting, ApplicationList, ApplicationDetail, Profile, Settings) |
| `stores/` | Zustand stores — one per domain (position, application, greeting, profile, settings). Each store has `loading`, `error`, and CRUD methods. |
| `components/` | `ui/` (shadcn/ui primitives), `layout/` (AppShell, Sidebar, Header), `common/` (ErrorBoundary, ConfirmDialog, EmptyState, LoadingSpinner, SearchInput), `greeting/` (JDPasteInput, GenerationProgress, GreetingResult, DeepAnalysisCard), `position/` (PositionSelector) |
| `lib/` | `ai.ts` (AI prompt builder + API caller), `constants.ts` (nav items, categories, statuses), `utils.ts` (cn helper), `date.ts` (date-fns wrappers, zh-CN locale), `validators.ts`, `id.ts` |
| `types/` | TypeScript interfaces matching Rust models (Position, Application, Profile, Settings, Greeting, ApiResponse) |

### Rust Backend (`src-tauri/src/`)

| Path | Purpose |
|------|---------|
| `lib.rs` | Tauri app setup, plugin registration, command handler registration |
| `main.rs` | Entry point, calls `lib::run()` |
| `commands/` | `#[tauri::command]` functions — thin wrappers calling storage layer |
| `models/` | Rust structs (Position, Application, Profile, Settings, DashboardStats) with `serde::Serialize/Deserialize` |
| `storage/` | File I/O layer: `file_ops.rs` (read/write/list/delete), domain-specific storage (position, application, profile, settings) |
| `utils/` | `error.rs` (AppError enum with Chinese messages), `frontmatter.rs` (YAML frontmatter parse/serialize), `id.rs` (UUID generation) |

### Key Patterns

- **All Tauri commands return `Result<T, String>`** — the `AppError` enum implements `From<AppError> for String` so `.map_err(|e| e.to_string())` converts errors to user-facing Chinese messages.
- **Zustand stores follow a uniform pattern**: `loading`, `error`, CRUD methods that call `invoke()`, with optimistic local state updates.
- **Pages handle all states**: loading (skeleton/spinner), empty (welcome guide), error (retry card), and normal data rendering.
- **Frontend uses `@/` path alias** mapped to `./src/` in both Vite and TypeScript config.
- **Tailwind CSS v4** with `@tailwindcss/vite` plugin (not PostCSS config). Custom theme tokens use `@theme` directive in `index.css`.
- **Markdown file format**: YAML frontmatter delimited by `---` contains structured fields (id, dates, category, etc.), body contains Markdown content (analysis, notes, JD text, greeting text).

### Testing

- Rust tests use `#[cfg(test)]` modules with `#[test]` functions, placed in the same file as the implementation.
- Tests create test data, assert, and clean up (`delete_position`, `delete_application`).
- `file_ops.rs` tests use temp directories.
- `frontmatter.rs` tests roundtrip parse/serialize.
- `error.rs` tests error display and type conversions.