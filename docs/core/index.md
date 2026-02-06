# uEVO CLI Core (packages/core)

`packages/core` is the backend runtime for uEVO CLI. It builds prompts, calls
the model, coordinates tool execution, and manages session state.

## Primary responsibilities

- **Model orchestration**: `GeminiClient` in `packages/core/src/core/client.ts`.
- **Chat/session management**: `GeminiChat` in `packages/core/src/core/uevoChat.ts`.
- **Streaming turns**: `Turn` in `packages/core/src/core/turn.ts`.
- **Prompt construction**: `packages/core/src/core/prompts.ts` and templates.
- **Tool registry and execution**: `packages/core/src/tools` + scheduler.
- **Configuration and wiring**: `packages/core/src/config/config.ts`.

## Request lifecycle (core view)

1) The CLI asks `Config` for a `GeminiClient`.
2) `GeminiClient` sets up a `GeminiChat` with environment context and tool
   declarations.
3) The model returns either text or function calls.
4) Tool calls are executed by `CoreToolScheduler`, results are wrapped as
   function responses and fed back into the model.
5) The final model output is streamed back to the CLI.

## File discovery and memory

- File discovery and ignore rules live in `packages/core/src/services` and
  `packages/core/src/utils`.
- Memory discovery and load logic is in `packages/core/src/utils/memoryDiscovery.ts`.

## Tool extensions

Tools can be added via built-in registry, command-based discovery, or MCP
servers configured in settings. See the Tools API for details.
