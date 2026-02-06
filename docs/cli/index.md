# uEVO CLI (packages/cli)

`packages/cli` is the user-facing layer. It handles process startup, settings,
CLI arguments, sandbox entry, and the interactive Ink UI. It also drives the
non-interactive execution path for scripting.

## Key runtime entry points

- Process entry: `packages/cli/index.ts`
- Bootstrap and mode selection: `packages/cli/src/gemini.tsx`
- Interactive UI root: `packages/cli/src/ui/App.tsx`
- Streaming + tool lifecycle: `packages/cli/src/ui/hooks/useGeminiStream.ts`
- Tool scheduling bridge to core: `packages/cli/src/ui/hooks/useReactToolScheduler.ts`
- Non-interactive flow: `packages/cli/src/nonInteractiveCli.ts`

## Non-interactive mode

When input is piped or `-p/--prompt` is used, the CLI runs a loop that:
1) Sends the user prompt to the core model client.
2) Collects tool calls returned by the model.
3) Executes those tools and feeds results back to the model.
4) Prints the final response and exits.

Example:

```bash
echo "Summarize this repo" | uevo
```

## Interactive flow (Ink UI)

The interactive UI keeps state, renders streamed tokens, manages approvals, and
aggregates tool call output. The core logic is in `useGeminiStream`, which
connects user input to the core model client and the tool scheduler.
