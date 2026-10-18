---
title: Classly
order: 1
summary: 'A live AI study app with sign in, file storage and subscriptions.'
role: 'Solo developer: product, design, frontend, backend, database and deploy.'
outcome: 'Built in five weeks. Live with Google sign in, AI quizzes, summaries and diagrams, and a paid Pro plan through Paddle.'
stack: [Next.js, TypeScript, Supabase, OpenAI API, Paddle, Tailwind CSS]
live: https://classly-kappa.vercel.app
repo: https://github.com/Dani0306/Classly
image: /projects/classly.webp
---
## The product

Classly is an AI study app for students. After signing in with Google, a student creates a class, with an optional weekly schedule, and fills it with content. Every kind of content runs an AI call: notes are proofread, summaries are written at a chosen length, reminders and homework get a due date and a priority, quizzes come with up to ten multiple choice questions, and diagrams are generated as images. Images, PDFs and Word files attach to anything, and a calendar shows class sessions next to what is due.

## How it is built

- **Next.js 16 App Router**, React 19 and strict TypeScript. Every change to data is a server action with one job, such as `actions/classes/createClass.ts` or `actions/ai/generateQuiz.ts`.
- **Supabase** for Google sign in, Postgres and file storage. Row level security is on for every table, and every policy limits rows to their owner.
- **A proxy** (the new name for middleware in Next 16) sends signed out visitors on `/app` back to the landing page and refreshes the session.
- **The OpenAI Responses API** writes the text with `gpt-5-mini`, and an image generation tool draws the diagrams.

## Limits the database enforces

The free Starter plan and the $12 a month Pro plan include different AI allowances. Those limits live in Postgres, not in the interface. Before any AI call, a database function records the generation against the allowance, so two requests at once cannot overshoot it, and a failed generation gets its credit back.

```ts
// lib/ai/credits.ts, lines 21 to 36
/**
 * Records one generation against the user's allowance before the AI call, so
 * concurrent requests can't overshoot it. Returns the usage id to hand to
 * refundAiCredit if the generation then fails.
 */
export const consumeAiCredit = async (kind: AiKind): Promise<string> => {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase.rpc("consume_ai_credit", {
    p_kind: kind,
  });

  if (error) throw new Error(messageFor(kind, error.message));

  return data as string;
};
```

## Payments with Paddle

Upgrading opens Paddle checkout. A webhook checks Paddle's signature against the raw request body before it trusts anything, then stores each subscription event in its own table, and a database trigger keeps the user's plan in sync. The webhook answers with an error only when a retry could help, so Paddle never retries an event that cannot be linked to a user. Users cannot set their own plan either: column grants only let them edit their name and avatar.

## Built with Claude Code

The repo's CLAUDE.md documents the product, every table and policy, and the data flow, so each session starts knowing the app. Schema changes go through the Supabase MCP server.
