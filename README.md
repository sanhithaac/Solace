# Solace

A fullstack mental wellness platform with private journaling, AI chat, anonymous sharing, community support, and wellness routines.

## What Solace Includes

- AI Chat with RAG memory
- Journal with AI mood/sentiment analysis
- Mood and cycle tracking
- Anonymous X-style support timeline
- Communities with join/leave and request workflow
- Pomodoro and wellness routines
- Crisis support page

## Stack

- Next.js 14 (App Router), React, TypeScript
- MongoDB + Mongoose
- Firebase Auth
- Gemini (`gemini-2.5-flash`)
- Python memory service (`sentence-transformers`, `all-MiniLM-L6-v2`)

## RAG Memory Flow

1. User sends chat/journal input.
2. Python service embeds input and runs vector retrieval (top 8) for same `uid`.
3. Retrieved memories are used as grounding context for Gemini.
4. Assistant reply is generated.
5. User input and assistant output are embedded and stored for future retrieval.

Memory isolation is per user ID (`uid`) to prevent cross-user memory mixing.

## Project Structure

- `app/` pages and UI
- `app/api/` backend API routes
- `models/` Mongoose schemas
- `lib/` backend helpers (`mongodb`, `gemini`, `ragMemory`)
- `python-memory-service/service.py` embedding + retrieval server

## Environment Variables

Create `./.env.local`:

```env
MONGODB_URI=your_mongodb_uri

NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash

PY_EMBEDDING_SERVICE_URL=http://127.0.0.1:8001
```

## Install

```bash
npm install
python -m pip install sentence-transformers
```

## Run (Development)

Terminal 1 (Python memory server):

```bash
npm run memory:serve
```

Terminal 2 (frontend + backend APIs):

```bash
npm run dev
```

Open:

- App: `http://127.0.0.1:3000`
- Memory health: `http://127.0.0.1:8001/health`

## Scripts

- `npm run dev` - start Next.js dev server
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - lint checks
- `npm run memory:serve` - start Python embedding server

## Core APIs

- `POST /api/chat` - chat response with RAG grounding
- `POST /api/journal` - journal save + AI analysis + memory store
- `GET/POST/PATCH /api/anonymous` - anonymous timeline
- `GET/POST/PATCH /api/communities` - community management
- `GET/POST /api/communities/messages` - community chat messages
- `GET/POST /api/communities/requests` - community requests and status

## Notes

- If local cache issues appear, stop server and delete `.next`.
- Keep secrets private; rotate keys if exposed.
- For production, run memory service behind a managed process (PM2/systemd/Docker).
