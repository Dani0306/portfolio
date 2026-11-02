---
title: PaperTrail
order: 1
summary: 'Turns invoice PDFs and images into clean spreadsheet rows, and flags every field it is not sure about for a person to check instead of guessing.'
role: 'Solo developer: product, design, frontend, backend, database, evals and deploy.'
outcome: 'Live demo with eight sample invoices. On a 30 document test set it reads 99.8% of fields correctly for about $0.0005 a document, and a CI gate blocks any change that costs more than 2 points of accuracy.'
stack: [Next.js, TypeScript, Supabase, OpenAI API, Vercel AI SDK, Zod, Tailwind CSS]
live: https://papertrail-chi-one.vercel.app
repo: https://github.com/Dani0306/papertrail
image: /projects/papertrail.webp
---
## The product

PaperTrail turns invoice PDFs and images into clean spreadsheet rows, as CSV or Excel. A model reads the file directly, with no OCR step, and returns a vendor, an invoice number, dates, a currency, line items and totals. Every field comes with a confidence from 0 to 1 and the exact text the value was read from. Anything below the threshold is flagged for a person to check instead of being guessed, and a person's correction is stored next to the model's value, never over it.

The demo needs no sign in: eight synthetic sample invoices are preloaded, public and read only, each one extracted once through the real pipeline. Signing in with Google lets you upload your own, and those uploads are visible only to you. Every document in the project is synthetic, with no real invoices and no client data.

## What a document goes through

- **Extraction:** the file goes to the OpenAI Responses API as a PDF or image part. The Vercel AI SDK forces a strict function call, and one Zod schema both tells the model what to return and validates what comes back.
- **A failure ladder:** an answer that fails validation gets one repair retry with the errors fed back. If that fails, one fresh call goes to the stronger backup model. If that fails too, a person enters the document by hand. Partial data is never returned.
- **Review:** a screen puts the document beside its fields and highlights the low confidence ones, each with its source text.
- **Export:** CSV and Excel with the corrections applied and a Check column that lists what is still uncertain.
- **Cost log:** every model call records its tokens, cost, latency and outcome.

## Measured, not guessed

The model was picked from numbers. On the first ten invoices, `gpt-6-luna` scored 99.7% field accuracy against 98.6% for `gpt-6.1-sol`, at about 22 times less cost per document, so luna is the main model and sol is the backup.

The test set then grew to 30 documents, with ground truth copied from each source document and never from model output. It includes a credit note, German, French, Portuguese and Spanish invoices, a handwritten total, a rotated scan and a PDF whose second page is only an image. The baseline run scored 99.8% across 90 extractions, with no hallucinated fields.

- **One silent error, and it is the important kind.** On the rotated low resolution scan, luna read `RO-60218` as `FO-60218` at 0.98 to 0.99 confidence. No threshold below 1.0 would flag it, and the README says so: confidence cannot catch a confident misread.
- **Confidence is worth its cost.** Asking for it adds about 18% to the cost of a document. Without it, silent errors rise from 0.03 to 0.11 a document and nothing can be flagged for review.
- **The threshold is a decision, not a default.** The 0.85 cutoff was chosen by a rule fixed before sweeping thresholds from 0.70 to 0.95: fewest silent errors first, then the fewest fields sent to review.

## How it is built

- **Next.js 16** with the App Router, Turbopack and Cache Components, React 19 and strict TypeScript. Tailwind CSS 4 carries the design tokens, and the fonts are Inter, Playfair Display and Geist Mono through `next/font`.
- **Supabase** for Postgres in its own `papertrail` schema, a private Storage bucket with signed upload URLs, and Google sign in with server side PKCE.
- **SheetJS** writes the Excel export and the CSV writer is written by hand.
- **Vitest** unit tests that never call the model, and ESLint. A GitHub Actions Checks workflow runs on every change, and an Eval gate runs the 30 document test against a stored baseline and fails the pull request if accuracy drops more than 2 points. It only runs when extraction, scoring or the samples change, at about $0.02 a run.

## Built with Claude Code

Claude Code (Claude Opus) wrote the app in VS Code from fifteen written implementation prompts kept in the repo's `prompts/` folder, and the project's CLAUDE.md sets the scope, the budget and what is out of bounds. The Supabase MCP server, set up in `.mcp.json`, let the agent run migrations, SQL and security checks against the real database. Impeccable, a design skill, checked the interface files through a hook after each edit.
