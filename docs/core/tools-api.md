# uEVO CLI Core: Tools API (code-aligned)

This page summarizes how tools are defined, registered, and executed in
`packages/core`.

## Core primitives

- **Base tool**: `packages/core/src/tools/tools.ts`
  - Each tool defines `name`, `displayName`, `description`, parameter schema,
    validation, and `execute()`.
- **ToolResult**: carries `llmContent` (for model context) and `returnDisplay`
  (for CLI display).
- **ToolRegistry**: `packages/core/src/tools/tool-registry.ts`
  - Registers built-ins and discovered tools.
  - Exposes function declarations to the model.
- **Scheduler**: `packages/core/src/core/coreToolScheduler.ts`
  - Validates params, handles approval flow, executes tools, and wraps results
    as function responses.

## Built-in tools (selected)

Built-ins live in `packages/core/src/tools/*.ts`. Examples:

- File system: `read_file`, `write_file`, `edit`, `ls`, `grep`, `glob`,
  `read_many_files`.
- Execution: `run_shell_command` (shell tool implementation).
- Web: `web_fetch`, `web_search`.
- Memory: `save_memory` (memory tool implementation).

Names are defined as `ToolClass.Name` in each tool file (for example,
`ReadFileTool.Name = 'read_file'`).

## Execution flow

1) The model returns one or more function calls.
2) `CoreToolScheduler` resolves the tool from the registry.
3) Params are validated; approval is requested if required.
4) The tool runs and returns a `ToolResult`.
5) The result is wrapped as a function response and sent back to the model.

## Tool discovery

`ToolRegistry` can register tools via:

- **Built-ins** at startup.
- **Command-based discovery** when `toolDiscoveryCommand` is configured.
- **MCP servers** when `mcpServers` are configured in settings.

Discovered tools are exposed to the model via function declarations and executed
via the configured call handlers.
