# Repository instructions

This repository contains the Fall 2026 MIT 14.33 course materials. The
Markdown and Quarto files are the editable sources for published documents.

## Tool execution

- Always use `uv` for Python environments and dependency management.
- Reuse the repository's `.venv`. If an environment is needed and none exists,
  create it from the repository root with `uv venv`.
- If the repository has a `pyproject.toml`, use `uv sync` to install its
  dependencies and `uv add package-name` to add a dependency. Otherwise, install
  needed Python packages with `uv pip install --python .venv/bin/python package-name`.
- Use `uv run` to select the environment without manually activating it.
  Do not create environments with `python -m venv` or install with bare `pip`.
- Run project tools and helper scripts through `uv run`, including Python,
  Quarto, and Node commands.
- Render Quarto sources with `uv run quarto render path/to/paper.qmd`.

## Course slides

- For substantive lecture revisions, check the syllabus and neighboring
  lectures for scope, terminology, and what students have already seen.
- Preserve the Clean Reveal.js format configured in `docs/slides/_quarto.yml`.
  Follow the relevant lecture's existing layout and CSS.
- Write for novices. Define terms before using them, introduce a running
  example before referring back to it, and make connections between slides
  clear. Keep visible slides concise and put teaching detail in speaker notes.
- Avoid semicolons and em dashes in visible slide prose.
- Check current tool features, prices, and institutional guidance against
  authoritative sources before presenting them as facts.
- Follow `docs/slides/README.md` and the `quarto-render` skill for rendering.
  After a slide edit, render HTML and inspect changed slides. Export or replace
  a PDF only when the user explicitly requests a PDF render or export.
