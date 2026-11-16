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

**Quarto or LaTeX?** Your paper is written in one of two formats, and you build it with the matching tool. Both produce the same kind of PDF, so pick whichever you are comfortable with — you only use one.

- **LaTeX** is a typesetting system long used for technical and economics writing. You write a plain-text `.tex` file with markup for sections, math, figures and citations, then compile it to a PDF. It gives fine control, but the syntax is heavier.
- **Quarto** is a newer publishing tool built on Markdown. You write a `.qmd` file in a lighter, more readable syntax, and Quarto turns it into a PDF (using LaTeX behind the scenes, which is why both routes need a LaTeX installation). It is easier to write, but it is an extra program to install.

## Step 0: Install the dependencies

| You need | For | How to install | Check it works |
| --- | --- | --- | --- |
| The full TeX Live (`scheme-full`) | Building the PDF, for both `paper.tex` and `paper.qmd` | Mac: install [MacTeX](https://tug.org/mactex/), which is the full TeX Live. Windows and Linux: run the [TeX Live installer](https://tug.org/texlive/) and choose the full scheme (on Ubuntu or Debian, `sudo apt install texlive-full` also works) | `pdflatex --version` and `latexmk --version` |
| [Quarto](https://quarto.org/docs/get-started/) | `paper.qmd` only | Download and run the installer for your system | `quarto --version` |

The full TeX Live includes every LaTeX package the templates use, so there is nothing else to install.

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

When you modify your code to produce these outputs, each file must be in exactly the right form for your paper to read it. If you use a coding agent, add the instructions below to the agent instruction file in your project root, so the agent follows them every time. Most agents read `AGENTS.md`; Claude Code reads `CLAUDE.md`.

**Paste the block at the end of that file.** Do not replace the file: it holds instructions your project depends on.

Then ask for each output in plain words, for example: "Save the mean age after cleaning as the paper output `mean-age`."

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
- Escape _ % & $ # ~ ^ in all cell and header text.

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
2. In your project root, create `paper.qmd` or `paper.tex` from a template below, and add your title and name. In `paper.qmd`, type the title normally, with no backslashes. In `paper.tex`, escape the title as in Step 3.
3. Replace `PASTE YOUR TEXT HERE` with your text.

Use these templates rather than your own. They define the `\stat`, `\fig` and `\tbl` commands, load the packages those commands need, and tell the paper to look in `paper_output`. Without them, the commands in Step 4 will not work.

If you must use your own template, copy this whole block into its preamble, before `\begin{document}`. Keep the `\usepackage` lines even if your template already loads those packages: figures need `graphicx`, tables need `booktabs`, and math needs `amsmath`. In a `.qmd` file, put the block under `include-in-header:`, as in the Quarto template.

```latex
% --- Reproducible paper setup: copy this whole block into your preamble ---
\usepackage{graphicx}   % needed by \fig
\usepackage{booktabs}   % needed by the tables in paper_output
\usepackage{amsmath}    % needed for math such as \text{} and \eqref{}
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
% --- end of setup ---
```

`paper.qmd`:

```markdown
---
title: "Your Title"
author: "Your Name"
format: pdf
bibliography: references.bib
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
\usepackage[round]{natbib}   % author-year citations, in (round) parentheses
\usepackage{graphicx, booktabs, amsmath, hyperref}

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

\bibliographystyle{plainnat}   % author-year citation style
\bibliography{references}      % reads references.bib

\end{document}
```

### Add your bibliography

If your paper cites sources, export your references as BibTeX from your reference manager (Zotero, Mendeley, EndNote, Paperpile, ...) and save the file as `references.bib` in your project root, next to your paper file. The templates above already look for it — Quarto through the `bibliography:` line, LaTeX through `\bibliography{references}`.

The reference list is built automatically from the works you cite in your text (covered next), and appears at the end of the paper. In LaTeX the section is titled "References" for you; in Quarto, end your text with a `# References` heading if you want it titled.

- **Name the file `references.bib`,** or change the name in the template (the `bibliography:` line for Quarto, `\bibliography{...}` for LaTeX).
- **No bibliography?** Delete these lines from your template, or the build will look for a `references.bib` that isn't there.
- **Check it is wired** before you have added any citations by listing every entry once: add `\nocite{*}` just before `\bibliography` (LaTeX), or `nocite: '@*'` under the header (Quarto). Remove it after you start citing real works.

## Step 3: Format your text

The plain-text download keeps your words but drops all of Google Docs' formatting. You put back what your paper needs, in the syntax of your file type:

| Lost in the download | What happens | Restore it |
| --- | --- | --- |
| Paragraph breaks | Paragraphs sit on consecutive lines and run together | An empty line between paragraphs (below) |
| Headings | Heading styles become ordinary lines of text | Heading syntax (Quarto or LaTeX section) |
| Italics, bold | The emphasis disappears | Emphasis syntax (Quarto or LaTeX section) |
| Footnotes | They no longer sit where you placed them | Footnote syntax (Quarto or LaTeX section) |
| Equations | Equation-editor content does not come through usably | Retype in LaTeX math (below) |

Your file type also treats a few ordinary characters as commands, so those need escaping (below).

### In both file types

- **Leave an empty line between paragraphs.** Both formats run consecutive lines together into one paragraph.
- **Escape special characters in your text** (not in math; see below):

    | Character | Write |
    | --- | --- |
    | `%` `&` `$` `#` `_` | `\%` `\&` `\$` `\#` `\_` |
    | `~` `^` | `\textasciitilde{}` `\textasciicircum{}` |

    Left as they are, they can stop the build or silently delete text.
- **Write math in LaTeX math.** Equations from Google Docs do not survive the plain-text download, so retype each one. Symbols such as `≥` or `α` also go in math: `$\geq$`, `$\alpha$`. Inside math, do not escape: `$\beta_1$` and `$x^2$` use `_` and `^` as normal, and a `$` that opens or closes math stays a plain `$`. Escape only a dollar sign that means money: `\$5`.
- **Delete any numbers you typed into headings,** such as "1. Background". Both formats number headings for you, and in Quarto a typed number turns the heading into a list item.

### Quarto (`paper.qmd`)

| To write | Use |
| --- | --- |
| Section | `# Introduction` |
| Subsection | `## Background` |
| Sub-subsection | `### Data` |
| Italics, bold | `*word*`, `**word**` |
| Footnote | `text.^[The footnote.]` |
| Inline math | `$\beta_1 = 0.4$` |
| Display math | `$$` on its own line, the equation, then `$$` on its own line |
| Numbered equation | Add `{#eq-name}` after the closing `$$` |
| Equation number in text | `@eq-name` (prints "Equation 1", so do not type "Equation" before it) |

Put each heading on its own line, with an empty line above and below. To number your headings (1, 1.1, ...), add `number-sections: true` on its own line below `format: pdf` in the header.

````markdown
## Model

We estimate the model in @eq-model.

$$
\text{GPA}_i = \beta_0 + \beta_1 \, \text{hours}_i + \varepsilon_i
$$ {#eq-model}
````

### LaTeX (`paper.tex`)

| To write | Use |
| --- | --- |
| Section | `\section{Introduction}` |
| Subsection | `\subsection{Background}` |
| Sub-subsection | `\subsubsection{Data}` |
| Unnumbered heading | `\section*{Acknowledgments}` |
| Italics, bold | `\emph{word}`, `\textbf{word}` |
| Footnote | `text.\footnote{The footnote.}` |
| Inline math | `$\beta_1 = 0.4$` |
| Display math | `\[` on its own line, the equation, then `\]` on its own line |
| Numbered equation | `\begin{equation}`, the equation, `\label{eq:name}`, `\end{equation}` |
| Equation number in text | `Equation \eqref{eq:name}` (prints "Equation (1)") |

Headings are numbered automatically. Escape special characters inside headings too: `\section{Results for 18\% of users}`.

```latex
\subsection{Model}

We estimate the model in Equation \eqref{eq:model}.
\begin{equation}
\text{GPA}_i = \beta_0 + \beta_1 \, \text{hours}_i + \varepsilon_i
\label{eq:model}
\end{equation}
```

### Cite your sources

Cite a work by its **key** in `references.bib` — the label at the start of the entry, such as `stigler1961economics`. The key must match exactly, just like the name in `\stat{name}`. The reference list then builds itself from whatever you cite.

| To cite | Quarto (`paper.qmd`) | LaTeX (`paper.tex`) |
| --- | --- | --- |
| In parentheses — (Author, Year) | `[@key]` | `\citep{key}` |
| In the sentence — Author (Year) | `@key` | `\citet{key}` |
| Several at once | `[@key1; @key2]` | `\citep{key1,key2}` |
| With a page or note | `[@key, p. 5]` | `\citep[p.~5]{key}` |

For example:

- Quarto: `Search was formalized by @stigler1961economics, and dispersion persists [@varian1980model].`
- LaTeX: `Search was formalized by \citet{stigler1961economics}, and dispersion persists \citep{varian1980model}.`

Both print the citation in your text and add the work to the reference list at the end — you never type the reference list yourself.

## Step 4: Add the commands and build

Replace each result in your text with its command. The first set of braces holds **name**: the file's name in `paper_output`, without the extension. It must match the file name exactly.

| Result | Command | File it reads | Example |
| --- | --- | --- | --- |
| Statistic | `\stat{name}` | `paper_output/name.txt` | `\stat{mean-age}` reads `mean-age.txt` |
| Figure | `\fig{name}{caption}` | `paper_output/name.pdf` | `\fig{income-hist}{Household income.}` reads `income-hist.pdf` |
| Table | `\tbl{name}{caption}` | `paper_output/name.tex` | `\tbl{regression}{OLS estimates.}` reads `regression.tex` |
| Figure number | `Figure \ref{fig:name}` | the `\fig` with that name | `Figure \ref{fig:income-hist}` |
| Table number | `Table \ref{tbl:name}` | the `\tbl` with that name | `Table \ref{tbl:regression}` |

For figures and tables, the second set of braces holds the caption you write. For a figure or table number, put `fig:` or `tbl:` before the name.

Put each `\fig` and `\tbl` on its own line, with an empty line above and below. Keep units outside the command, escaped as in Step 3: `\stat{share}\%`.

### Captions are LaTeX in both file types

The caption inside `\fig{name}{caption}` and `\tbl{name}{caption}` is read as LaTeX, even in `paper.qmd`. Escape special characters in every caption:

| In a caption, write | Not | What goes wrong otherwise |
| --- | --- | --- |
| `\%` | `%` | Quarto prints the whole `\fig` or `\tbl` command as plain text instead of the figure; LaTeX stops the build |
| `\&` | `&` | The build stops |
| `\_` | `_` | The build stops |
| `\$` and `\#` | `$` and `#` | The build stops |
| `\textasciitilde{}` | `~` | The `~` silently disappears |
| `\emph{word}` | `*word*` | The asterisks print |

For example: `\fig{first-gen}{Share of first-generation students (20\% sample), by \emph{region}.}`

### Build

Build the PDF with `quarto render paper.qmd` or `latexmk -pdf paper.tex`. `latexmk` runs every pass for you, including the `bibtex` pass a bibliography needs. If `latexmk` does not run, build by hand: run `pdflatex paper.tex`, then `bibtex paper` (only if you have a bibliography), then `pdflatex paper.tex` twice more — so figure numbers, table numbers, citations and the reference list all resolve.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `File 'mean-age.txt' not found` | The command's name doesn't match a file in `paper_output`. |
| Every file not found | `paper.qmd` or `paper.tex` must sit in the project root, next to `paper_output`. |
| `Figure ??` | The name in `\ref` doesn't match a `\fig` or `\tbl`. Check the `fig:` or `tbl:` prefix. |
| Paragraphs run together | Add an empty line between them. |
| Text missing after a `%`, or an error near `&`, `$`, `#`, `_` or `^` | Escape the character as in Step 3, in both file types. |
| A `\fig` or `\tbl` prints as plain text | Its caption contains an unescaped `%`. Write `\%`. |
| Asterisks appear in a caption | Captions are LaTeX: write `\emph{word}`, not `*word*`. |
| `YAMLException: unknown escape sequence` | Remove the backslashes from the title in `paper.qmd`. |
| A symbol prints as a box, or `Unicode character ... not set up` | Write the symbol as math, such as `$\geq$`. |
| Error inside a table | The `.tex` file has a caption or table environment, or an unescaped `_`. |
| A citation prints as `[?]`, `(???)`, or `Citation 'key' undefined` | The key doesn't match an entry in `references.bib`; or, if building by hand, you skipped the `bibtex` pass. |
| The reference list is empty or missing | You haven't cited anything yet, or `references.bib` is not in the project root. |

## Using a coding agent for Steps 2 to 4

A coding agent with access to your full project can fill in the commands for you: it can read your draft, find each hard-coded result, work out which file in `paper_output` it comes from, and swap in the command. This is risky. The agent can link a number to the wrong file, and nothing will flag it, because the paper still builds.

**The agent may:**
- Replace hard-coded results with commands.
- Format your text: add headings, empty lines between paragraphs, and LaTeX code such as `\%` or `\section{}`.

**The agent may not:**
- Change your wording, fix typos, reorder text, or add or remove sentences.
- Change your code or the files in `paper_output`.

A prompt to start from:

```
In paper.qmd [or paper.tex], replace each hard-coded result with a command
that reads its file in paper_output: \stat{name} for name.txt,
\fig{name}{caption} for name.pdf, \tbl{name}{caption} for name.tex, and
Figure \ref{fig:name} or Table \ref{tbl:name} for figure and table numbers.
You may also fix formatting and escape special characters (\%, \&, \_),
including in captions, which are LaTeX: use \emph{word}, not *word*.
Do not change any wording. List every replacement: the original text, the
command, and the file.
```

**Check every replacement yourself.** For each one, open the file it points to and confirm it holds the result your draft reported. Then read the PDF against your original draft to make sure no wording changed.

## Rebuilding the paper with `run_all.sh`

The template project repository includes a script, `run_all.sh`, in the project root. It runs your full analysis and then compiles the paper, in one command, so you never run the steps by hand. This is what makes the paper reproducible: change your analysis and rerun the script, and the PDF updates itself.

### Before you run it

- **Finish Steps 0–4.** The dependencies are installed, your code writes every result to `paper_output`, and your `paper.qmd` or `paper.tex` is in the project root with the commands filled in.
- **Keep `run_all.sh` in the project root,** next to `paper_output`, your `code`, and your paper file. The script builds whatever is in that folder.

### Set it up once

Open `run_all.sh` and edit the two settings near the top:

1. **Your analysis.** In the `run_analysis` function, put the command(s) that regenerate `paper_output`. The template runs `python3 code/analyze.py`; change or add lines to match how your project builds its results.
2. **Your pipeline.** Set `PIPELINE` to match your paper file — there is no autodetection, so you must hard-code it:

    ```sh
    PIPELINE="quarto"   # builds paper.qmd
    # PIPELINE="latex"  # builds paper.tex
    ```

    If you build with `quarto`, do not keep a `paper.tex` in the folder: `quarto render` creates and deletes its own `paper.tex` and will overwrite yours.

### Run it

From the project root, run:

```sh
bash run_all.sh
```

Or make it executable once with `chmod +x run_all.sh`, then run `./run_all.sh`. (On Windows, run it from Git Bash or WSL, since it is a shell script.) When it finishes, it has written `paper.pdf`.

### From now on

Whenever you change your analysis code or your data, just run `run_all.sh` again. It reruns your analysis, refreshes every file in `paper_output`, and rebuilds `paper.pdf` — so every number, table and figure in the paper updates to match your latest results, with nothing copied in by hand.
