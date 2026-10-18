---
title: Yield
order: 2
summary: 'A stats first tracker that logs every bet placed under one strategy and measures how profitable it is.'
role: 'Solo developer: product, design, frontend, backend, database and deploy.'
outcome: 'Built in three weeks. Live; turns every logged bet into profit, ROI, yield, win rate and streaks, with live scores.'
stack: [Next.js, TypeScript, Supabase, PostgreSQL, Tailwind CSS]
live: https://yield-sepia-one.vercel.app
repo: https://github.com/Dani0306/yield
image: /projects/yield.webp
---
## The product

Yield is a personal tracker for one betting strategy: draw bets picked from a prediction model's export. Every bet is logged with its stake, odds, bookmaker and result, and the app turns that log into the numbers that say whether the strategy works. It is stats first: most screens are tables and figures, entering a bet is fast, and reading the numbers takes no effort.

## What it measures

- **Overall:** net profit, current bank and bank growth, ROI, yield, draw hit rate and average odds.
- **Edge check:** the model's estimated draw rate next to the actual hit rate, so the gap between the two is always in view.
- **Patterns:** the longest winning and losing runs, the most common scores and the bookmakers used most.
- **History:** a cumulative profit chart and every bet, with live scores for the open ones.

## How it is built

- **Next.js 16** with React 19 and TypeScript, and **Supabase** for sign in, Postgres and row level security.
- **Every schema change is a SQL migration** in the repo, sixteen so far, so the database can be rebuilt from scratch.
- **Money and odds are Postgres `numeric`**, never floats, and profit is derived from each bet instead of stored.
- **The staking rule lives in pure functions** (`staking.ts`): every bet stakes the same share of the bankroll. Bets from the earlier progression system keep their history.

## Live scores on a free plan

Scores come from a free football API capped at 100 requests a month. The key never leaves the server, the app only asks once a match may have ended, and every answer is cached: a match's id for a day, its status for a minute. It takes two calls, because the search endpoint's status lags hours behind: search finds the match, then the status endpoint gives the final score.

## Kickoff reminders

A `pg_cron` job checks every minute whether a reminder is due. Only then does it call a Supabase Edge Function, which emails "kicks off in 10 minutes" through Resend with the stake to place and the three best odds found.
