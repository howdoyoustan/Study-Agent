# Study Agent

Next.js app that asks questions over PDFs indexed in [Wipro AI Platform (WAIP)](https://devdocs.waip.wiprocms.com/) document completion, with optional 57mm thermal receipt formatting and print.

## Local setup

1. Copy [`.env.example`](./.env.example) to `.env` and fill in `WAIP_API_KEY` (and optionally override `WAIP_DATASET_ID`).
2. `npm install`
3. `npm run dev` → [http://localhost:3000](http://localhost:3000)

Never commit `.env`; it is listed in `.gitignore`.

## Deploy to Vercel (recommended)

1. **Push this project to GitHub** (if it is not already):

   ```bash
   cd "path/to/Study Agent"
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/howdoyoustan/Study-Agent.git
   git push -u origin main
   ```

   If the remote already exists, use `git remote set-url origin https://github.com/howdoyoustan/Study-Agent.git` then `git push -u origin main`.

2. **Import the repo in Vercel**  
   Open [vercel.com](https://vercel.com) → **Add New…** → **Project** → import [howdoyoustan/Study-Agent](https://github.com/howdoyoustan/Study-Agent).  
   Vercel should detect **Next.js**; keep the default build command (`npm run build`) and output.

3. **Environment variables** (Project → **Settings** → **Environment Variables**), for **Production** (and Preview if you want):

   | Name | Value |
   |------|--------|
   | `WAIP_API_KEY` | Your WAIP bearer token |
   | `WAIP_API_ENDPOINT` | `https://api.waip.wiprocms.com` |
   | `WAIP_DATASET_ID` | Optional; defaults to the ID in `lib/constants.ts` if unset |
   | `WAIP_MODEL_NAME` | Optional; default `gpt-5-chat` in code. Must be one of the models WAIP lists for your tenant. |

   `max_output_tokens` is capped per model (WAIP enforces this—e.g. `gpt-4` up to **4096**).

   Do **not** set `NEXT_PUBLIC_*` for the API key—keep secrets server-side only.

4. **Deploy**. After the first deploy, open the production URL and run a query.

### Vercel limits (important)

- **Hobby:** each Serverless Function **`maxDuration` is capped at 300 seconds** (5 minutes). This repo sets `export const maxDuration = 300` on ingest/prepare routes so deploys succeed. **Large PDF ingest** may still hit that wall; use smaller files, local ingest, or the WAIP UI, then deploy only for **queries**.
- **Pro / Enterprise:** you can raise `maxDuration` in those route files (e.g. to `600`) if your plan allows it—see [max duration](https://vercel.com/docs/functions/runtimes#max-duration) and [limits overview](https://vercel.com/docs/concepts/limits/overview#serverless-function-execution-timeout).

## Public repo

Remote: [https://github.com/howdoyoustan/Study-Agent](https://github.com/howdoyoustan/Study-Agent)

## License

Use and deploy according to your needs; WAIP usage is subject to Wipro’s terms.
