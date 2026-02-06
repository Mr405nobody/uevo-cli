# Repository Guidelines

## Project Structure & Module Organization
- `packages/cli`: CLI entrypoint, commands, and prompt processors.
- `packages/core`: core services, telemetry, routing, and shared logic.
- `packages/vscode-ide-companion`: VS Code companion integration.
- `integration-tests/`: end-to-end tests and helpers.
- `scripts/`: build, release, sandbox, and test tooling.
- `docs/`: user-facing documentation.
- `bundle/`: build output used by the published CLI.

## Build, Test, and Development Commands
- `npm install`: install workspace dependencies.
- `npm run build`: build all packages.
- `npm run build:all`: build packages and the sandbox image.
- `npm start`: run the CLI from source (after build).
- `npm run test`: run workspace unit tests.
- `npm run test:e2e`: run integration tests without sandbox.
- `npm run lint` / `npm run format`: lint and format the repo.
- `npm run typecheck`: run TypeScript checks.
- `npm run preflight`: full gate (clean, install, format, lint, build, typecheck, tests).

## Coding Style & Naming Conventions
- TypeScript with strict settings (see `tsconfig.json`), NodeNext/ESM modules.
- 2-space indentation, LF line endings, ~80-char line width (see `.editorconfig`).
- Prettier: single quotes, trailing commas, semicolons (`.prettierrc.json`).
- ESLint is the lint gate (`eslint.config.js`).
- Tests use `*.test.ts` / `*.test.tsx`; integration tests use `integration-tests/*.test.js`.

## Testing Guidelines
- Unit tests run with Vitest (`npm run test`).
- Integration tests live in `integration-tests/` and run via `npm run test:e2e`.
- Snapshot tests are under `packages/core/src/core/__snapshots__`.

## Commit & Pull Request Guidelines
- Recent history mixes Conventional Commits (e.g., `feat:`) and short descriptive messages (Chinese/English). Prefer Conventional Commits per `CONTRIBUTING.md`.
- PRs should link to an issue, stay focused, and include a clear description.
- Run `npm run preflight` before submitting; update `docs/` for user-facing changes.
- A Google CLA is required for contributions.

## Configuration & Security
- Node 20 is required (`.nvmrc`).
- Keep API keys out of the repo; configure providers via env vars or `/api config`.
