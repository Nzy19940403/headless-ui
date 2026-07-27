# TanStack Table — offline AI docs

Offline snapshot of the official TanStack Table LLM documentation, so agents do **not** need network access and all LLMs share the same reference.

## Start here

1. Read **`llms.txt`** (index / routing layer).
2. Open only the linked markdown under **`docs/`** that matches the task.

## Source

| Item | Value |
| --- | --- |
| Official index | https://tanstack.com/table/latest/llms.txt |
| Official home | https://tanstack.com/table/latest |
| Snapshot date | 2026-07-27 |
| Local files | 71 markdown pages under `docs/` |

## What is included

- Getting started: introduction, overview, installation, FAQ, migration
- Core + feature **guides**
- Core + feature **API** reference
- Framework adapters: React, Vue, Lit, Solid, Svelte, Qwik, Angular, Vanilla (+ table-state guides)

## What is not included

- Official `*/examples/*.md` links from the remote index currently **404** on tanstack.com (examples live as runnable demos, not as docs markdown). They are omitted from this snapshot.
- There is **no** `llms-full.txt` for Table on the official site; use this folder + selective pages instead.

## How to use (for AI / Codex / Grok)

```
docs/ai/tanstack-table/llms.txt          # map of docs
docs/ai/tanstack-table/docs/introduction.md
docs/ai/tanstack-table/docs/guide/column-defs.md
docs/ai/tanstack-table/docs/framework/react/react-table.md
docs/ai/tanstack-table/docs/framework/vue/vue-table.md
docs/ai/tanstack-table/docs/framework/lit/lit-table.md
docs/ai/tanstack-table/docs/api/core/table.md
```

Prefer framework pages when the task names React / Vue / Lit / WC.

## Refresh

Re-run a fetch of `https://tanstack.com/table/latest/llms.txt` and all linked non-example `docs/**/*.md` into this directory, then regenerate relative `llms.txt` links.
