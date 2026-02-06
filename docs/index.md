# uEVO CLI documentation

This documentation explains how uEVO CLI works, how to use it, and how to extend
it. The content is aligned to the code layout in this repository.

## Overview (code-aligned)

uEVO CLI runs as a terminal application in `packages/cli` and delegates model
orchestration and tool execution to `packages/core`. The CLI sends user prompts
to the core, the core calls the model, and tool requests are scheduled and
executed before responses are returned to the CLI for display.

## Navigating the documentation

- **[Architecture](./architecture.md):** Code-driven execution flow and module map.
- **CLI**
  - **[CLI Introduction](./cli/index.md)**
  - **[Commands](./cli/commands.md)**
  - **[Configuration](./cli/configuration.md)**
  - **[Checkpointing](./checkpointing.md)**
  - **[Extensions](./extension.md)**
  - **[Telemetry](./telemetry.md)**
- **Core**
  - **[Core Introduction](./core/index.md)**
  - **[Tools API](./core/tools-api.md)**
- **Tools**
  - **[Tools Overview](./tools/index.md)**
  - **[File System Tools](./tools/file-system.md)**
  - **[Multi-File Read Tool](./tools/multi-file.md)**
  - **[Shell Tool](./tools/shell.md)**
  - **[Web Fetch Tool](./tools/web-fetch.md)**
  - **[Web Search Tool](./tools/web-search.md)**
  - **[Memory Tool](./tools/memory.md)**
- **[NPM Workspaces and Publishing](./npm.md)**
- **[Integration Tests](./integration-tests.md)**
- **[Troubleshooting](./troubleshooting.md)**
- **[Terms of Service and Privacy](./tos-privacy.md)**
- **[Contributing](../CONTRIBUTING.md)**
