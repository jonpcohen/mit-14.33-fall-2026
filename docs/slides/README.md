# Course slides

This directory contains the source and rendered lecture slides for 14.33,
Research and Communication in Economics. The slides use Grant McDermott's
[Clean Reveal.js theme](https://github.com/grantmcdermott/quarto-revealjs-clean).

## Directory structure

Each lecture has its own numbered directory:

```text
slides/
├── _quarto.yml
├── _extensions/
├── README.md
├── 01-course-overview/
│   ├── 01-course-overview.qmd
│   ├── 01-course-overview.html
│   ├── 01-course-overview.pdf
│   └── images/
└── 02-developing-a-research-topic/
    ├── 02-developing-a-research-topic.qmd
    ├── 02-developing-a-research-topic.html
    ├── 02-developing-a-research-topic.pdf
    └── images/
```

Use two-digit lecture numbers and descriptive names so that directories and
downloaded files sort naturally. Put images used by only one lecture in that
lecture's `images/` directory. Add a shared `common/` directory only if assets
are genuinely reused across lectures.

## Requirements

Install [Quarto](https://quarto.org/docs/get-started/) and confirm that it is
available:

```bash
quarto --version
```

The Clean extension is committed under `_extensions/`, so no additional theme
installation is needed after cloning this repository.

## Create a lecture

From this directory, copy an existing source file into a new numbered
directory, then edit its YAML metadata and slide content. For example:

```bash
mkdir -p 02-developing-a-research-topic/images
cp 01-course-overview/01-course-overview.qmd \
  02-developing-a-research-topic/02-developing-a-research-topic.qmd
```

The shared `_quarto.yml` selects the Clean theme and contains course-wide
rendering options. Keep lecture-specific information, such as title and date,
in the individual `.qmd` file.

## Render HTML

Run these commands from `docs/slides`.

Render one lecture:

```bash
quarto render 01-course-overview/01-course-overview.qmd
```

Preview a lecture while editing:

```bash
quarto preview 01-course-overview/01-course-overview.qmd
```

Render every lecture:

```bash
quarto render
```

The `embed-resources: true` setting creates a self-contained HTML file, so no
companion `_files` directory is required. This setting is incompatible with
the Reveal.js chalkboard extension.

## Export PDF

Reveal.js creates HTML slides. To create the matching PDF after rendering:

1. Open the rendered `.html` file in Chrome, Chromium, or Firefox.
2. Press `E` to enter Print View.
3. Open the print dialog with `Command-P` on macOS.
4. Select **Save as PDF**.
5. Set the layout to **Landscape** and margins to **None**.
6. Enable **Background graphics**, then save the PDF beside the HTML file with
   the same base name.

Commit the `.qmd`, `.html`, and `.pdf` files so that collaborators can read the
slides without installing Quarto.

## Recreate the setup elsewhere

To create an equivalent slide project in another directory:

```bash
mkdir -p docs/slides
cd docs/slides
quarto add grantmcdermott/quarto-revealjs-clean --no-prompt
```

Then copy this `_quarto.yml` into the new directory and create one numbered
directory per lecture. Commit `_extensions/` to make the selected version of
the theme part of the project.

