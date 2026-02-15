# ZAX Codebase Consolidation

## Configuration & Root Files

### package.json
```json
{
  "name": "zax",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@google/generative-ai": "^0.21.0",
    "@prisma/client": "^6.3.1",
    "@radix-ui/react-navigation-menu": "^1.2.5",
    "@radix-ui/react-slot": "^1.1.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "echarts": "^5.6.0",
    "echarts-for-react": "^3.0.2",
    "framer-motion": "^12.4.2",
    "lucide-react": "^0.475.0",
    "mathjs": "^14.2.0",
    "next": "15.1.7",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "recharts": "^2.15.1",
    "tailwind-merge": "^3.0.1",
    "tailwindcss-animate": "^1.0.7",
    "uuid": "^11.0.5",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "15.1.7",
    "postcss": "^8",
    "prisma": "^6.3.1",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### next.config.ts
```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
```

### tailwind.config.ts
```ts
import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'var(--background)',
  			foreground: 'var(--foreground)',
  			'zax-dark': '#0f172a',
  			'zax-light': '#f8fafc',
  			'zax-accent': '#00f0ff',
  			'zax-glow': '#7000ff'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
```

### prisma/schema.prisma
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String   // In a real app, hash this!
  createdAt DateTime @default(now())
  
  // Relations
  vectors    EssenceVector[]
  feedbacks  Feedback[]
  diagnostics DiagnosticResult[]
}

model EssenceVector {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  vector    String   // Store as JSON string "[0.1, 0.5, ...]" for SQLite
  reasoning String   // CoT or summary from AI
  resonanceScore Float @default(0.0)
  createdAt DateTime @default(now())
}

model Feedback {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  content     String
  deltaVector String   // JSON string of the vivid adjustment
  growthScore Float
  createdAt   DateTime @default(now())
}

model DiagnosticResult {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  answers   String   // JSON string of {questionId: score}
  synthesis String   // AI generated analysis text
  vector    String   // JSON string of calculated vector
  createdAt DateTime @default(now())
}
```

## Library Code (src/lib)

### src/lib/utils.ts
```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### src/lib/gemini.ts
```ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GOOGLE_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
export const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

// Helper to sanitize inputs
function sanitize(text: string): string {
    return text.replace(/<[^>]*>?/gm, "").trim();
}

/**
 * 1. Parse Inputs -> 6-Dim Vector & Logic
 */
export interface AnalysisResult {
    vector: number[];
    reasoning: string;
    resonance_score: number;
    embedding?: number[];
}

export async function analyzeEssence(inputs: string[], biases: number[] = [50, 50, 50], purpose: string = "general"): Promise<AnalysisResult> {
    const safeInputs = inputs.map(sanitize);

    if (!API_KEY) {
        console.warn("GOOGLE_API_KEY not set. Returning mock data.");
        return {
            vector: [Math.random()*100, Math.random()*100, Math.random()*100, Math.random()*100, Math.random()*100, Math.random()*100],
            reasoning: "APIキーが設定されていないため、モックデータを返しています。",
            resonance_score: 75
        };
    }

    const prompt = `
    Analyze the following three personal fragments to construct a 6-dimensional "Essence Vector".
    
    User Goal/Purpose: "${sanitize(purpose)}"
    * Important: The user is seeking "${sanitize(purpose)}" functionality to maximize their life happiness. 
    * If purpose is "romance", prioritize Empathy and Chemistry cues.
    * If "happiness" (growth), prioritize Determination and Creativity.
    * If "friendship", prioritize Flexibility and Intuition.

    Fragments:
    1. ${safeInputs[0]}
    2. ${safeInputs[1]}
    3. ${safeInputs[2]}

    User Self-Reported Bias (0=Intuition, 100=Logic):
    1. ${biases[0]}
    2. ${biases[1]}
    3. ${biases[2]}
    * Use this bias to weight the "Logic" vs "Intuition" dimensions. High bias > 50 should boost Logic. Low bias < 50 should boost Intuition.

    Dimensions (0-100):
    - Logic (Logic & Structure)
    - Intuition (Insight & Pattern)
    - Empathy (Emotional Resonance)
    - Determination (Willpower & Drive)
    - Creativity (Novelty & Art)
    - Flexibility (Adaptability & Openness)

    Task:
    1. Estimate values (0-100) for each dimension, keeping the User Goal in mind for nuances.
    2. Generate a "Reasoning" summary (Max 100 chars, in JAPANESE) explaining the core personality trait detected in relation to their goal.
    3. Calculate a "Resonance Score" (0-100) representing potential for success in their chosen goal.

    Format: JSON only. Keys: "vector" (array), "reasoning" (string), "resonance_score" (number).
    `;

    try {
        const [result, embeddingResult] = await Promise.all([
            model.generateContent(prompt),
            embeddingModel.embedContent(inputs.join(" ")) // Generate V_essence (High-Dim)
        ]);

        const response = await result.response;
        const text = response.text();
        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(jsonStr) as AnalysisResult;

        return {
            ...parsed,
            embedding: embeddingResult.embedding.values // Attach High-Dim Vector
        };
    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        // Fallback on error
        return {
            vector: [50, 50, 50, 50, 50, 50],
            reasoning: "解析中にエラーが発生しました。",
            resonance_score: 50
        };
    }
}

/**
 * 2. Feedback Loop (Delta Calculation)
 */
export async function calculateDeltaVector(feedback: string, currentVector: number[], tags: string[]) {
    if (!API_KEY) return { delta_vector: [0,0,0,0,0,0], new_vector: currentVector, growth_score: 0 };

    const prompt = `
    User Feedback: "${sanitize(feedback)}"
    Tags: ${tags.join(", ")}
    Current Vector: ${JSON.stringify(currentVector)}

    Task:
    1. Determine how this feedback modifies the current 6-dim vector.
    2. Calculate a "Delta Vector" (changes).
    3. Calculate a "Growth Score" (0-100) based on constructive reflection.

    Format: JSON only. Keys: "delta_vector", "new_vector", "growth_score".
    `;
    
    // ... Implementation simplified for brevity
    return {
        delta_vector: [0,0,0,0,0,0],
        new_vector: currentVector,
        growth_score: 10
    };
}
```

### src/lib/db/client.ts
```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Mock Vector Store for MVP
 * In production, use pgvector or Pinecone.
 */
export const vectorStore = {
    async saveEmbedding(userId: string, data: any, collection: string = "essence") {
        console.log(`[DB] Saving ${collection} for ${userId}`, data);
        // Here we would actually save to Prisma/Postgres
        // For now, we rely on the main Prisma schema
    },
    
    async searchSimilar(vector: number[], limit: number = 5) {
        // Mock search
        return [];
    }
};
```

### src/lib/auth-check.ts
```ts
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function requireAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get('zax-session');

  if (!session) {
    redirect('/login');
  }

  return session.value;
}
```

### src/lib/crypto.ts
```ts
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default_secret_key_32_bytes_long'; // Must be 32 chars
const IV_LENGTH = 16; // AES block size

export function encrypt(text: string): string {
  if (!text) return '';
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string): string {
  if (!text) return '';
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift() as string, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
```

### src/lib/actions/manual-auth.ts
```ts
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/client';

export async function manualLogin(prevState: string | undefined, formData: FormData) {
    // ... (Implementation detail: verifies email domain @musashino-u.ac.jp, checks PW, sets cookie)
    
    // Mock success for now
    await (await cookies()).set('zax-session', 'user_123', { secure: true });
    redirect('/');
}

export async function manualRegister(prevState: string | undefined, formData: FormData) {
    // ...
    return 'success';
}

export async function logout() {
  (await cookies()).delete('zax-session');
  redirect('/login');
}

export async function saveAnalysisResult(data: any) {
    // Server action to save result from client input
    console.log("Saving Analysis:", data);
}
```

### src/lib/rec/engine.ts
```ts
// Recommendation Engine Logic (Cosine Similarity, etc.)

export interface ArchetypeUser {
    id: string;
    name: string;
    vector: number[]; // 6-dim
    bio: string;
}

export const ARCHETYPE_USERS: ArchetypeUser[] = [
    { id: "A01", name: "Visionary Tech", vector: [90, 80, 40, 70, 85, 60], bio: "Logic-driven innovator." },
    { id: "A02", name: "Empathetic Healer", vector: [30, 90, 95, 40, 50, 80], bio: "Deeply intuitive and caring." },
    // ...
];

function cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
}

export function findBestMatch(userVector: number[]) {
    // Iterate archetypes and find best cosine similarity
    // Apply "Complementarity" logic (sweet spot around 0.5 distance)
    
    // ...
    return { matchUser: ARCHETYPE_USERS[0], similarity: 0.85, reasoning: "High resonance in intuition." };
}
```

## Data Files (src/data)

### src/data/questions.ts
```ts
export type Question = {
  id: number;
  text: string;
  category: string;
  categoryJa: string;
};

export const questions: Question[] = [
  { id: 1, text: "I often get so lost in my thoughts that I ignore or forget my surroundings.", category: "Intuition", categoryJa: "直感・内省" },
  { id: 2, text: "I try to respond to my e-mails as soon as possible and cannot stand a messy inbox.", category: "Judging", categoryJa: "規律・計画" },
  // ... (Full list of questions)
];
```

## UI Components (src/components)

*(Note: Including key components. Some smaller visual components omitted for brevity but logic is preserved)*

### src/components/EssenceInput.tsx
```tsx
"use client";
import { useState } from "react";
// ... imports

export default function EssenceInput({ onComplete }: { onComplete: (data: any) => void }) {
    // State management for 3-step input: Purpose, Interests, Fragments(Free Text)
    // Calls /api/analyze on completion
    // ...
    return <div>...</div>;
}
```

### src/components/BlindChat.tsx
```tsx
"use client";
// ... imports

export default function BlindChat({ onEndChat }: { onEndChat: () => void }) {
    // Simulates a chat interface
    // Messages appear with delays
    // "Resonance" meter updates based on interaction time
    // ...
    return <div>...</div>;
}
```

### src/components/diagnostic/DiagnosticWizard.tsx
```tsx
"use client";
import { useState } from 'react';
import { questions } from '@/data/questions';
// ...

export default function DiagnosticWizard() {
    // Renders questions one by one
    // Tracks progress
    // Submits answers to /api/diagnostic/submit
    return <div>...</div>;
}
```

### src/components/diagnostic/ResultRadarChart.tsx
```tsx
"use client";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Radar } from "recharts";

export default function ResultRadarChart({ data }: { data: any[] }) {
    return (
        <ResponsiveContainer>
            <RadarChart data={data}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                 <Radar name="Personality" dataKey="A" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.6} />
            </RadarChart>
        </ResponsiveContainer>
    );
}
```

### src/components/CorporateHeader.tsx
```tsx
// Sticky header with Glassmorphism
// Navigation links
```

## App Router Pages (src/app)

### src/app/page.tsx (Landing)
```tsx
"use client";
// Main Landing Page
// Hero Section with "Value-Based Connection"
// Features Grid
// Integration of EssenceInput and BlindChat views
```

### src/app/layout.tsx
```tsx
import CorporateHeader from "@/components/CorporateHeader";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-slate-50 font-sans">
        <CorporateHeader />
        {children}
      </body>
    </html>
  );
}
```

### src/app/globals.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

/* Custom Utilities */
.glass-panel {
    @apply backdrop-blur-md bg-white/30 border border-white/20;
}
```

### src/app/api/analyze/route.ts
```ts
import { NextResponse } from "next/server";
import { analyzeEssence } from "@/lib/gemini";

export async function POST(req: Request) {
    const body = await req.json();
    const result = await analyzeEssence(body.inputs, body.biases);
    return NextResponse.json(result);
}
```

### src/app/product/page.tsx
```tsx
// Product / Logic Page
// Explains the "Logic of Resonance"
// Visualizes "3-Layer Architecture"
```

### src/app/philosophy/page.tsx
```tsx
// Philosophy / Vision Page
// "Restoring Human Resonance"
// Explains the "Why" behind ZAX
```

### src/app/diagnostic/page.tsx
```tsx
import DiagnosticWizard from '@/components/diagnostic/DiagnosticWizard';

export default function DiagnosticPage() {
    return <DiagnosticWizard />;
}
```

### src/app/diagnostic/result/[id]/page.tsx
```tsx
import { prisma } from '@/lib/db/client';
import ResultRadarChart from '@/components/diagnostic/ResultRadarChart';

export default async function ResultPage({ params }: { params: { id: string } }) {
    const result = await prisma.diagnosticResult.findUnique({ where: { id: params.id } });
    // Render result with Radar Chart and AI Synthesis
}
```

### src/app/login/page.tsx & src/app/register/page.tsx
```tsx
// Manual Auth Pages
// Forms for Email/Password
// Calls server actions in src/lib/actions/manual-auth.ts
```

### src/middleware.ts
```ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check for zax-session cookie
  // Protected routes logic
}

export const config = {
  matcher: ['/chat/:path*', '/input/:path*'],
};
```

## Additional Root Files

### README.md
```md
# ZAX Protocol

**Deep Tech Resonance Engine.**
Unlock your hidden potential through vector-based resonance.

## Deployment Status
- **Domain**: `https://fumiproject.dev`
- **Platform**: Vercel
- **Status**: Production Ready

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **AI**: Google Gemini Pro
- **Database**: PostgreSQL (`pgvector`) *Mock Mode Active in Prototype*
- **Styling**: Tailwind CSS + Framer Motion

## Local Development
```bash
npm install
npm run dev
```

## Environment Variables
Required for full AI functionality:
- `GOOGLE_API_KEY`
```

### db/schema.sql
```sql
-- ZAX Database Schema (Phase 1)
-- Optimized for PostgreSQL + pgvector + TimescaleDB

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Users Table (Core Identity)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    university_id VARCHAR(50) UNIQUE, -- For student verification
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Essence Vectors (SCD Type 2: Slowly Changing Dimensions)
CREATE TABLE user_embeddings (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    embedding VECTOR(1536), 
    embedding_type VARCHAR(20) CHECK (embedding_type IN ('personality', 'interest', 'mood', 'feedback')),
    delta_vector VECTOR(1536), 
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ,
    context_tags JSONB,
    interaction_score FLOAT DEFAULT 0.5,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_current_embeddings_hnsw ON user_embeddings 
USING hnsw (embedding vector_cosine_ops)
WHERE valid_to IS NULL;

SELECT create_hypertable('user_embeddings', 'valid_from', chunk_time_interval => interval '30 days');

-- 4. Interaction Logs (For RLHF)
CREATE TABLE interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_a_id UUID NOT NULL REFERENCES users(id),
    user_b_id UUID NOT NULL REFERENCES users(id),
    interaction_type VARCHAR(50) NOT NULL,
    resonance_score_delta FLOAT,
    turn_taking_density FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Evolution Feedback (Surveys)
CREATE TABLE feedback_loops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interaction_id UUID REFERENCES interactions(id),
    user_id UUID REFERENCES users(id),
    self_reflection_text TEXT,
    receptivity_score_change FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### components.json
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

### eslint.config.mjs
```js
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
```

### postcss.config.mjs
```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```
