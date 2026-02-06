# uEVO CLI Architecture (code-driven)

This page summarizes the architecture based on the actual code paths in the repo.

## Packages and primary roles

- `packages/cli`: interactive and non-interactive user experience, command parsing,
  UI rendering, and tool approval UX.
- `packages/core`: model orchestration, prompt construction, tool registry,
  tool execution, and session state.
- `packages/core/src/tools`: built-in tools (read/write/edit/shell/web/memory, etc.).
- `packages/vscode-ide-companion`: IDE context integration and companion tooling.

## End-to-end execution flow

1) **Process start**
   - Entry: `packages/cli/index.ts`.
   - Delegates to `packages/cli/src/gemini.tsx` `main()`.

2) **CLI bootstrap**
   - Parse args and settings, load extensions, initialize config.
   - Decide interactive vs non-interactive.
   - Handle sandbox/memory/auth/theme.
   - Code: `packages/cli/src/gemini.tsx`.

3) **Interactive flow (Ink UI)**
   - UI root: `packages/cli/src/ui/App.tsx`.
   - Stream orchestration: `packages/cli/src/ui/hooks/useGeminiStream.ts`.
   - Tool lifecycle in UI: `packages/cli/src/ui/hooks/useReactToolScheduler.ts`.

4) **Non-interactive flow**
   - Entry: `packages/cli/src/nonInteractiveCli.ts`.
   - Loop: send prompt -> collect tool calls -> execute tools -> feed results back
     until completion.

5) **Core model orchestration**
   - Client: `packages/core/src/core/client.ts` (`GeminiClient`).
   - Chat/session: `packages/core/src/core/uevoChat.ts`.
   - Turn processing/stream events: `packages/core/src/core/turn.ts`.
   - Prompt building: `packages/core/src/core/prompts.ts`,
     `packages/core/src/core/promptTemplates.ts`.

6) **Tool discovery and execution**
   - Registry: `packages/core/src/tools/tool-registry.ts`.
   - Built-in tools: `packages/core/src/tools/*.ts`.
   - Scheduler: `packages/core/src/core/coreToolScheduler.ts`.
   - Execution flow:
     - Model returns function call(s).
     - Scheduler validates params, requests approval if needed.
     - Tool executes and returns `ToolResult`.
     - Result is wrapped as function response and fed back to the model.

## Primary runtime objects

- `Config` (`packages/core/src/config/config.ts`): central wiring for tool
  registry, model settings, approval mode, MCP servers, sandbox, and services.
- `GeminiClient`: manages chat history, compression, streaming, and retries.
- `CoreToolScheduler`: coordinates tool calls, approval, and result submission.
- `ToolRegistry`: registers built-ins and discovered tools (command/MCP).

## Key integration points

- **Tool discovery**: configured via settings and wired in `Config`.
- **Approval modes**: `ApprovalMode` in `Config`, enforced in
  `CoreToolScheduler`.
- **IDE context**: `packages/core/src/services/ideContext.ts` feeds open file
  context into requests when enabled.
- **Sandbox**: CLI decides whether to enter sandbox before UI starts.

This summary is intended to mirror the actual call graph so you can navigate by
code rather than documentation abstractions.
