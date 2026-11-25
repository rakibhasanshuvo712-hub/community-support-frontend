# Community Support & Direct Donation Platform — Frontend

Next.js (App Router) + TypeScript + Tailwind CSS + React Hook Form + Zod + TanStack Query frontend for the Sahayata direct donation and community support platform.

## Features

- Bilingual interface: English (`en`) and Bengali (`bn`)
- Donation offers & community help requests feeds with search, category, location, donation type, and urgency filters
- Direct monetary pledges with two-party confirmation (`Pledged` -> `Confirmed` -> `Cancelled`)
- Direct item/service handover workflow
- Private messaging & notifications
- Protected contact details & private supporting documents
- User dashboard & Admin moderation dashboard

## Setup

1. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_API_URL`.
2. Install dependencies and run:
   ```bash
   npm install
   npm run dev
   ```
