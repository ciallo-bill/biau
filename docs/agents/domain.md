# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- `CONTEXT.md` at the repo root, if it exists
- `docs/adr/`, if it exists

If these files do not exist, proceed silently. They can be created later when the domain language or architectural decisions become stable enough to document.

## File structure

This repo uses a single-context layout:

```text
/
├── CONTEXT.md
├── docs/adr/
└── src/
```

## Use the glossary's vocabulary

When output names a domain concept, use the term as defined in `CONTEXT.md`. If the concept is missing, note the gap rather than inventing a conflicting vocabulary.

## Flag ADR conflicts

If output contradicts an existing ADR, surface that conflict explicitly instead of silently overriding it.
