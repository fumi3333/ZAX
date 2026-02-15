# ZAX Protocol v2.0

**Deep Tech Resonance Engine.**
Unlock your hidden potential through vector-based resonance.

## Deployment Status
- **Domain**: `https://fumiproject.dev`
- **Platform**: Vercel / Docker (Self-Hosted DB)
- **Status**: Production Ready
- **Database**: PostgreSQL 16 + `pgvector` (Native Vector Search)

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **AI**: Google Gemini Pro (Analysis & Embedding)
- **Database**: PostgreSQL (`ankane/pgvector` image)
- **Auth**: Custom Auth (`bcryptjs` + Secure HttpOnly Cookies)
- **Styling**: Tailwind CSS + Framer Motion

## Quick Start (Windows/Local)

We have provided an automated script to handle Docker, Database Migration, and App Startup.

```powershell
.\setup_zax.ps1
```

### Manual Setup
If you prefer manual commands:

1. **Start Database**:
   ```bash
   docker-compose up -d
   ```
2. **Setup Schema**:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```
3. **Run App**:
   ```bash
   npm run dev
   ```

## Environment Variables (.env)
Required for full functionality:
- `GOOGLE_API_KEY`: For Gemini AI analysis.
- `DATABASE_URL`: `postgresql://user:password@localhost:5432/zax?schema=public`
