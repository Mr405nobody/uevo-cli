# uEVO CLI tools

Tools are callable functions exposed to the model and executed by the core. They
allow the model to inspect or modify the local environment, fetch web content,
or perform other actions beyond text generation.

## How tools are invoked (runtime flow)

1) The CLI sends the prompt to the core.
2) The core sends the prompt + tool schemas to the model.
3) The model returns function call(s) when needed.
4) The core validates, optionally requests approval, and runs the tool.
5) Tool output is sent back to the model as a function response.
6) The final response is streamed back to the CLI.

## Built-in tool categories

- **File system**: `read_file`, `write_file`, `edit`, `ls`, `grep`, `glob`,
  `read_many_files`.
- **Shell**: `run_shell_command`.
- **Web**: `web_fetch`, `google_web_search`.
- **Memory**: `save_memory`.

## Safety and approvals

Tools that can modify files or execute commands are typically gated by approval
logic in `CoreToolScheduler` and configuration in `ApprovalMode`. If sandboxing
is enabled, tools execute inside the sandbox environment.

## Extending tools

Tools can be discovered through:

- Built-in registrations in `ToolRegistry`.
- Command-based discovery (`toolDiscoveryCommand`).
- MCP servers (`mcpServers` in settings).

These paths are wired through `packages/core/src/tools/tool-registry.ts` and
`packages/core/src/config/config.ts`.
