---
title: Forest Media Récords
order: 3
summary: 'Website for a Medellín music company that develops emerging artists, with its concert calendar, Kick streams, showcases and releases.'
role: 'Solo developer: design, frontend, contact backend and deploy.'
outcome: 'Built in two weeks. Live in Spanish and English, with a contact form, cookie consent and privacy and terms pages.'
stack: [Next.js, TypeScript, OpenAI API, Tailwind CSS]
live: https://forestmediarecords.com
repo: https://github.com/Dani0306/forestmediarecords
image: /projects/forest-media-records.webp
---
## The client

Forest Media Récords is a music company in Medellín that develops emerging artists, with streaming built into the model through support from Kick. The site had to introduce the label, show the roster and keep fans current on concerts, streams and releases. Most visitors arrive from social media, on their phones.

## How it is built

- **Next.js 16**, React 19, TypeScript and Tailwind CSS v4.
- **All content lives in typed data files** (events, artists, streamers, studio prices, legal pages), and all copy lives in one dictionary in Spanish and English, so updates never touch a component.
- **Spanish by default, with an English toggle** that switches on the client. It is instant, and the recorded trade off is that search engines index the Spanish version.
- **One contact endpoint.** The demo and booking forms post to a single route handler that emails the label through Resend, with a hidden honeypot field and a limit of five sends per visitor every ten minutes. Before, the forms opened the visitor's mail app, and submissions were lost whenever a phone had none set up.
- **An AI assistant** answers visitors' questions with `gpt-5-mini`. Its instructions are rebuilt from the site's data files on each request, with the fixed part first so OpenAI can cache it.
- **Analytics only after consent.** Vercel Web Analytics loads only when a visitor accepts all cookies, as the privacy policy promises.

## Decisions on record

The repo keeps an Obsidian vault as the project's memory, with a note for every lasting decision: twenty one so far. One of them sets the content rule: never invent events, dates or bios. A section with no real data shows an empty state instead of placeholders.

## Performance

A dedicated pass cut the hero video from 5.7 MB to 1.08 MB and paused it off screen, swapped live background blur for a copy of the photo blurred ahead of time and moved animations to `transform`. The notes record a production page of about 2.3 MB that scrolls at a steady 60 fps.
