# Compiling Your Paper from Google Docs and Your Output Files

Your paper pulls every number, table and figure from files in a `paper_output` folder. You never copy a result in by hand.

## How it works

1. **Your code writes the outputs.** Every statistic, table and figure the paper reports is saved to `paper_output`. Each time you rerun your code, these files update.
2. **Your paper reads the outputs.** The paper never contains a result itself. It holds a command that points to a file in `paper_output`, and each build pulls in the current file.
3. **You connect the two once.** Go through your draft and replace each hard-coded result with the command for its file.

After that, rerunning your code and rebuilding the PDF keeps every number, table and figure in sync with your analysis.

```
code  →  paper_output/  →  paper.qmd or paper.tex  →  PDF
```

You need a LaTeX installation (TeX Live or MiKTeX). For a Quarto paper, you also need [Quarto](https://quarto.org/docs/get-started/).

## Step 1: Create paper_output

Create a `paper_output` folder in your project root. Save every result your paper reports into it:

| Result | File | Contains |
| --- | --- | --- |
| Statistic | `name.txt` | Only the number, as it should print: `20.4`, `1,204` |
| Table | `name.tex` | Only the table, from `\begin{tabular}` to `\end{tabular}` |
| Figure | `name.pdf` | Only the figure, with no title |

Names use lowercase letters, digits and hyphens: `mean-age`, `income-hist`.

### Modify your codebase

You will need to modify your codebase so that it writes each result to `paper_output` in the format above and under the name your paper will use. Your paper finds a file only by its exact name, so `\stat{mean-age}` works only if your code saves `paper_output/mean-age.txt`. Change only how results are saved, not how they are computed.

### Instructions for your coding agent

When you modify your code to produce these outputs, each file must be in exactly the right form for your paper to read it. If you use a coding agent, save the instructions below in your project root as `AGENTS.md` (Claude Code reads `CLAUDE.md`), so the agent follows them every time. Then ask for each output in plain words, for example: "Save the mean age after cleaning as the paper output `mean-age`."

```markdown
# Paper outputs

The paper reads results from the paper_output folder in the project root.
When asked to save a result as a paper output, find where the code computes
it and add code that writes it to paper_output, following these rules.

## Names
- Use the name given, as the file name: lowercase letters, digits and
  hyphens only (mean-age, income-hist).
- Statistics end in .txt, tables in .tex, figures in .pdf.

## Statistics (name.txt)
- Only the number, formatted exactly as it should print (20.4, 1,204).
- No %, units, words, labels, quotes or extra lines.

## Tables (name.tex)
- Only a LaTeX tabular: start with \begin{tabular}, end with \end{tabular}.
- No table environment, \caption, \label or \centering.
- Use booktabs rules (\toprule, \midrule, \bottomrule).
- Escape _ % & $ # in all cell and header text.

## Figures (name.pdf)
- A vector PDF, about 6.5 x 4 inches.
- No title or caption in the image. Label the axes.

## Always
- Create paper_output if it does not exist.
- Change only how results are saved, never how they are computed.
- Run the code and confirm the file was written in the right form.
```

## Step 2: Paste your draft into a template

1. In Google Docs, choose **File → Download → Plain text (.txt)**.
2. In your project root, create `paper.qmd` or `paper.tex` from a template below, and add your title and name.
3. Replace `PASTE YOUR TEXT HERE` with your text.
4. Leave an empty line between paragraphs.
5. In `paper.tex` only, write `%`, `&`, `$`, `#` and `_` as `\%`, `\&`, `\$`, `\#` and `\_`.

Use these templates rather than your own. They define the `\stat`, `\fig` and `\tbl` commands and tell the paper to look in `paper_output`; without them, the commands in Step 3 will not work. If you must use your own template, copy the lines from `% Find every file` through the `\tbl` definition into its preamble.

`paper.qmd`:

```markdown
---
title: "Your Title"
author: "Your Name"
format: pdf
include-in-header:
  text: |
    \usepackage{booktabs}
    % Find every file by name in the paper_output folder
    \makeatletter\def\input@path{{paper_output/}}\makeatother
    \graphicspath{{paper_output/}}
    % \stat{name}: the number in name.txt
    \newcommand{\stat}[1]{\input{#1.txt}\unskip}
    % \fig{name}{caption}: name.pdf as a numbered figure
    \newcommand{\fig}[2]{\begin{figure}[htbp]\centering
      \includegraphics[width=0.8\textwidth]{#1.pdf}\caption{#2}\label{fig:#1}\end{figure}}
    % \tbl{name}{caption}: name.tex as a numbered table
    \newcommand{\tbl}[2]{\begin{table}[htbp]\centering
      \caption{#2}\label{tbl:#1}\input{#1.tex}\end{table}}
---

PASTE YOUR TEXT HERE
```

`paper.tex`:

```latex
\documentclass[11pt]{article}
\usepackage[margin=1in]{geometry}
\usepackage{graphicx, booktabs, hyperref}

% Find every file by name in the paper_output folder
\makeatletter\def\input@path{{paper_output/}}\makeatother
\graphicspath{{paper_output/}}
% \stat{name}: the number in name.txt
\newcommand{\stat}[1]{\input{#1.txt}\unskip}
% \fig{name}{caption}: name.pdf as a numbered figure
\newcommand{\fig}[2]{\begin{figure}[htbp]\centering
  \includegraphics[width=0.8\textwidth]{#1.pdf}\caption{#2}\label{fig:#1}\end{figure}}
% \tbl{name}{caption}: name.tex as a numbered table
\newcommand{\tbl}[2]{\begin{table}[htbp]\centering
  \caption{#2}\label{tbl:#1}\input{#1.tex}\end{table}}

\title{Your Title}
\author{Your Name}

\begin{document}
\maketitle

PASTE YOUR TEXT HERE

\end{document}
```

## Step 3: Add the commands and build

Replace each result in your text with its command. The first set of braces holds **name**: the file's name in `paper_output`, without the extension. It must match the file name exactly.

| Result | Command | File it reads | Example |
| --- | --- | --- | --- |
| Statistic | `\stat{name}` | `paper_output/name.txt` | `\stat{mean-age}` reads `mean-age.txt` |
| Figure | `\fig{name}{caption}` | `paper_output/name.pdf` | `\fig{income-hist}{Household income.}` reads `income-hist.pdf` |
| Table | `\tbl{name}{caption}` | `paper_output/name.tex` | `\tbl{regression}{OLS estimates.}` reads `regression.tex` |
| Figure number | `Figure \ref{fig:name}` | the `\fig` with that name | `Figure \ref{fig:income-hist}` |
| Table number | `Table \ref{tbl:name}` | the `\tbl` with that name | `Table \ref{tbl:regression}` |

For figures and tables, the second set of braces holds the caption you write. For a figure or table number, put `fig:` or `tbl:` before the name.

Put each `\fig` and `\tbl` on its own line, with an empty line above and below. Keep units outside the command: `\stat{share}%`.

Build the PDF with `quarto render paper.qmd` or `latexmk -pdf paper.tex`.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `File 'mean-age.txt' not found` | The command's name doesn't match a file in `paper_output`. |
| Every file not found | `paper.qmd` or `paper.tex` must sit in the project root, next to `paper_output`. |
| `Figure ??` | The name in `\ref` doesn't match a `\fig` or `\tbl`. Check the `fig:` or `tbl:` prefix. |
| Paragraphs run together | Add an empty line between them. |
| Error near `%`, `&`, `$`, `#` or `_` | In `paper.tex`, escape it with `\`. |
| Error inside a table | The `.tex` file has a caption or table environment, or an unescaped `_`. |

## Using a coding agent for Steps 2 and 3

A coding agent with access to your full project can fill in the commands for you: it can read your draft, find each hard-coded result, work out which file in `paper_output` it comes from, and swap in the command. This is risky. The agent can link a number to the wrong file, and nothing will flag it, because the paper still builds.

**The agent may:**
- Replace hard-coded results with commands.
- Format your text: add headings, empty lines between paragraphs, and LaTeX code such as `\%` or `\section{}`.

**The agent may not:**
- Change your wording, fix typos, reorder text, or add or remove sentences.
- Change your code or the files in `paper_output`.

**All drafting still happens in Google Docs.** The agent only converts your finished text; it never writes or revises it. To change your writing, edit the Google Doc, then repeat Steps 2 and 3.

A prompt to start from:

```
In paper.qmd [or paper.tex], replace each hard-coded statistic, table and
figure with the matching command from the guide, using files in
paper_output. You may also fix formatting. Do not change any wording.
List every replacement: the original text, the command, and the file.
```

**Check every replacement yourself.** For each one, open the file it points to and confirm it holds the result your draft reported. Then read the PDF against your original draft to make sure no wording changed.
