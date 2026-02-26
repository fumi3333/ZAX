# ZAX - Full Source Code Bundle
生成日時: 2026/2/26 16:49:18

このファイルはZAXプロジェクトの全ソースコードをGeminiによるコードレビュー用にまとめたものです。

## ファイル一覧
1. `prisma\schema.prisma`
2. `src\middleware.ts`
3. `src\app\layout.tsx`
4. `src\app\page.tsx`
5. `src\app\globals.css`
6. `src\app\about\page.tsx`
7. `src\app\philosophy\page.tsx`
8. `src\app\technology\page.tsx`
9. `src\app\product\page.tsx`
10. `src\app\privacy\page.tsx`
11. `src\app\terms\page.tsx`
12. `src\app\diagnostic\page.tsx`
13. `src\app\diagnostic\result\[id]\page.tsx`
14. `src\app\history\page.tsx`
15. `src\app\matching\page.tsx`
16. `src\app\input\page.tsx`
17. `src\app\input\InputClient.tsx`
18. `src\app\api\diagnostic\submit\route.ts`
19. `src\app\api\diagnostic\result\[id]\route.ts`
20. `src\app\api\vectors\history\route.ts`
21. `src\app\api\matching\register\route.ts`
22. `src\app\api\matching\candidates\route.ts`
23. `src\app\api\match\route.ts`
24. `src\app\api\chat\route.ts`
25. `src\app\api\analyze\route.ts`
26. `src\app\api\feedback\route.ts`
27. `src\app\api\reflection\route.ts`
28. `src\app\api\mypage\route.ts`
29. `src\app\api\gemini-logs\route.ts`
30. `src\components\AppNavigation.tsx`
31. `src\components\CorporateHeader.tsx`
32. `src\components\LandingPage.tsx`
33. `src\components\ImpactSimulationGraph.tsx`
34. `src\components\ImpactChart.tsx`
35. `src\components\EssenceInput.tsx`
36. `src\components\EvidenceAnalysis.tsx`
37. `src\components\BlindChat.tsx`
38. `src\components\VectorTransformationVisual.tsx`
39. `src\components\Footer.tsx`
40. `src\components\Providers.tsx`
41. `src\components\diagnostic\DiagnosticWizard.tsx`
42. `src\components\diagnostic\DiagnosticResultClient.tsx`
43. `src\components\diagnostic\ResultRadarChart.tsx`
44. `src\components\diagnostic\CompareRadarChart.tsx`
45. `src\components\chat\PostChatInterview.tsx`
46. `src\components\chat\ReflectionView.tsx`
47. `src\components\product\ThreeLayerModel.tsx`
48. `src\components\ui\card.tsx`
49. `src\components\ui\button.tsx`
50. `src\lib\gemini.ts`
51. `src\lib\gemini-log.ts`
52. `src\lib\db\client.ts`
53. `src\lib\crypto.ts`
54. `src\lib\utils.ts`
55. `src\lib\rec\engine.ts`
56. `src\lib\actions\manual-auth.ts`
57. `src\data\questions.ts`
58. `src\context\DiagnosticContext.tsx`

---

## `prisma\schema.prisma`

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"] // 拡張機能を有効化
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [vector] // pgvector拡張
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String   // bcryptでハッシュ化されたパスワード
  createdAt DateTime @default(now())
  
  // Phase 1.5 Fields
  nickname      String?
  affiliation   String?
  isStudent     Boolean  @default(false)
  domainHash    String?
  contactEmail  String?  // 暗号化された生のメールアドレス（マッチング時の連絡用）
  isCampusMatchRegistered Boolean @default(false)
  
  // Relations
  vectors    EssenceVector[]
  feedbacks  Feedback[]
  diagnostics DiagnosticResult[]
  reflections Reflection[]

  @@map("users")
}

model Reflection {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  partnerName String
  answers     String   // JSON: { aboutPartner, howChanged, grew, togetherFeel } (1-7 each)
  summary     String   // Gemini要約
  createdAt   DateTime @default(now())

  @@map("reflections")
  @@index([userId, createdAt(sort: Desc)])
}

model GeminiLog {
  id        String   @id @default(uuid())
  type      String   // synthesis, matchReasoning, reflectionSummary, analyzeEssence, etc.
  prompt    String   @db.Text
  response  String   @db.Text
  metadata  String?  // JSON
  createdAt DateTime @default(now())

  @@map("gemini_logs")
  @@index([type, createdAt(sort: Desc)])
}

model EssenceVector {
  id             String   @id @default(uuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // 768次元の埋め込みベクトル (RAG検索用 - Gemini Embedding)
  // 変更: vector(6) -> vector(768)
  vector         Unsupported("vector(768)") 
  
  // JSON文字列表現 (フロントエンド表示用バックアップ / 6次元ステータス用)
  vectorJson     String   
  
  // 6次元のステータスベクトル (可視化用: Logic, Intuition, etc.)
  statsVector    String?  // JSON string "[50, 60, ...]"

  reasoning      String   
  resonanceScore Float    @default(0.0)
  createdAt      DateTime @default(now())

  @@map("essence_vectors")
}

model Feedback {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  content     String
  deltaVector String   // JSON string
  growthScore Float
  biometrics  Json?    // For wearable data (heart rate, etc.)
  createdAt   DateTime @default(now())

  @@map("feedbacks")
}

model Interaction {
  id String @id @default(uuid())

  userAId String
  userBId String

  // マッチング時点のベクトル（スナップショット）
  vectorA String // JSON: [80,60,90,45,70,85]
  vectorB String

  // フィードバック（ユーザーAから見たB）
  fulfillmentScore Int?  // 充足感 (1-10)
  willMeetAgain    Int?  // また会いたい (1-10)
  partnerSeemed    Int?  // 相手は楽しそう (1-10)
  growthPotential  Int?  // 成長できそう (1-10)
  feedbackText     String? // 自由記述

  createdAt DateTime @default(now())

  @@map("interactions")
  @@index([userAId, createdAt(sort: Desc)])
}

model DiagnosticResult {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  answers   String   // JSON
  synthesis String   
  vector    String   // JSON
  createdAt DateTime @default(now())

  @@map("diagnostic_results")
}

```

---

## `src\middleware.ts`

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('zax-session')?.value;
  const { pathname } = request.nextUrl;

  // Protected Routes (Campus Launch features)
  const protectedRoutes = ['/matching', '/history'];

  // 1. Check if trying to access protected route without session
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!session) {
      // User is not authenticated/sessionized at all.
      // Redirect to Diagnostic (Onboarding) or Home
      // Let's redirect to Home with a query param to show "Please start here"
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('alert', 'auth_required');
      return NextResponse.redirect(url);
    }
  }

  // 2. Future: Check if session is "Student Verified" for specific routes
  // Middleware can't easily check DB, so we rely on session cookie having a flag (JWT) 
  // or checks in the Route Handler / Page Component (Client).
  // For Phase 1.5 MVP, cookie existence is the base check, 
  // and specific API calls (like /api/matching/candidates) do the deep DB check.

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - diagnostic (publicly accessible)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|diagnostic|$).*)',
  ],
};

```

---

## `src\app\layout.tsx`

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZAX | Value-Based Connection",
  description: "表面的な属性ではなく、価値観と性格特性で気の合う友達・仲間と繋がるプラットフォーム。",
  openGraph: {
    title: "ZAX | Value-Based Connection",
    description: "Connect through values, not just attributes.",
    url: "https://zax.fumiproject.dev",
    siteName: "ZAX",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZAX | Value-Based Connection",
    description: "属性ではなく、価値観で繋がる。",
  },
};

import { Providers } from "@/components/Providers";
import AppNavigation from "@/components/AppNavigation";
import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased bg-slate-50`}
        suppressHydrationWarning
      >
        <Providers>
            <AppNavigation />
            <div className="flex flex-col min-h-screen">
              <div className="flex-1">
                {children}
              </div>
              <Footer />
            </div>
        </Providers>
      </body>
    </html>
  );
}

```

---

## `src\app\page.tsx`

```tsx
import LandingPage from "@/components/LandingPage";

export default function Home() {
  return <LandingPage />;
}

```

---

## `src\app\globals.css`

```css
@import "tailwindcss";

/* Tailwind v4: @theme ブロックでカスタムトークンを定義 */
@theme {
  --font-sans: var(--font-inter), "Noto Sans JP", "Helvetica Neue", Arial, sans-serif;

  --color-zax-primary: #0F172A;
  --color-zax-secondary: #475569;
  --color-zax-accent: #4F46E5;
  --color-zax-surface: rgba(255, 255, 255, 0.7);
  --color-zax-border: #E2E8F0;

  --radius-card: 1.5rem;
  --radius-btn: 9999px;
}

/* CSS変数（shadcn/ui互換） */
:root {
  --background: 210 40% 98%;
  --foreground: 222 47% 11%;
  --card: 0 0% 100%;
  --card-foreground: 222 47% 11%;
  --popover: 0 0% 100%;
  --popover-foreground: 222 47% 11%;
  --primary: 222 47% 11%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222 47% 11%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222 47% 11%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222 47% 11%;
  --radius: 0.75rem;
  --zax-accent: #4F46E5;
  --zax-border: #E2E8F0;
}

/* ダークモード変数 */
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 47.4% 11.2%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 212.7 26.8% 83.9%;
}

/* グローバルスタイル */
* {
  border-color: hsl(var(--border));
}

body {
  font-family: var(--font-inter), "Noto Sans JP", "Helvetica Neue", Arial, sans-serif;
  overflow-x: hidden;
  letter-spacing: -0.02em;
}

/* シャインアニメーション */
@keyframes shine {
  from { transform: translateX(-100%) skewX(-20deg); }
  to { transform: translateX(200%) skewX(-20deg); }
}
.animate-shine {
  animation: shine 1.5s ease-in-out infinite;
}

/* テクニカルスクロールバー */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.5);
}

/* サイバーセレクション */
::selection {
  background: #7C3AED;
  color: #fff;
}

/* スクロールバー非表示ユーティリティ */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
```

---

## `src\app\about\page.tsx`

```tsx
"use client";

import { motion } from "framer-motion";
import { Building2, Sparkles, Lightbulb, Database } from "lucide-react";
import EvidenceAnalysis from "@/components/EvidenceAnalysis";
import ImpactChart from "@/components/ImpactChart";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-40 selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
            {/* 背景のアンビエント効果 (Removed for B&W design) */}
            <div className="fixed inset-0 pointer-events-none z-0 bg-white" />

            {/* 縦スクロールレイアウト */}
            <div className="relative z-10 max-w-[1200px] mx-auto px-4 md:px-8 flex flex-col gap-8 md:gap-12" style={{ paddingTop: '160px' }}>



                {/* ───────────────────────────────────────────── */}
                {/* [B] INFO GRID — 基本情報 */}
                {/* ───────────────────────────────────────────── */}
                <motion.section
                    className="w-full bg-white border border-slate-100 rounded-[32px] p-10 md:p-16 shadow-lg shadow-slate-200/50"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: Building2, label: "Entity", value: "ZAX R.I." },
                            { icon: Sparkles, label: "Mission", value: "Value Connection" },
                            { icon: Lightbulb, label: "Vision", value: "Total Happiness" },
                        ].map((item, i) => (
                            <div key={i} className="bg-slate-50 border border-slate-100 p-8 md:p-10 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-slate-100 hover:border-slate-300 transition-colors duration-300">
                                <item.icon className="w-8 h-8 text-slate-900 mb-4" />
                                <div className="text-[10px] text-slate-400 font-mono mb-2 uppercase tracking-wider">{item.label}</div>
                                <div className="text-lg md:text-xl font-bold text-slate-800">{item.value}</div>
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* ───────────────────────────────────────────── */}
                {/* [C] PHILOSOPHY 1 — 構造的な機会損失 */}
                {/* ───────────────────────────────────────────── */}
                <motion.section
                    className="w-full min-h-[50vh] bg-slate-900 rounded-[32px] p-12 md:p-16 relative overflow-hidden flex flex-col justify-center shadow-xl"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="relative z-10 max-w-2xl">
                        <div className="text-8xl md:text-9xl font-black text-slate-800 mb-4">01</div>
                        <h3 className="text-4xl md:text-5xl font-bold text-white mb-8">構造的な機会損失</h3>
                        <p className="text-slate-300 text-lg md:text-xl leading-relaxed">
                            私たちは、無意識のうちに学歴、年収、外見といった「属性」というフィルターに思考を占領されています。
                            その結果、本来であれば長期的に深い関係を築けたはずの「真に相性の良い相手」を見逃してしまう...
                            これこそが、人生最大の機会損失です。
                        </p>
                    </div>
                </motion.section>

                {/* ───────────────────────────────────────────── */}
                {/* [D] PHILOSOPHY 2 — 潜在意識へのアクセス */}
                {/* ───────────────────────────────────────────── */}
                <motion.section
                    className="w-full min-h-[50vh] bg-white border-2 border-slate-900 text-slate-900 rounded-[32px] p-12 md:p-16 relative overflow-hidden flex flex-col justify-center shadow-sm"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="relative z-10 max-w-2xl">
                        <div className="text-8xl md:text-9xl font-black text-slate-100 mb-4">02</div>
                        <h3 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8">潜在意識へのアクセス</h3>
                        <p className="text-slate-600 text-lg md:text-xl leading-relaxed">
                            真の幸福は、自分が自覚している「条件」の先にある、自分でも気づいていない「潜在的な感情や意識」の中に眠っています。
                            ZAXは、ユーザー一人ひとりの内面を高次元のベクトルとして捉え、長期的な視点での幸福値を最大化します。
                        </p>
                    </div>
                </motion.section>

                {/* ───────────────────────────────────────────── */}
                {/* [E] EVIDENCE — 客観的事実としての「幸福と経済」 */}
                {/* ───────────────────────────────────────────── */}
                <motion.section
                    className="w-full bg-white border border-slate-100 rounded-[32px] p-10 md:p-16 shadow-lg shadow-slate-200/50"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 border-2 border-slate-900 rounded-full mb-6 text-slate-900">
                            <Database size={24} />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                            客観的事実としての<br className="md:hidden" />「幸福と経済」
                        </h2>
                        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                            World Happiness Report 2019のデータを用いた実証分析。
                            GDPと幸福度の相関(<span className="font-mono font-bold text-slate-900">R² &gt; 0.6</span>)をテコに、新しい経済循環を生み出します。
                        </p>
                    </div>
                    
                    {/* チャートとエビデンス — 縦積み */}
                    <div className="flex flex-col gap-8">
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 h-[450px] shadow-sm">
                            <ImpactChart />
                        </div>
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 shadow-sm">
                            <div className="text-slate-900">
                                <EvidenceAnalysis />
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* ───────────────────────────────────────────── */}
                {/* [F] REFERENCES — データソース */}
                {/* ───────────────────────────────────────────── */}
                <motion.section
                    className="w-full bg-slate-900 text-white rounded-[32px] p-10 md:p-16"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.6 }}
                >
                    <h4 className="font-bold text-slate-400 uppercase tracking-widest text-xs mb-8">Data Sources & References</h4>
                    <div className="grid md:grid-cols-2 gap-8 text-sm text-slate-400 font-mono leading-relaxed">
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <span className="text-slate-500 mt-0.5">▸</span>
                                World Happiness Report 2019
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-slate-500 mt-0.5">▸</span>
                                The World Bank (GDP per capita)
                            </li>
                        </ul>
                    </div>
                </motion.section>

            </div>
        </div>
    );
}

```

---

## `src\app\philosophy\page.tsx`

```tsx
"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import ImpactChart from "@/components/ImpactChart";

export default function PhilosophyPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-40 overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
            {/* Ambient Background - Light & Organic */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-blue-100/50 rounded-full blur-[180px] mix-blend-multiply" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-purple-100/50 rounded-full blur-[150px] mix-blend-multiply" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6 pt-32">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.0 }}
                    className="mb-24 text-center"
                >
                    <div className="inline-block px-4 py-1.5 mb-6 border border-slate-200 rounded-full bg-white/50 backdrop-blur-md text-[10px] tracking-[0.2em] text-slate-500 uppercase">
                        ZAX PHILOSOPHY
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight mb-8 text-slate-900">
                        死ぬ時に「幸福だった」と<br />
                        言い切るために
                    </h1>
                </motion.div>

                {/* Section 1: My Original Experience */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-24 prose prose-lg prose-slate max-w-none text-slate-600 leading-relaxed"
                >
                    <span className="font-mono text-xs text-blue-600 tracking-widest mb-4 block">01. 原体験</span>
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">構造的な機会損失</h2>
                    <p>
                        私個人の究極の目標は、人生の終わりに「この人生は幸福だった」と心から思えることです。しかし、現在の社会構造を見渡したとき、多くの人がその機会を構造的に奪われているのではないかと感じています。
                    </p>
                    <p>
                        私たちは、無意識のうちに学歴、年収、外見といった「属性」というフィルターに思考を占領されています。その結果、本来であれば長期的に深い関係を築けたはずの「真に相性の良い相手」を見逃してしまったり、目先の記号的な条件で繋がりを選んでしまったりすることで、大きな機会損失が生まれていると考えています。
                    </p>
                </motion.section>

                {/* Section 2: Subconscious & Happiness Maximization */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-24"
                >
                    <span className="font-mono text-xs text-blue-600 tracking-widest mb-4 block">02. 幸福の最大化</span>
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">潜在意識へのアクセス</h2>
                    <div className="prose prose-lg prose-slate max-w-none text-slate-600 leading-relaxed mb-8">
                        <p>
                            真の幸福は、自分が自覚している「条件」の先にある、自分でも気づいていない「潜在的な感情や意識」の中に眠っていると私は信じています。
                            ZAXは、ユーザー一人ひとりの内面を高次元のベクトルとして捉え、長期的な視点での幸福値を最大化することを目的としたシステムです。
                        </p>
                        <ul className="list-none pl-0 space-y-2 mt-4">
                            <li><strong className="text-slate-900">・潜在意識の解析：</strong> ユーザー自身も言語化できていない「心地よさ」や「価値観」をデータとして抽出します。</li>
                            <li><strong className="text-slate-900">・長期目線での最適化：</strong> 一過性の盛り上がりではなく、人生単位で互いを高め合える「相性の良さ」を演算します。</li>
                        </ul>
                        <p className="mt-6">
                            このシステムの目的関数は、単なるマッチングの成立ではなく、「ユーザー個人の長期的な幸福量（<span className="font-serif italic font-bold text-slate-900">H<sub>long-term</sub></span>）の最大化」であると考えています。
                        </p>
                    </div>

                    {/* Math Visual */}
                    <div className="flex justify-center my-12">
                        <div className="bg-white border border-slate-200 px-8 py-6 rounded-xl shadow-sm">
                            <span className="font-serif text-2xl md:text-3xl text-blue-600 italic tracking-wider">
                                Maximize <span className="mx-2 text-slate-400">∑</span> H<sub className="text-sm">t</sub>(V<sub className="text-sm">subconscious</sub>)
                            </span>
                        </div>
                    </div>
                </motion.section>

                {/* Section 3: Chain of Thought */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-24 prose prose-lg prose-slate max-w-none text-slate-600 leading-relaxed"
                >
                    <span className="font-mono text-xs text-blue-600 tracking-widest mb-4 block">03. 納得の共有</span>
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Chain of Thought</h2>
                    <p>
                        また、ZAXにおいては「なぜこの人と響き合うのか」というプロセスも大切にしたいと考えています。
                        AIがユーザーの潜在意識をどう解釈したのか、その思考の推論プロセス（Chain of Thought）を共有することで、ユーザーは自分自身の新しい一面に気づくことができます。
                    </p>
                    <div className="border-l-4 border-blue-500/30 pl-6 my-6 italic text-slate-500 bg-slate-50 py-4 pr-4 rounded-r-lg">
                        「このCoTが生み出す『納得感』こそが、属性の壁を超えて深く繋がるための土台になると確信しています。」
                    </div>
                </motion.section>

                {/* Section 4: Innovation as Byproduct */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-24"
                >
                    <span className="font-mono text-xs text-blue-600 tracking-widest mb-4 block">04. 副産物としてのイノベーション</span>
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">個人の幸福が社会を変える</h2>
                    <div className="prose prose-lg prose-slate max-w-none text-slate-600 leading-relaxed mb-8">
                        <p>
                            個々人が自分にとって最適な場所、最適なパートナー、そして真の自己に繋がることができたとき、その社会は勝手に良くなっていくはずです。
                        </p>
                        <ul className="list-none pl-0 space-y-2 mt-4">
                            <li><strong className="text-slate-900">・イノベーションの加速：</strong> 深いレベルで価値観の合う個体が繋がることで、これまでにない創造的な火花が散ります。</li>
                            <li><strong className="text-slate-900">・経済への正の影響：</strong> 孤独による停滞やミスマッチによる損失が消え、個々の知性が最大出力で駆動するようになります。</li>
                        </ul>
                        <p className="mt-6">
                            こうした社会の発展やイノベーションは、あくまで<strong className="text-slate-900">「個人の幸福を追求した結果」</strong>として現れる副産物に過ぎないというのが私の考えです。
                            ZAXが何よりも優先するのは、あなたという個人が、あなたの人生を肯定できる「接続」を提供することです。
                        </p>
                    </div>

                    {/* Chart as "Evidence of Byproduct" */}
                    <div className="mt-8 w-full bg-white rounded-2xl border border-slate-100 p-4 shadow-sm min-h-[500px]">
                        <ImpactChart />
                    </div>
                </motion.section>

                {/* Section 5: Future with BMI */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-32 prose prose-lg prose-slate max-w-none text-slate-600 leading-relaxed"
                >
                    <span className="font-mono text-xs text-blue-600 tracking-widest mb-4 block">05. 未来へ</span>
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">BMIが普及した世界に向けて</h2>
                    <p>
                        今はまだスマートフォンを通じたインターフェースですが、このZAXという構想は、将来的にBMI（脳マシンインタフェース）が普及した世の中で、さらに真価を発揮できると確信しています。
                    </p>
                    <p>
                        言葉や属性といったフィルターを完全に脱ぎ捨て、心と心が直接響き合う。
                        そんな、誰もが自分の人生を幸福だと思える未来を、私は作っていきたいと考えています。
                    </p>
                </motion.section>

                <div className="mt-20 text-center pb-20">
                    <Link href="/" className="group relative inline-flex items-center gap-4 text-white bg-blue-600 hover:bg-blue-700 px-10 py-5 rounded-full font-bold transition-all shadow-lg hover:shadow-xl shadow-blue-500/20">
                        <span className="text-sm tracking-widest uppercase">プロトコルを開始 (Start)</span>
                        <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div >
        </div >
    );
}

```

---

## `src\app\technology\page.tsx`

```tsx
"use client";

import { motion } from "framer-motion";
import { Database, Network, ShieldCheck, Layers, ArrowRight, BrainCircuit, TrendingUp, Users } from "lucide-react";

const fade = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true } as const,
  transition: { duration: 0.5 },
};

export default function TechnologyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-40">
      {/* Subtle ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[-5%] w-[700px] h-[700px] bg-blue-50/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-violet-50/30 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-28 lg:pt-36">
        {/* ─── HERO ─── */}
        <motion.div {...fade} className="mb-20 lg:mb-28">
          <span className="inline-block px-3 py-1 mb-6 rounded-full bg-white text-slate-500 text-xs font-medium tracking-wider border border-slate-200/60 shadow-sm">
            PRODUCT ARCHITECTURE
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
            ZAX: Product Architecture
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
            ZAXは、個人の内面的特性を多次元データとして捉え、相互作用による「個人の変容」を
            記録・最適化する、<span className="font-semibold text-slate-900">動的コミュニティOS</span>です。
          </p>
        </motion.div>

        {/* ─── 1. DATA ARCHITECTURE ─── */}
        <motion.section {...fade} className="mb-20 lg:mb-28">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Database className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold">1. データ・アーキテクチャ</h2>
          </div>
          <p className="text-slate-600 mb-8 max-w-2xl">
            ZAXは、ユーザーを固定された属性ではなく、流動的な<span className="font-semibold text-slate-900">「Identity Vector」</span>として定義します。
          </p>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-6 py-4 font-semibold text-slate-500 text-xs tracking-wider uppercase">カテゴリ</th>
                  <th className="text-left px-6 py-4 font-semibold text-slate-500 text-xs tracking-wider uppercase">保持するデータ項目</th>
                  <th className="text-left px-6 py-4 font-semibold text-slate-500 text-xs tracking-wider uppercase hidden md:table-cell">役割</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-50">
                  <td className="px-6 py-4 font-semibold text-slate-900">Core Trait</td>
                  <td className="px-6 py-4 text-slate-600">価値観、思考のプロセス、深層的な関心事</td>
                  <td className="px-6 py-4 text-slate-500 hidden md:table-cell">価値観の近さを測る基準点</td>
                </tr>
                <tr className="border-b border-slate-50">
                  <td className="px-6 py-4 font-semibold text-slate-900">Interaction Log</td>
                  <td className="px-6 py-4 text-slate-600">接続時間、反応率、対話の深度</td>
                  <td className="px-6 py-4 text-slate-500 hidden md:table-cell">価値観の合致を測定する</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-slate-900">Delta State</td>
                  <td className="px-6 py-4 text-slate-600">興味関心の移行や言語表現の変化</td>
                  <td className="px-6 py-4 text-slate-500 hidden md:table-cell">個人の変容（変化量）を記録する</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* ─── 2. TRANSFORMATION TRACKING ─── */}
        <motion.section {...fade} className="mb-20 lg:mb-28">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-violet-600" />
            </div>
            <h2 className="text-2xl font-bold">2. 相互変容トラッキング</h2>
          </div>
          <p className="text-slate-600 mb-8 max-w-2xl">
            ZAXの最大の特徴は、単なる「出会い」で終わらず、その後の
            <span className="font-semibold text-slate-900">「変容（Transformation）」</span>をシステムが評価する点にあります。
          </p>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-xl shadow-slate-200/40">
              <h3 className="font-bold text-slate-900 mb-3">影響力の解析</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                ユーザーAとBが接触した際、双方のデータセットにどのような変化が生じたかを時系列で追跡します。
              </p>
            </div>
            <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-xl shadow-slate-200/40">
              <h3 className="font-bold text-slate-900 mb-3">変容のフィードバック</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                「誰と関わった時に、どのような新しい視点や行動変容が生まれたか」を蓄積し、成長を引き起こすための予測モデルに反映させます。
              </p>
            </div>
          </div>
        </motion.section>

        {/* ─── 3. MATCHING LOGIC ─── */}
        <motion.section {...fade} className="mb-20 lg:mb-28">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Network className="w-4 h-4 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold">3. 仲間探しロジックのフロー</h2>
          </div>
          <p className="text-slate-600 mb-8 max-w-2xl">
            システムは以下のサイクルを自動で回し続け、コミュニティ全体の繋がりを強化します。
          </p>
          <div className="space-y-4">
            {[
              { num: "01", title: "高精度な推論（Reasoning）", desc: "入力された断片的なデータから、推論型AIを用いてユーザーの潜在的な「価値観の合致点」を特定します。" },
              { num: "02", title: "未来予測シミュレーション", desc: "候補者同士が繋がった場合、互いにどのような変容をもたらすかを予測し、期待値の高い組み合わせを選出します。" },
              { num: "03", title: "相性エンジンの実行", desc: "算出されたマッチ度に基づいて接続を提案します。" },
              { num: "04", title: "変容データの書き戻し", desc: "実際の対面・対話後の変化を再度ベクトル化し、データベースを更新します。" },
            ].map((step) => (
              <div key={step.num} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xl shadow-slate-200/40 flex gap-5">
                <span className="text-sm font-bold text-slate-300 mt-0.5">{step.num}</span>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">{step.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Formula */}
          <div className="mt-8 bg-slate-900 rounded-2xl p-8 text-center">
            <p className="text-slate-400 text-xs mb-3 tracking-wider uppercase">Resonance Score Formula</p>
            <p className="text-white font-mono text-lg">
              R<sub>score</sub> = ∫<sub>t₀</sub><sup>t₁</sup> f(A, B) dt
            </p>
            <p className="text-slate-500 text-xs mt-3">
              R<sub>score</sub>：期間 t における価値観の合致と変容の累積値
            </p>
          </div>
        </motion.section>

        {/* ─── 4. GOVERNANCE ─── */}
        <motion.section {...fade} className="mb-20 lg:mb-28">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold">4. テクニカル・ガバナンス</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-xl shadow-slate-200/40">
              <h3 className="font-bold text-slate-900 mb-3">高セキュアなインフラ構成</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                暗号化通信の徹底と、個人の内面データを匿名化した状態での計算処理。
              </p>
            </div>
            <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-xl shadow-slate-200/40">
              <h3 className="font-bold text-slate-900 mb-3">スケーラビリティ</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                小規模なコミュニティから大規模な組織まで、負荷に応じて動的にリソースを拡張するクラウドアーキテクチャ。
              </p>
            </div>
          </div>
        </motion.section>

        {/* ─── PHASE 1 ─── */}
        <motion.section {...fade} className="mb-20">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 p-8 lg:p-10">
            <span className="inline-block px-3 py-1 mb-5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold tracking-wider">
              PHASE 1: EXPERIENCE MIRRORING
            </span>
            <h2 className="text-2xl font-bold mb-4">学内幸福ナビゲーション</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              新入生の孤独を解消し、データに基づいた自己理解と最適な友人作りを支援するフェーズ1。
              AIに「重みを更新」させる前段階として、「ユーザーの外部記憶」を構築し、自己変容の軌跡を可視化します。
            </p>

            <div className="grid md:grid-cols-2 gap-5 mb-6">
              {[
                { title: "動的16タイプ診断", desc: "日々の行動ログから「今のタイプ」をリアルタイム推定。自分でも気づかなかった自分を知る。" },
                { title: "AI自己理解壁打ち", desc: "RAGを用いて過去の自分の思考と対話。悩み事に対し、過去の成功体験からAIが助言。" },
                { title: "ベクトル・コネクト", desc: "潜在的な「価値観の近さ」で新入生同士を繋ぎ、本当に気の合う友達に出会える確率を向上。" },
                { title: "成長の可視化", desc: "入学時から現在までの思考ベクトルの軌跡をグラフ化。大学生活での変化・成長が一目でわかる。" },
              ].map((item) => (
                <div key={item.title} className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                  <h4 className="font-bold text-slate-900 text-sm mb-2">{item.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm mb-2">フェーズ2への接続</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                このフェーズで蓄積された「変化のプロセス（Before → Action → After）」の膨大なログは、
                後のフェーズで行う基盤モデルのファインチューニングや進化的マージの「正解データ」として活用されます。
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

```

---

## `src\app\product\page.tsx`

```tsx
"use client";

import { motion } from "framer-motion";
import { Brain, Network, GitMerge, RefreshCw, MousePointer2, ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import ThreeLayerModel from "@/components/product/ThreeLayerModel";

export default function ProductPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30">
      
      {/* Header */}
      <header className="fixed top-0 w-full z-50 px-6 py-6 flex justify-between items-center mix-blend-difference">
         <div className="font-black text-xl tracking-tight text-white">ZAX / PROTOCOL</div>
         <Link href="/" className="text-xs font-mono font-bold hover:text-indigo-400 transition-colors">BACK TO TOP</Link>
      </header>

      {/* 縦スクロールレイアウト — 各カードをフルワイドで縦積み */}
      <div className="pt-32 pb-20 px-4 md:px-8 max-w-[1200px] mx-auto flex flex-col gap-8 md:gap-12">

        {/* ───────────────────────────────────────────── */}
        {/* [A] TITLE CARD — ヒーロー */}
        {/* ───────────────────────────────────────────── */}
        <motion.section 
            className="w-full min-h-[60vh] bg-slate-900/50 border border-white/5 rounded-[32px] p-12 md:p-16 relative overflow-hidden group flex flex-col justify-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.6 }}
        >
            {/* 背景グロー */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/30 transition-colors duration-700" />
            <div className="relative z-10 max-w-2xl">
                <div className="flex items-center gap-3 mb-8">
                    <span className="px-4 py-1.5 bg-white/10 rounded-full text-xs font-bold tracking-widest text-indigo-300 border border-white/5">LOGIC v2.0</span>
                </div>
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter mb-8 leading-[0.85]">
                    The Logic<br/><span className="text-indigo-500">of Resonance.</span>
                </h1>
                <p className="text-slate-400 font-medium text-lg md:text-xl max-w-lg leading-relaxed">
                    直感的な「運命」の裏側にある、<br/>
                    あなたのための緻密な計算式。
                </p>
            </div>
        </motion.section>

        {/* ───────────────────────────────────────────── */}
        {/* [B] PARADIGM — Frozen to Fluid */}
        {/* ───────────────────────────────────────────── */}
        <motion.section 
            className="w-full min-h-[50vh] bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 rounded-[32px] p-12 md:p-16 flex flex-col justify-between group hover:border-indigo-500/30 transition-colors"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.6 }}
        >
            <div className="flex justify-between items-start mb-12">
                <span className="text-8xl md:text-9xl font-black text-slate-800 group-hover:text-slate-700 transition-colors">01</span>
                <Brain className="text-indigo-500 w-12 h-12" />
            </div>
            <div className="max-w-xl">
                <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">Frozen to Fluid</h3>
                <p className="text-slate-400 text-lg leading-relaxed">
                    静的属性（過去）ではなく、動的意志（未来）を計算。<br/>
                    <span className="text-indigo-400">常に変化するあなた</span>を捉え続ける。
                    従来のマッチングは、年齢・職業・趣味といった「固定された属性」でフィルタリングします。
                    しかしZAXは、あなたの「今この瞬間の思考の方向性」をベクトル化し、
                    リアルタイムに更新される動的なプロフィールで価値観の合う相手を見つけます。
                </p>
            </div>
        </motion.section>

        {/* ───────────────────────────────────────────── */}
        {/* [C] MECHANISM — Evolutionary Loop */}
        {/* ───────────────────────────────────────────── */}
        <motion.section 
            className="w-full min-h-[50vh] bg-indigo-600 text-white rounded-[32px] p-12 md:p-16 flex flex-col justify-between relative overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.6 }}
        >
             {/* 回転アニメーション背景 */}
             <motion.div 
                className="absolute inset-0 bg-gradient-to-tr from-indigo-900/50 to-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                style={{ originX: 0.5, originY: 0.5 }}
             >
                <div className="absolute inset-20 border border-white/10 rounded-full border-dashed" />
                <div className="absolute inset-32 border border-white/5 rounded-full border-dashed" />
             </motion.div>
             
             <div className="relative z-10">
                <RefreshCw className="mb-8 opacity-80 w-12 h-12" />
                <h3 className="text-5xl md:text-6xl font-bold leading-[0.9] mb-4">Evolutionary<br/>Loop</h3>
                <div className="text-sm opacity-70 mt-4 font-mono uppercase tracking-widest">Interaction → Update → Evolve</div>
             </div>
             
             <div className="relative z-10 mt-12 max-w-xl">
                <p className="text-white/80 text-lg leading-relaxed">
                    ZAXは一度マッチして終わりではありません。
                    対話するたびにあなたのベクトルは更新され、
                    より精度の高い相性の良い相手が見つかるようになります。
                    使えば使うほど、あなた自身の「本質」も可視化されていく — 
                    これがEvolutionary Loopです。
                </p>
             </div>

             <ArrowUpRight className="absolute bottom-12 right-12 text-white/30 w-16 h-16" />
        </motion.section>

        {/* ───────────────────────────────────────────── */}
        {/* [D] 3-LAYER MODEL — アーキテクチャ */}
        {/* ───────────────────────────────────────────── */}
        <motion.section 
            className="w-full min-h-[70vh] bg-slate-900 border border-white/5 rounded-[32px] p-12 md:p-16 flex flex-col relative overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.6 }}
        >
            {/* 上部グラデーションライン */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-indigo-500 to-blue-500" />
            
            <div className="mb-12">
                <span className="text-8xl md:text-9xl font-black text-slate-800">02</span>
                <h3 className="text-4xl md:text-5xl font-bold text-white mt-4">3-Layer Architecture</h3>
                <p className="text-slate-400 text-lg mt-4 max-w-lg">
                    不動の基盤（CORE）と、瞬時に変わる適応層（LAYER 3）。<br/>
                    3層構造により、安定性と柔軟性を両立しています。
                </p>
            </div>

            {/* 3層モデルビジュアル — 中央揃えで大きく表示 */}
            <div className="flex-1 flex items-center justify-center min-h-[300px]">
                <div className="w-full max-w-md">
                    <ThreeLayerModel />
                </div>
            </div>
        </motion.section>

        {/* ───────────────────────────────────────────── */}
        {/* [E] SWARM INTELLIGENCE — 集合知能 */}
        {/* ───────────────────────────────────────────── */}
        <motion.section 
            className="w-full min-h-[50vh] bg-white text-slate-900 rounded-[32px] p-12 md:p-16 flex flex-col justify-between group hover:shadow-[0_0_60px_rgba(255,255,255,0.1)] transition-shadow"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.6 }}
        >
            <div>
                 <div className="flex items-center gap-3 mb-6">
                    <GitMerge className="text-indigo-600 w-8 h-8" />
                    <span className="font-mono font-bold text-sm text-slate-400 tracking-widest">03 COLLECTIVE</span>
                 </div>
                 <h3 className="text-5xl md:text-6xl font-black mb-8">Swarm Intelligence</h3>
                 <p className="text-slate-600 font-medium text-lg md:text-xl leading-relaxed max-w-2xl">
                     個々のモデルは孤立せず、成功体験を共有。<br/>
                     人類全体の幸福の最適解を探索する分散型知能。<br/><br/>
                     あるペアの対話から得られた「価値観の合致パターン」は、
                     匿名化された上で全体のマッチングアルゴリズムにフィードバックされます。
                     これにより、ユーザーが増えるほど精度が向上する集合知能を実現しています。
                 </p>
            </div>
            
            {/* ノード接続ビジュアル */}
            <div className="mt-12 w-full h-32 bg-slate-50 rounded-2xl relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex -space-x-4">
                        {[...Array(8)].map((_,i) => (
                            <motion.div 
                                key={i} 
                                className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-200 border-3 border-white"
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </motion.section>

        {/* ───────────────────────────────────────────── */}
        {/* [F] ROADMAP — Phase 1 Launch */}
        {/* ───────────────────────────────────────────── */}
        <motion.section 
            className="w-full min-h-[40vh] bg-slate-900 border border-white/5 rounded-[32px] p-12 md:p-16 flex flex-col justify-center items-center text-center hover:bg-slate-800/50 transition-colors cursor-pointer group"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.6 }}
        >
            <MousePointer2 className="mb-8 text-emerald-500 group-hover:scale-125 transition-transform duration-500" size={48} />
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-4">Phase 1 Launch</h3>
            <div className="text-emerald-400 font-bold font-mono text-2xl">2026.04</div>
            <div className="text-slate-500 text-lg mt-4">Musashino University</div>
            <p className="text-slate-500 mt-6 max-w-md">
                武蔵野大学を皮切りに、学生同士の「本質的なつながり」を創出するプロトタイプを展開します。
            </p>
        </motion.section>

        {/* ───────────────────────────────────────────── */}
        {/* CTA */}
        {/* ───────────────────────────────────────────── */}
        <div className="mt-12 text-center">
            <Link 
                href="/" 
                className="inline-flex items-center gap-4 px-16 py-8 bg-white text-slate-950 rounded-full font-black text-2xl hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.1)]"
            >
                START PROTOTYPE
                <ArrowRight size={28} />
            </Link>
        </div>

      </div>
    </div>
  );
}

```

---

## `src\app\privacy\page.tsx`

```tsx
"use client";

import { motion } from "framer-motion";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <div className="h-16" />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-2 border-black p-8 md:p-12 shadow-sm"
        >
          <h1 className="text-3xl font-black mb-8 border-b-4 border-black pb-4 uppercase tracking-tighter">
            Privacy Policy
          </h1>
          
          <div className="space-y-8 text-sm leading-relaxed">
            <section>
              <h2 className="text-lg font-bold mb-3 border-l-4 border-black pl-3">1. 個人情報の収集と管理</h2>
              <p>
                ZAX（以下「本サービス」）は、ユーザーのプライバシーを最優先事項として設計されています。
                本サービスでは、以下の情報を収集・管理します。
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>メールアドレス</strong>: 入力されたメールアドレスは、送信された瞬間にSHA-256アルゴリズムを用いてハッシュ化（匿名化）されます。生のメールアドレスはデータベースに保存されず、管理者も閲覧できません。</li>
                <li><strong>ニックネーム</strong>: 診断結果の表示に使用されます。</li>
                <li><strong>診断データ</strong>: 性格特性ベクトルとして数値化され、同一ドメイン内での仲間探しアルゴリズム計算に使用されます。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3 border-l-4 border-black pl-3">2. データの利用目的</h2>
              <p>
                収集したデータは、以下の目的のためにのみ利用されます。
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>ユーザーごとの診断履歴の管理および表示</li>
                <li>価値観に基づいた仲間の候補生成</li>
                <li>AI（Gemini API）による性格分析レポートの生成</li>
                <li>学内コミュニティの活性化に関する統計データの作成（個人を特定できない形での利用）</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3 border-l-4 border-black pl-3">3. AI（人工知能）の利用について</h2>
              <p>
                本サービスはGoogleのGemini APIを利用してテキスト分析を行っています。
                APIに送信されるデータは、診断の回答内容とハッシュ化された識別子のみであり、個人を特定できる情報は含まれません。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3 border-l-4 border-black pl-3">4. 第三者への提供</h2>
              <p>
                本サービスは、ユーザーの同意なく個人データを第三者に提供することはありません。
                ただし、法令に基づく要請がある場合を除きます。
              </p>
            </section>

            <section className="pt-8 border-t border-slate-100 italic text-slate-400">
              <p>最終更新日: 2026年2月25日</p>
              <p>ZAX プロジェクト運営チーム</p>
            </section>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

```

---

## `src\app\terms\page.tsx`

```tsx
"use client";

import { motion } from "framer-motion";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <div className="h-16" />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-2 border-black p-8 md:p-12 shadow-sm"
        >
          <h1 className="text-3xl font-black mb-8 border-b-4 border-black pb-4 uppercase tracking-tighter">
            Terms of Service
          </h1>
          
          <div className="space-y-8 text-sm leading-relaxed">
            <section>
              <h2 className="text-lg font-bold mb-3 border-l-4 border-black pl-3">1. 本サービスの目的</h2>
              <p>
                ZAXは、武蔵野大学の学生を対象とした、認知科学に基づく自己理解と価値観ベースのコミュニティ形成を支援する学術・体験型プロジェクトです。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3 border-l-4 border-black pl-3">2. 利用資格</h2>
              <p>
                本サービスは、以下の条件を満たす方のみ利用可能です。
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>18歳以上の大学生であること。</li>
                <li>武蔵野大学のメールアドレスを保持していること。</li>
                <li>本規約およびプライバシーポリシーに同意すること。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3 border-l-4 border-black pl-3">3. 禁止事項</h2>
              <p>本サービスを利用するにあたり、以下の行為を禁止します。</p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li><strong>過度な異性交際を目的とした利用</strong>: 本サービスは出会い系サイトではありません。学術的、学友的な関わり以外を主目的とした利用は固く禁じます。</li>
                <li><strong>他者への嫌がらせ・ハラスメント</strong>: 提案された相手や多人数に対する誹謗中傷、不適切な連絡。</li>
                <li><strong>虚偽の情報入力</strong>: 他者の学籍番号やメールアドレスを無断で使用する行為。</li>
                <li><strong>システムへの攻撃</strong>: 本サービスの運営を妨げるような不正アクセスや改ざん。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3 border-l-4 border-black pl-3">4. コミュニケーションと安全性</h2>
              <p>
                本サービスは価値観の近いユーザーを提案する機能を提供しますが、実際の交流は各ユーザーの責任において行ってください。本サービス内での直接的な無差別チャット機能は提供しておらず、安全性を考慮した設計となっています。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3 border-l-4 border-black pl-3">5. 免責事項</h2>
              <p>
                本サービスにおけるAIの分析結果はあくまで参考材料であり、その正確性や妥当性を保証するものではありません。また、本サービスを通じて生じたユーザー間のトラブルについて、運営側は一切の責任を負いません。
              </p>
            </section>

            <section className="pt-8 border-t border-slate-100 italic text-slate-400">
              <p>最終更新日: 2026年2月25日</p>
              <p>ZAX プロジェクト運営チーム</p>
            </section>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

```

---

## `src\app\diagnostic\page.tsx`

```tsx
import DiagnosticWizard from '@/components/diagnostic/DiagnosticWizard';

export const metadata = {
  title: '性格・価値観診断 | ZAX',
  description: 'AIがあなたの性格と価値観を分析し、価値観の合う友達や仲間との繋がりをサポートします。',
};

export default function DiagnosticPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center pt-12 pb-12 px-4 space-y-8">
      <div className="w-full max-w-4xl">
        <DiagnosticWizard />
      </div>
    </div>
  );
}

```

---

## `src\app\diagnostic\result\[id]\page.tsx`

```tsx
import DiagnosticResultClient from "@/components/diagnostic/DiagnosticResultClient";

export default async function DiagnosticResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DiagnosticResultClient resultId={id} />;
}

```

---

## `src\app\history\page.tsx`

```tsx
import ImpactSimulationGraph from '@/components/ImpactSimulationGraph';

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-black text-slate-900 tracking-widest sm:text-4xl">
            診断履歴
          </h1>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <ImpactSimulationGraph />
        </div>
      </div>
    </div>
  );
}

```

---

## `src\app\matching\page.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Candidate {
  userId: string;
  nickname: string;
  affiliation: string;
  reasoning: string;
  statsVector: string | null;
  distance: number;
  contactEmail?: string | null;
}

export default function MatchingPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCandidates() {
      try {
        const res = await fetch('/api/matching/candidates');
        const data = await res.json();
        if (data.success) {
          setCandidates(data.candidates);
        } else {
          setError(data.message || data.error || 'マッチング候補の取得に失敗しました。');
        }
      } catch (e) {
        setError('エラーが発生しました。');
      } finally {
        setLoading(false);
      }
    }
    fetchCandidates();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col justify-center items-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium uppercase tracking-widest text-xs animate-pulse">Searching...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[80vh] flex flex-col justify-center items-center p-4">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl shadow-sm border border-red-100 max-w-md text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="font-semibold text-lg mb-2">アクセスできません</p>
          <p className="text-sm opacity-90 mb-4">{error}</p>
          <Link href="/diagnostic" className="inline-block bg-white text-red-600 font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors border border-red-200">
            診断を受ける
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight sm:text-4xl">
            あなたと<span className="text-slate-900">価値観の合う</span>仲間たち
          </h1>
          <div className="mt-4 space-y-4">
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              学内であなたと感性が近く、気の合う友達やプロジェクトメンバーになれる可能性が高いユーザーを提案します。
            </p>
            <div className="bg-slate-100/50 rounded-xl p-4 max-w-2xl mx-auto border border-slate-200">
              <p className="text-xs text-slate-500 font-bold leading-relaxed text-left">
                ※当機能は、学内での健全な友達・仲間探しやプロジェクトメンバーとの出会いをサポートするものです。「出会い系サイト規制法」に定義されるインターネット異性紹介事業（恋愛や交際を主目的としたいわゆる出会い系サイト・マッチングアプリ）には該当しません。
              </p>
            </div>
          </div>
        </div>

        {candidates.length === 0 ? (
          <div className="text-center bg-white p-12 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-slate-500 text-lg">現在、条件に合う候補が見つかりませんでした。</p>
            <p className="text-slate-400 text-sm mt-2">学内の利用者が増えるのをお待ちください。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.map((candidate, idx) => {
               // Calculate a pseudo-compatibility score just for UI (100 - (distance / 2) * 100 scaled)
               // pgvector cosine distance: 0 (exact match) to 2 (exact opposite).
               const compatibility = Math.max(0, Math.min(100, Math.round((1 - candidate.distance / 2) * 100)));
               
               return (
                <Card key={candidate.userId} className="overflow-hidden shadow-none transition-all duration-300 border-gray-200 rounded-none bg-white group">
                  <div className="h-1 w-full bg-black opacity-100 transition-opacity"></div>
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl font-bold text-slate-800">
                          {candidate.nickname || "匿名ユーザー"}
                        </CardTitle>
                        <CardDescription className="font-medium text-slate-500 mt-1">
                          {candidate.affiliation || "武蔵野大学"}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">マッチ度</span>
                        <div className="text-2xl font-black text-slate-800">
                          {compatibility}<span className="text-sm font-bold text-slate-400 ml-1">%</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-600 leading-relaxed italic relative">
                      <span className="text-2xl absolute -top-1 -left-1 text-slate-300">"</span>
                      <p className="relative z-10 px-2">{candidate.reasoning || "あなたと深い部分で価値観を共有しています。"}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 pb-6 px-6">
                    <a 
                      href={candidate.contactEmail ? `mailto:${candidate.contactEmail}` : '#'} 
                      onClick={(e) => {
                        if (!candidate.contactEmail) {
                          e.preventDefault();
                          alert('相手の連絡先メールアドレスが設定されていません。');
                        }
                      }}
                      className="w-full"
                    >
                      <Button className="w-full bg-black hover:bg-gray-800 text-white transition-colors py-6 rounded-none font-bold uppercase tracking-widest text-xs shadow-none">
                        大学メールで連絡をとる
                      </Button>
                    </a>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

```

---

## `src\app\input\page.tsx`

```tsx
import InputClient from './InputClient';

export default async function InputPage() {

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <InputClient />
    </main>
  );
}

```

---

## `src\app\input\InputClient.tsx`

```tsx
'use client';

import { useState } from 'react';
import EssenceInput, { EssenceInputData } from '@/components/EssenceInput';
import VectorTransformationVisual from '@/components/VectorTransformationVisual';
import { useRouter } from 'next/navigation';

export default function InputClient() {
  const router = useRouter();
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async (data: EssenceInputData) => {
    const inputs = data.fragments.filter((f) => f.trim());
    if (inputs.length === 0) {
      setError('少なくとも1つ以上の入力が必要です');
      return;
    }

    setAnalyzing(true);
    setError(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs,
          biases: data.biases,
          purpose: data.purpose || 'general',
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || '分析に失敗しました');
      }

      router.push('/matching');
    } catch (e) {
      setError(e instanceof Error ? e.message : '分析に失敗しました');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl space-y-8">
        <header className="text-center">
             <h1 className="text-3xl font-bold text-slate-900 mb-2">Resonance Input</h1>
             <p className="text-slate-500">Discover your core vector.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative">
                {analyzing && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                        <div className="text-center">
                            <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                            <p className="text-sm text-slate-600 font-medium">分析中...</p>
                        </div>
                    </div>
                )}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}
                <EssenceInput onComplete={handleComplete} />
            </div>
            
            <div className="hidden md:block sticky top-20">
                <div className="bg-slate-900 rounded-2xl p-6 shadow-xl aspect-square flex items-center justify-center overflow-hidden relative">
                    <VectorTransformationVisual />
                    <div className="absolute bottom-4 left-4 text-xs text-slate-400 font-mono">
                        VECTOR_SPACE_VISUALIZER // LISTENING
                    </div>
                </div>
            </div>
        </div>
      </div>
  );
}

```

---

## `src\app\api\diagnostic\submit\route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma, vectorStore } from '@/lib/db/client';
import { questions, effectiveScore } from '@/data/questions';
import { model, embeddingModel } from '@/lib/gemini';
import { logGemini } from '@/lib/gemini-log';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { signSession, verifySession } from '@/lib/crypto';

// Allow execution up to 60 seconds to accommodate long Gemini responses
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { answers, freeText } = await req.json();

    if (!answers || Object.keys(answers).length === 0) {
      return NextResponse.json({ success: false, error: 'No answers provided' }, { status: 400 });
    }

    // 1. Authenticate / Create User
    const cookieStore = await cookies();
    let sessionId = verifySession(cookieStore.get('zax-session')?.value);

    if (!sessionId) {
      sessionId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      cookieStore.set('zax-session', signSession(sessionId), {
        httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365,
      });
    }

    let userId = sessionId;
    let user = null;
    
    // B. If no user yet (Guest fallback)
    if (!user) {
        user = await prisma.user.findUnique({ where: { id: userId } });
        
        // もしDBにユーザーが存在しない場合（古いCookieが残っている場合など）
        if (!user) {
            const uniqueSuffix = Date.now() + '_' + Math.random().toString(36).slice(2, 7);
            const guestEmail = `guest_${uniqueSuffix}@zax.guest`; 
            
            try {
                user = await prisma.user.create({
                    data: {
                        email: guestEmail,
                        password: "guest-password",
                        isStudent: false,
                    }
                });
            } catch (e) {
                console.error("Failed to create fallback guest user:", e);
                user = await prisma.user.findFirst(); // ultimate fallback
            }
        }
    }
    
    if (!user) {
        return NextResponse.json({ success: false, error: 'User session could not be established' }, { status: 500 });
    }

    userId = user.id;
    if (userId !== sessionId) {
         cookieStore.set('zax-session', signSession(userId), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 });
    }

    // 2. Construct Analysis Prompt
    let profileText = "以下の性格診断データに基づき、この人物の性格、価値観、行動特性を詳細に分析し、日本語で記述してください。\n\n";
    
    if (freeText && freeText.trim()) {
        profileText += `## ユーザーによる自由記述（生の声）\n"${freeText.trim()}"\n\n`;
    }
    
    profileText += "## カテゴリ別スコア傾向（1-7尺度）\n";
    const sortedAnswerIds = Object.keys(answers).map(Number).sort((a,b) => a-b);
    const categoryScores: Record<string, {sum: number, count: number}> = {};
    
    for (const id of sortedAnswerIds) {
      const q = questions.find(q => q.id === id);
      const rawScore = answers[id];
      if (q && typeof rawScore === 'number') {
        if (!categoryScores[q.categoryJa]) {
            categoryScores[q.categoryJa] = { sum: 0, count: 0 };
        }
        categoryScores[q.categoryJa].sum += effectiveScore(q, rawScore);
        categoryScores[q.categoryJa].count += 1;
      }
    }

    profileText += "## カテゴリ別スコア傾向\n";
    for (const [cat, data] of Object.entries(categoryScores)) {
        const avg = (data.sum / data.count).toFixed(1);
        profileText += `- ${cat}: 平均 ${avg}/7.0\n`;
    }

    profileText += "\n## 詳細回答データ\n";
    for (const id of sortedAnswerIds) {
        const q = questions.find(q => q.id === id);
        const score = answers[id];
        if (q) {
            profileText += `Q${id} [${q.categoryJa}]: "${q.text}" -> ${score}\n`;
        }
    }

    profileText += `\n\n指示: 
    1. 上記の数値データ（スコア）に加え、もし「自由記述」がある場合はその文脈や熱量を深く考慮してください。
    2. 数値と記述内容に乖離がある場合は、言語化された「生の声」により深層心理が隠れていると仮定して分析してください。
    3. この人物の深層心理、行動特性、そして「どういう状態がその人にとっての真の充足（幸福）か」について、プロの認知科学者・心理分析官としての視点から詳細なレポートを作成してください。
    `;

    profileText += `
    以下の見出し（Markdown形式の h3 '### '）を必ず含め、非常に読み応えのある長文で出力してください。出力内に「AI」という単語は絶対に含めないでください。

    ### 認知ベクトルと本質的な強み
    （この人物が持つ特徴的な強みと、世界をどう捉えているかの分析。500文字程度で深掘りしてください）

    ### 深層的な価値観とモチベーションの源泉
    （表面的な欲求ではなく、何がこの人物の心を動かし、情熱を傾けさせるのかについて。具体的かつ深く考察してください）

    ### 摩擦が生じやすい環境と弱み
    （どのような状況でストレスを感じやすいか、その理由は何か。またそれをどう乗り越えるべきか）

    ### 充足感（幸福）を感じる条件
    （スピリチュアルで胡散臭い表現は避け、脳科学的・環境的・社会的な側面から客観的かつ具体的に「こういう環境・役割において最もパフォーマンスと幸福度が高まる」と記述すること）

    ### 推奨される行動パターン（Next Action）
    （この特性を活かして、今後の学業やキャリア、人間関係をどう構築していくべきか。具体的な行動指針を3つ以上提示してください）

    ### 総評（今後の進化に向けたフィードバック）
    （全体を括るアドバイスと、より高い次元へ自己統合していくためのエール）`;

    // 3. Call Gemini for Synthesis
    let synthesis = "";
    try {
        const result = await model.generateContent(profileText);
        const response = await result.response;
        synthesis = response.text();
        if (!synthesis) throw new Error("Empty response from Gemini");
        logGemini("synthesis", profileText, synthesis).catch(() => {});
    } catch (e: any) {
        console.error("Gemini API Error (Synthesis):", e);
        // Log the error to the DB for debugging
        await logGemini("error", profileText, `ERROR: ${e.message || String(e)}`, { stack: e.stack }).catch(() => {});
        
        throw new Error("現在、サーバーへのアクセスが集中しており、分析エンジンが応答しません。しばらく経ってから再度お試しください。");
    }

    // 4. 6次元ベクトルをカテゴリスコアから算出（論理性, 直感力, 共感性, 意志力, 創造性, 柔軟性）
    const CATEGORY_ORDER = ['Social', 'Empathy', 'Discipline', 'Openness', 'Emotional'] as const;
    const CATEGORY_JA: Record<string, string> = { Social: '外向性', Empathy: '協調性', Discipline: '誠実性', Openness: '開放性', Emotional: '情緒安定性' };
    const rawByCat = CATEGORY_ORDER.map((c) => {
        const d = categoryScores[CATEGORY_JA[c]] || { sum: 0, count: 0 };
        const avg = d.count > 0 ? d.sum / d.count : 4;
        return Math.round(((avg - 1) / 6) * 100);
    });
    const [social, empathy, discipline, openness, emotional] = rawByCat;
    const vector: number[] = [
        discipline,                          // 論理性 ← 誠実性
        openness,                            // 直感力 ← 開放性
        empathy,                             // 共感性 ← 協調性
        discipline,                          // 意志力 ← 誠実性
        openness,                            // 創造性 ← 開放性
        Math.round((emotional + social) / 2), // 柔軟性 ← 情緒安定性・外向性
    ];

    // 5. Generate 768-dim Embedding for RAG
    let embedding: number[] = [];
    
    if (!process.env.GOOGLE_API_KEY) {
        throw new Error("GOOGLE_API_KEY is not configured.");
    }

    try {
        const embeddingResult = await embeddingModel.embedContent(synthesis);
        // Force slice to 768 dims to match Prisma schema vector(768)
        embedding = embeddingResult.embedding.values.slice(0, 768);
    } catch (e) {
        console.error("Embedding API Error:", e);
        throw new Error("ベクトル生成に失敗しました。");
    }

    // 6. Save to Database
    const diagnosticResult = await prisma.diagnosticResult.create({
      data: {
        userId: userId,
        answers: JSON.stringify(answers),
        synthesis: synthesis,
        vector: JSON.stringify(embedding), // Start storing 768-dim in DB 'vector' field? Schema says 'vectorJson'
        // Wait, Schema DiagonosticResult.vector is string. 
        // Let's store the 6-dim stats there? Or the 768? 
        // Usage of DiagnosticResult.vector? 
        // It's likely used for specific diagnostic retrieval. 
        // Let's store the 6-dim there for now as it was before, or store both?
        // Let's store the 6-dim stats in DiagnosticResult for backward compat if any.
        // Actually, the prompt says "vector: JSON.stringify(vector)" where vector is 6-dim.
        // Let's keep it.
      },
    });

    // Also save to EssenceVector for matching & History
    await vectorStore.saveEmbedding(
        userId,
        embedding,  // 768-dim
        vector,     // 6-dim stats
        "性格診断結果",
        1.0 
    );

    return NextResponse.json({ 
        success: true, 
        id: diagnosticResult.id,
        synthesis: synthesis,
        answers: answers,
    });

  } catch (error: any) {
    console.error('Diagnostic Error:', error);
    return NextResponse.json({ 
        success: false, 
        error: 'Internal Server Error' 
    }, { status: 500 });
  }
}

```

---

## `src\app\api\diagnostic\result\[id]\route.ts`

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await prisma.diagnosticResult.findUnique({
      where: { id },
    });
    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const answers = JSON.parse(result.answers) as Record<string, number>;
    return NextResponse.json({
      id: result.id,
      synthesis: result.synthesis,
      answers,
    });
  } catch (e) {
    console.error("Diagnostic result fetch error:", e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

```

---

## `src\app\api\vectors\history\route.ts`

```typescript

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/crypto';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // 1. Authenticate
    const cookieStore = await cookies();
    const sessionId = verifySession(cookieStore.get('zax-session')?.value);

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = sessionId;

    // 2. Fetch Vector History
    // We want the vectors ordered by time to show evolution.
    // We should probably limit to last N vectors to avoid huge payload, but for now let's get all (or last 50).
    const vectors = await prisma.essenceVector.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        take: 50,
        select: {
            id: true,
            vectorJson: true, 
            statsVector: true, 
            reasoning: true,
            resonanceScore: true,
            createdAt: true
        }
    } as any);

    // Parse vectorJson to array
    const formattedVectors = vectors.map((v: any) => ({
        ...v,
        vector: JSON.parse(v.vectorJson)
    }));

    return NextResponse.json({ 
        success: true, 
        data: formattedVectors 
    });

  } catch (error: any) {
    console.error('Vector History API Error:', error);
    return NextResponse.json({ 
        success: false, 
        error: 'Internal Server Error' 
    }, { status: 500 });
  }
}

```

---

## `src\app\api\matching\register\route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { verifySession, encrypt } from '@/lib/crypto';

export async function POST(req: Request) {
  try {
    const { email, nickname } = await req.json().catch(() => ({}));
    
    const cookieStore = await cookies();
    const sessionId = verifySession(cookieStore.get('zax-session')?.value);

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    let isStudent = false;
    let domainHash = null;
    let userEmail = "";
    const userNickname = nickname || "Anonymous User";

    if (email && typeof email === 'string') {
        const lowerEmail = email.toLowerCase().trim();
        if (lowerEmail.endsWith('@musashino-u.ac.jp') || lowerEmail.endsWith('@stu.musashino-u.ac.jp')) {
            isStudent = true;
            domainHash = crypto.createHash('sha256').update('musashino-u.ac.jp').digest('hex');
        }
        userEmail = crypto.createHash('sha256').update(lowerEmail).digest('hex');
    }

    // セッションID（ユーザーID）に基づいて対象ユーザーを検索
    let user = await prisma.user.findUnique({
      where: { id: sessionId }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // すでに同じメアドを持つ本アカウントが存在する場合、
    // 今のゲストアカウントの本登録（Update）ではなく、そちらにマージするのが理想的ですが、
    // MVPの簡略化のため、既存メールがあればそれを更新するか、エラーにせずそのまま進めます。
    if (userEmail) {
        const existingEmailUser = await prisma.user.findUnique({ where: { email: userEmail }});
        if (existingEmailUser && existingEmailUser.id !== user.id) {
            // セキュリティ修正: パスワード確認なしにCookieを上書きするのはアカウント乗っ取りリスク。
            // 「すでに登録済み」そとゆるエラーを返す。
            return NextResponse.json({
                success: false,
                error: 'このメールアドレスは既に別のアカウントで登録されています。'
            }, { status: 409 });
        }
    }

    const updateData: any = {
        isCampusMatchRegistered: true,
        nickname: userNickname,
    };
    if (userEmail) {
        updateData.email = userEmail;
    }
    if (email && typeof email === 'string') {
        updateData.contactEmail = encrypt(email.toLowerCase().trim());
    }
    if (isStudent) {
        updateData.isStudent = true;
        updateData.domainHash = domainHash;
        updateData.affiliation = "Musashino Univ.";
    }

    // 現在のゲストアカウントを本登録
    await prisma.user.update({
      where: { id: user.id },
      data: updateData
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Campus Match Registration Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

```

---

## `src\app\api\matching\candidates\route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma, vectorStore } from '@/lib/db/client';
import { cookies } from 'next/headers';
import { verifySession, decrypt } from '@/lib/crypto';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionId = verifySession(cookieStore.get('zax-session')?.value);

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionId },
      include: { vectors: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    if (!user.isStudent || !user.domainHash) {
      return NextResponse.json({ 
        success: false, 
        error: 'Student verification required',
        message: 'この機能を利用するには、学内メールアドレスでの認証が必要です。' 
      }, { status: 403 });
    }

    const latestVector = user.vectors[0];
    let vector: number[] = [];
    
    if (latestVector && latestVector.vectorJson) {
        try {
            const parsed = JSON.parse(latestVector.vectorJson);
            if (Array.isArray(parsed)) vector = parsed;
        } catch (e) {
            console.error("Vector parsing error", e);
        }
    }
    
    if (vector.length === 0) {
        // Fallback or error handling
        return NextResponse.json({ success: false, error: 'No vector data found' }, { status: 400 });
    }

    const rawCandidates = await vectorStore.searchCandidates(
        vector,
        user.domainHash,
        10,
        user.id
    ) as any[];

    const candidates = rawCandidates.map(c => ({
        ...c,
        contactEmail: c.contactEmail ? decrypt(c.contactEmail) : null
    }));

    return NextResponse.json({ success: true, candidates });

  } catch (error: any) {
    console.error('Candidate fetch error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

```

---

## `src\app\api\match\route.ts`

```typescript
import { NextResponse } from "next/server";
import { findTopMatches } from "@/lib/rec/engine";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { vector, topN = 5, synthesis, optimalSimilarity } = body;

    if (!vector || !Array.isArray(vector) || vector.length !== 6) {
      return NextResponse.json(
        { error: "Invalid vector: must be a 6-dim array" },
        { status: 400 }
      );
    }

    const opt = typeof optimalSimilarity === 'number' && optimalSimilarity >= 0.1 && optimalSimilarity <= 0.9
      ? optimalSimilarity
      : undefined;

    const matches = await findTopMatches(vector, topN, synthesis, opt);

    return NextResponse.json({
      success: true,
      matches,
    });
  } catch (error) {
    console.error("Match API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

```

---

## `src\app\api\chat\route.ts`

_ファイルが見つかりませんでした: ENOENT: no such file or directory, open 'c:\ZAX\src\app\api\chat\route.ts'_

---

## `src\app\api\analyze\route.ts`

```typescript
import { NextResponse } from "next/server";
import { analyzeEssence } from "@/lib/gemini";
import { vectorStore } from "@/lib/db/client";
import { z } from "zod";
import { encrypt, verifySession } from "@/lib/crypto";
import { cookies } from "next/headers";

export const runtime = "nodejs";

// Input Validation Schema
const AnalyzeRequestSchema = z.object({
    inputs: z.array(z.string().min(1, "Input cannot be empty")).min(1, "At least one input is required"),
    biases: z.array(z.union([z.string(), z.number()])).optional(),
    purpose: z.string().optional(),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // 1. Input Validation (Zod)
        const validation = AnalyzeRequestSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ 
                error: "Invalid inputs", 
                details: validation.error.issues 
            }, { status: 400 });
        }

        const { inputs, biases, purpose } = validation.data;

        // 2. AI Analysis
        const numericBiases = biases?.map((b) => Number(b));
        const result = await analyzeEssence(inputs, numericBiases, purpose || "general");

        // [DB] Persist the analysis result
        const cookieStore = await cookies();

        const sessionId = verifySession(cookieStore.get('zax-session')?.value);
        const userId = sessionId || "guest_" + new Date().getTime();
        
        // Encrypt reasoning before saving to protect user privacy
        const encryptedReasoning = encrypt(result.reasoning);

        // Bug fix: 2nd arg must be 768-dim embedding (for pgvector), 3rd is 6-dim statsVector (for display)
        const embedding768 = result.embedding || new Array(768).fill(0); // analyzeEssence always returns embedding
        const stats6dim = result.vector || null; // 6-dim for radar chart

        await vectorStore.saveEmbedding(
            userId,
            embedding768,   // 768次元 ← pgvector vector(768)に保存
            stats6dim,      // 6次元  ← statsVectorに保存
            encryptedReasoning,
            result.resonance_score || 0
        );

        // Return PLAIN text to the user (they need to see their own result immediately)
        return NextResponse.json(result);

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

```

---

## `src\app\api\feedback\route.ts`

```typescript
import { NextResponse } from "next/server";
import { calculateDeltaVector } from "@/lib/gemini";
import { prisma } from "@/lib/db/client";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/crypto";

export const runtime = "nodejs";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { feedback, currentVector, tags } = body;

        if (!feedback) {
            return NextResponse.json({ error: "Feedback required" }, { status: 400 });
        }

        // Calculate Delta Vector based on feedback emotional shift
        const deltaResult = await calculateDeltaVector(feedback, currentVector, tags);

        // [DB] Persist Feedback & Delta (Prisma)
        try {
            const cookieStore = await cookies();
            const sessionId = verifySession(cookieStore.get('zax-session')?.value);
            const userId = sessionId || "guest_" + Date.now(); // Fallback for testing/no session
            
            await prisma.feedback.create({
                data: {
                    content: feedback,
                    deltaVector: JSON.stringify(deltaResult.delta_vector),
                    growthScore: deltaResult.growth_score,
                    user: {
                        connectOrCreate: {
                            where: { id: userId },
                            create: { 
                                id: userId, 
                                email: "guest@example.com",
                                password: "guest_dummy_password"
                            }
                        }
                    }
                }
            });
        } catch (dbError) {
            console.error("DB Save Error:", dbError);
        }

        return NextResponse.json({
            success: true,
            delta: deltaResult.delta_vector,
            new_vector: deltaResult.new_vector,
            growth_score: deltaResult.growth_score
        });

    } catch (error) {
        console.error("Feedback API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

```

---

## `src\app\api\reflection\route.ts`

```typescript
import { NextResponse } from "next/server";
import { generateReflectionSummary } from "@/lib/gemini";
import { prisma } from "@/lib/db/client";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/crypto";

const LIKERT_LABELS: Record<number, string> = {
  1: "同意しない",
  2: "やや同意しない",
  3: "どちらかといえば同意しない",
  4: "中立",
  5: "どちらかといえば同意する",
  6: "やや同意する",
  7: "同意する",
};

function answersToText(answers: {
  aboutPartner: number;
  howChanged: number;
  grew: number;
  togetherFeel: number;
}): string {
  return [
    `相手はどうでしたか: ${LIKERT_LABELS[answers.aboutPartner] ?? answers.aboutPartner}`,
    `自分はどう変わった: ${LIKERT_LABELS[answers.howChanged] ?? answers.howChanged}`,
    `成長を実感できた: ${LIKERT_LABELS[answers.grew] ?? answers.grew}`,
    `一緒にいてどうだった: ${LIKERT_LABELS[answers.togetherFeel] ?? answers.togetherFeel}`,
  ].join("\n");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { interviewText: legacyText, answers, partnerName } = body;

    let textForGemini: string;
    let answersJson: string;
    const partner = partnerName || "相手";

    if (answers && typeof answers === "object") {
      const { aboutPartner, howChanged, grew, togetherFeel } = answers;
      if (
        typeof aboutPartner !== "number" ||
        typeof howChanged !== "number" ||
        typeof grew !== "number" ||
        typeof togetherFeel !== "number"
      ) {
        return NextResponse.json({ error: "Invalid answers format" }, { status: 400 });
      }
      textForGemini = answersToText(answers);
      answersJson = JSON.stringify(answers);
    } else if (legacyText && typeof legacyText === "string") {
      textForGemini = legacyText;
      answersJson = "{}";
    } else {
      return NextResponse.json({ error: "interviewText or answers required" }, { status: 400 });
    }

    const summary = await generateReflectionSummary(textForGemini);

    const cookieStore = await cookies();
    const userId = verifySession(cookieStore.get("zax-session")?.value);
    if (userId) {
      try {
        const p = prisma as { reflection?: { create: (args: any) => Promise<any> } };
        if (p?.reflection) {
          await p.reflection.create({
            data: {
              userId,
              partnerName: partner,
              answers: answersJson,
              summary,
            },
          });
        }
      } catch (e) {
        console.warn("Reflection DB save failed:", e);
      }
    }

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Reflection API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

```

---

## `src\app\api\mypage\route.ts`

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/crypto";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = verifySession(cookieStore.get("zax-session")?.value);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const p = prisma as {
      diagnosticResult?: { findMany: (args: any) => Promise<any> };
      reflection?: { findMany: (args: any) => Promise<any> };
    };

    const [diagnostics, reflections] = await Promise.all([
      p.diagnosticResult
        ? p.diagnosticResult.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 50,
          })
        : [],
      p.reflection
        ? p.reflection.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 50,
          })
        : [],
    ]);

    return NextResponse.json({
      diagnostics: diagnostics || [],
      reflections: reflections || [],
    });
  } catch (e) {
    console.error("Mypage fetch error:", e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

```

---

## `src\app\api\gemini-logs\route.ts`

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { cookies } from "next/headers";

/** 管理用: Geminiログ一覧（簡易。本番では認証・権限が必要） */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // セキュリティ修正: 管理者専用キー(ADMIN_API_KEY)を用いた認証
    const adminKey = request.headers.get("Authorization") || searchParams.get("key");
    if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
        return NextResponse.json({ error: "Unauthorized access to logs" }, { status: 401 });
    }

    const type = searchParams.get("type");
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "20", 10));

    const p = prisma as { geminiLog?: { findMany: (args: any) => Promise<any> } };
    if (!p?.geminiLog) {
      return NextResponse.json({ logs: [] });
    }

    const logs = await p.geminiLog.findMany({
      where: type ? { type } : undefined,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ logs });
  } catch (e) {
    console.error("Gemini logs fetch error:", e);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}

```

---

## `src\components\AppNavigation.tsx`

```tsx
'use client';

import { useState } from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { logout } from '@/lib/actions/manual-auth';

export default function AppNavigation() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Simple breadcrumb logic
  const pathSegments = pathname.split('/').filter(Boolean);

  const navLinks = [
    { href: '/about', label: 'About' },
    { href: '/philosophy', label: 'Vision' },
    { href: '/technology', label: 'Product' },
    { href: '/history', label: 'Your History' },
  ];
  
  return (
    <>
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center font-bold text-xl text-slate-900">
                ZAX
              </Link>
            </div>

            {/* Menu button — Always visible */}
            <div className="flex items-center">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-2 text-slate-700 hover:text-black transition-colors"
                aria-label="メニューを開く"
              >
                <Menu size={24} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        {/* Breadcrumbs - only show when not on home, and hide on result pages with UUIDs */}
        {pathSegments.length > 0 && !pathname.includes('/result/') && (
          <div className="border-b border-black">
            <div className="max-w-7xl mx-auto px-6 lg:px-10 py-2 text-[10px] sm:text-xs text-black overflow-x-auto whitespace-nowrap uppercase tracking-widest font-bold">
                <Link href="/" className="hover:bg-black hover:text-white px-2 py-1 transition-colors">HOME</Link>
                {pathSegments.map((segment, index) => {
                    const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
                    return (
                        <span key={segment}>
                            <span className="mx-2">/</span>
                            <Link href={href} className={index === pathSegments.length - 1 ? "font-black text-black px-2 py-1 bg-gray-100" : "hover:bg-black hover:text-white px-2 py-1 transition-colors"}>
                                {segment.replace('-', ' ')}
                            </Link>
                        </span>
                    );
                })}
            </div>
          </div>
        )}
      </nav>

      {/* Fullscreen Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-white z-[100] flex flex-col"
          >
            {/* Overlay Header */}
            <div className="flex items-center justify-between px-6 lg:px-10 h-16 border-b border-slate-100">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="text-xl font-bold text-slate-900"
              >
                ZAX
              </Link>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-slate-700 hover:text-black transition-colors"
                aria-label="メニューを閉じる"
              >
                <X size={24} strokeWidth={2} />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 flex flex-col justify-center px-10 md:px-20 lg:px-32 bg-slate-50/30">
              <div className="space-y-1 sm:space-y-4">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`block py-4 sm:py-6 px-4 text-3xl sm:text-5xl font-black transition-all ${
                        pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                          ? 'text-white bg-black'
                          : 'text-black bg-transparent border-2 border-transparent hover:border-black hover:bg-black hover:text-white'
                      } tracking-tighter`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + navLinks.length * 0.05 }}
                    className="mt-8 pt-6 border-t border-slate-200/60"
                 >
                    <form action={logout}>
                      <button
                        type="submit"
                        className="block py-4 px-4 text-xl sm:text-2xl font-bold text-slate-400 hover:text-red-500 transition-colors tracking-widest uppercase"
                      >
                        Sign out
                      </button>
                    </form>
                 </motion.div>
              </div>
            </nav>

            {/* Footer */}
            <div className="px-10 md:px-20 lg:px-32 pb-10 pt-6 text-[10px] text-slate-400 tracking-widest uppercase">
              &copy; 2026 ZAX
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

```

---

## `src\components\CorporateHeader.tsx`

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Menu } from "lucide-react";
import { logout } from '@/lib/actions/manual-auth';

const navLinks = [
  { label: "ABOUT US", href: "/about" },
  { label: "VISION", href: "/philosophy" },
  { label: "PRODUCT", href: "/technology" },
  { label: "DIAGNOSTIC", href: "/diagnostic" },
];

export default function CorporateHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white/70 backdrop-blur-md border-b border-slate-200/40">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-slate-900 hover:text-slate-700 transition-colors"
            >
              ZAX
            </Link>

            {/* Hamburger Button — always visible */}
            <button
              className="p-2 text-slate-700 hover:text-slate-900 transition-colors"
              onClick={() => setIsMenuOpen(true)}
              aria-label="メニューを開く"
            >
              <Menu size={22} strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      {/* Fullscreen Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-white z-[100] flex flex-col"
          >
            {/* Header row */}
            <div className="flex items-center justify-between px-6 lg:px-10 h-16 border-b border-slate-100">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="text-xl font-bold text-slate-900"
              >
                ZAX
              </Link>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-slate-700 hover:text-slate-900 transition-colors"
                aria-label="メニューを閉じる"
              >
                <X size={22} strokeWidth={2} />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 flex flex-col justify-center px-10 md:px-20 lg:px-32">
              <div className="space-y-2">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + i * 0.06, duration: 0.3 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="block py-5 text-3xl md:text-5xl font-bold text-slate-900 hover:text-slate-500 tracking-tight transition-colors border-b border-slate-100"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + navLinks.length * 0.06, duration: 0.3 }}
                    className="pt-6 mt-4 border-t border-slate-100"
                >
                    <form action={logout}>
                      <button
                        type="submit"
                        className="block w-full text-left py-4 text-xl md:text-2xl font-bold text-slate-400 hover:text-red-500 transition-colors tracking-tight"
                      >
                        LOGOUT
                      </button>
                    </form>
                </motion.div>
              </div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + navLinks.length * 0.06, duration: 0.3 }}
                className="mt-12"
              >
                <Link
                  href="/diagnostic"
                  onClick={() => setIsMenuOpen(false)}
                  className="inline-flex items-center justify-center px-8 py-4 bg-slate-900 text-white text-base font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-sm hover:shadow-md"
                >
                  無料で診断を開始
                </Link>
              </motion.div>
            </nav>

            {/* Footer */}
            <div className="px-10 md:px-20 lg:px-32 pb-10 text-xs text-slate-400 tracking-wider">
              &copy; 2026 ZAX — Value-Based Connection
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

```

---

## `src\components\LandingPage.tsx`

```tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BrainCircuit, Users, TrendingUp, Sparkles } from "lucide-react";

const features = [
  {
    icon: BrainCircuit,
    label: "性格分析",
    title: "思考の6次元を可視化",
    desc: "思考特性を6次元ベクトルとして分析し、あなたの内面を可視化。属性ではなく、価値観から相手を見つけます。",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-900",
  },
  {
    icon: Users,
    label: "価値観の合う仲間探し",
    title: "ベクトル空間で出会う",
    desc: "高次元の空間計算により、自分でも気づかない「共通点」を持つ相手を見つけ、AIが論理的に相性を説明します。",
    iconBg: "bg-slate-200",
    iconColor: "text-black",
  },
  {
    icon: TrendingUp,
    label: "成長記録",
    title: "対話で進化する自分",
    desc: "対話を通じた自己の変化を記録し、新たな価値観への気づきを促します。あなたのベクトルは出会いごとに更新されます。",
    iconBg: "bg-slate-300",
    iconColor: "text-slate-800",
  },
];

export default function LandingPage() {
  return (
    <main className="w-full bg-slate-50 text-slate-900 font-sans">
      {/* ─── HERO ─── */}
      <section className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[700px] h-[700px] bg-slate-200/40 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-5%] left-[-5%] w-[500px] h-[500px] bg-slate-300/30 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 w-full max-w-3xl px-6 flex flex-col items-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06, duration: 0.5 }}
            className="text-6xl md:text-7xl font-bold tracking-tight mb-6"
          >
            ZAX
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.5 }}
            className="text-lg md:text-xl text-slate-600 leading-relaxed mb-4 max-w-xl"
          >
            人とのつながりをサポートし、
            <span className="font-semibold text-slate-900"> 自分の変化を可視化する</span>
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.5 }}
            className="text-sm text-slate-500 mb-12 max-w-md"
          >
            50の質問から、価値観とつながり方を可視化します。
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Link
              href="/diagnostic"
              className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-all shadow-sm hover:shadow-md"
            >
              診断を開始
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-slate-700 text-sm font-semibold rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
            >
              詳しく見る
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── FEATURE CARDS ─── */}
      <section id="features" className="w-full py-28 lg:py-40">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 lg:mb-20"
          >
            <h2 className="text-sm font-semibold text-slate-400 tracking-[0.15em] uppercase mb-3">
              Features
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900">
              ZAXの3つの機能
            </h3>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <div className="h-full bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/70 transition-shadow duration-300">
                  <div className={`w-12 h-12 rounded-xl ${f.iconBg} flex items-center justify-center mb-5`}>
                    <f.icon className={`w-6 h-6 ${f.iconColor}`} />
                  </div>
                  <p className="text-xs font-semibold text-slate-400 tracking-wider mb-2">{f.label}</p>
                  <h4 className="text-lg font-bold text-slate-900 mb-3">{f.title}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── VALUE PROP ─── */}
      <section className="w-full py-28 lg:py-40 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center"
          >
            <div>
              <span className="text-xs font-semibold text-slate-400 tracking-[0.15em] block mb-3">TECHNOLOGY</span>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-5 leading-tight">
                AIが描く、<br />6次元のベクトル空間
              </h3>
              <p className="text-slate-600 leading-relaxed mb-8">
                論理、直感、共感... ZAXのアルゴリズムは、あなたの発話や行動から6つの指標を抽出し、
                他者との相性を「距離」として計算します。
              </p>
              <Link
                href="/technology"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:text-slate-500 transition-colors"
              >
                プロダクト・アーキテクチャを見る
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="h-72 lg:h-80 bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center"
            >
              <svg viewBox="0 0 200 200" className="w-full h-full opacity-50 p-10">
                <circle cx="100" cy="100" r="80" stroke="#000000" strokeWidth="1" fill="none" />
                <circle cx="100" cy="100" r="50" stroke="#64748b" strokeWidth="1" fill="none" />
                <line x1="100" y1="20" x2="100" y2="180" stroke="#cbd5e1" strokeWidth="0.5" />
                <line x1="20" y1="100" x2="180" y2="100" stroke="#cbd5e1" strokeWidth="0.5" />
                <circle cx="140" cy="70" r="4" fill="#000000" />
                <circle cx="60" cy="130" r="4" fill="#64748b" />
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="w-full py-28 lg:py-40">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto px-6 text-center"
        >
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-12 lg:p-20">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              あなたの価値観を、可視化する。
            </h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              属性ではなく価値観でつながる、新しい形での友達・仲間探し。
            </p>
            <Link
              href="/diagnostic"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              診断を開始
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}

```

---

## `src\components\ImpactSimulationGraph.tsx`

```tsx

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import ReactECharts from "echarts-for-react";
import { type EChartsOption } from "echarts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Activity, Loader2, BarChart4, MessageSquare, Users, Cpu } from "lucide-react";

interface VectorData {
    id: string;
    vector: number[]; // 768-dim (not used for this graph directly unless reduced) 
    // Wait, we need the 6-dim stats for the radar/line chart evolution.
    // The API returns vectorJson which is 768-dim. 
    // We need to store/retrieve the 6-dim STATS vector.
    // In schema, we added 'statsVector'. 
    // Let's assume the API returns statsVector as well.
    statsVector?: string; // JSON string [v1, v2, v3, v4, v5, v6]
    createdAt: string;
    reasoning: string;
}

export default function ImpactSimulationGraph() {
    const [data, setData] = useState<VectorData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedData, setSelectedData] = useState<VectorData | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch('/api/vectors/history');
                const json = await res.json();
                if (json.success) {
                    setData(json.data);
                }
            } catch (e) {
                console.error("Failed to fetch vector history", e);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-[300px]"><Loader2 className="animate-spin text-blue-500" /></div>;
    }

    // Process data for chart
    const dimensions = ["論理性", "直感力", "共感性", "意志力", "創造性", "柔軟性"];
    const dates = data.map(d => {
        const date = new Date(d.createdAt);
        return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    });
    
    const series = dimensions.map((dim, i) => {
        const colors = [
            '#2563eb', // blue-600 (論理性)
            '#7c3aed', // violet-600 (直感力)
            '#db2777', // pink-600 (共感性)
            '#ea580c', // orange-600 (意志力)
            '#ca8a04', // yellow-600 (創造性)
            '#059669', // emerald-600 (柔軟性)
        ];
        return {
            name: dim,
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: { color: colors[i] },
            lineStyle: { width: 3 },
            areaStyle: {
                opacity: 0.05,
                color: colors[i]
            },
            data: data.map(d => {
                if (d.statsVector) {
                    try {
                        const stats = JSON.parse(d.statsVector);
                        return stats[i] || 50;
                    } catch { return 50; }
                }
                return 50 + (Math.random() * 10 - 5);
            })
        } as any;
    });

    const option: EChartsOption = {
        backgroundColor: "transparent",
        tooltip: {
            trigger: 'axis',
            padding: 12,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#e2e8f0',
            textStyle: { color: '#1e293b' }
        },
        legend: {
            data: dimensions,
            top: 0,
            left: 'center',
            padding: [5, 20],
            textStyle: { color: "#64748b", fontSize: 11 },
            icon: 'circle',
            itemGap: 15
        },
        grid: {
            left: '4%',
            right: '5%',
            bottom: '15%',
            top: '15%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: true,
            data: dates,
            axisLine: { lineStyle: { color: '#e2e8f0' } },
            axisTick: { show: false },
            axisLabel: { 
                color: "#64748b",
                fontSize: 10,
                margin: 12,
                rotate: dates.length > 5 ? 30 : 0
            }
        },
        yAxis: {
            type: 'value',
            min: 0,
            max: 100,
            interval: 20,
            splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
            axisLabel: { color: "#94a3b8", fontSize: 10 }
        },
        series: series
    };

    const onChartClick = (params: any) => {
        if (params.dataIndex !== undefined) {
            setSelectedData(data[params.dataIndex]);
        }
    };

    const onEvents = {
        'click': onChartClick
    };

    return (
        <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 w-full h-full min-h-[600px] flex flex-col shadow-sm">
                <CardHeader className="pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <BarChart4 className="w-5 h-5 text-black" />
                        <CardTitle className="text-sm font-bold text-black tracking-tight">
                            推移
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 p-6 min-h-[400px]">
                    {data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm">
                            <p>データがまだありません。</p>
                            <p>診断を行うと、ここに軌跡が描かれます。</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <ReactECharts 
                                option={option} 
                                style={{ height: "400px", width: "100%" }} 
                                notMerge={true}
                                onEvents={onEvents}
                            />
                            <div className="text-center text-xs text-slate-400 animate-pulse">
                                グラフの点をクリックすると、その時の詳細レポートが表示されます
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {selectedData && (
                <Card className="bg-white border-2 border-black rounded-none p-8 md:p-10 shadow-sm transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
                    <CardHeader className="px-0 pt-0 pb-6 border-b-2 border-black flex flex-row items-center justify-between">
                         <div>
                            <CardTitle className="text-xl font-bold flex items-center gap-2 text-black">
                                <MessageSquare className="w-5 h-5" />
                                診断レポートの振り返り
                            </CardTitle>
                            <p className="text-xs text-slate-500 mt-1 font-mono">
                                {new Date(selectedData.createdAt).toLocaleString()} の軌跡
                            </p>
                        </div>
                        <button 
                            onClick={() => setSelectedData(null)}
                            className="text-slate-400 hover:text-black transition-colors"
                        >
                            閉じる
                        </button>
                    </CardHeader>
                    <CardContent className="px-0 pt-8">
                        <div className="space-y-6 text-sm md:text-base leading-relaxed text-black font-medium">
                            {selectedData.reasoning.split('\n').filter(p => p.trim() !== "").map((para, i) => (
                                <p key={i}>
                                    {para.replace(/AI・?/g, "").replace(/AI分析/g, "分析").replace(/\*/g, "")}
                                </p>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}


        </div>
    );
}

```

---

## `src\components\ImpactChart.tsx`

```tsx
"use client";

import React from "react";
import ReactECharts from "echarts-for-react";
import { type EChartsOption } from "echarts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp, Info } from "lucide-react";

// Data: Verified Economic Loss based on Yokohama City Univ Study (2022)
// Source: https://www.yokohama-cu.ac.jp/news/2022/20220628_satoh_ochiai.html
// Metric: Mental Health Related Presenteeism Loss = 7.6 Trillion JPY
const chartData = [
    { year: "2024", value: 0, label: "実証実験" },
    { year: "2025", value: 0.8, label: "シード期" },
    { year: "2026", value: 2.1, label: "シリーズA" },
    { year: "2027", value: 4.5, label: "事業拡大" },
    { year: "2028", value: 7.6, label: "社会OS化" },
];

export default function ImpactChart() {
    const option: EChartsOption = {
        backgroundColor: "transparent",
        tooltip: {
            trigger: "axis",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderColor: "#e2e8f0",
            textStyle: {
                color: "#1e293b",
                fontFamily: "sans-serif",
            },
            extraCssText: "box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);",
            formatter: (params: any) => {
                const p = params[0];
                const item = chartData[p.dataIndex];
                return `
          <div style="font-family: sans-serif; font-size: 12px; color: #64748b; margin-bottom: 4px;">
            会計年度 ${p.name}
          </div>
          <div style="font-size: 14px; color: #0f172a; font-weight: bold;">
            <span style="display:inline-block;margin-right:8px;border-radius:50%;width:8px;height:8px;background-color:#2563eb;"></span>
            推計経済効果: <span style="color: #2563eb;">¥${p.value}兆</span>
          </div>
          <div style="font-size: 10px; color: #64748b; margin-top: 4px;">
            フェーズ: ${item.label}
          </div>
        `;
            },
        },
        grid: {
            left: "3%",
            right: "4%",
            bottom: "3%",
            top: "15%",
            containLabel: true,
        },
        xAxis: {
            type: "category",
            boundaryGap: false,
            data: chartData.map((d) => d.year),
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
                color: "#64748b",
                fontFamily: "sans-serif",
                fontSize: 10,
                margin: 12,
            },
            splitLine: {
                show: true,
                lineStyle: {
                    color: "#e2e8f0",
                },
            },
        },
        yAxis: {
            type: "value",
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
                color: "#64748b",
                fontFamily: "sans-serif",
                fontSize: 10,
                formatter: "¥{value}兆",
            },
            splitLine: {
                lineStyle: {
                    color: "#e2e8f0",
                    type: "dashed",
                },
            },
        },
        series: [
            {
                name: "Economic Impact",
                type: "line",
                smooth: true,
                symbol: "circle",
                symbolSize: 8,
                showSymbol: false,
                lineStyle: {
                    color: "#2563eb", // Blue-600
                    width: 3,
                    shadowColor: "rgba(37, 99, 235, 0.2)",
                    shadowBlur: 10,
                },
                itemStyle: {
                    color: "#2563eb",
                    borderWidth: 2,
                    borderColor: "#fff",
                },
                areaStyle: {
                    color: {
                        type: "linear",
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            { offset: 0, color: "rgba(37, 99, 235, 0.2)" },
                            { offset: 1, color: "rgba(37, 99, 235, 0)" },
                        ],
                    },
                },
                data: chartData.map((d) => d.value),
                markLine: {
                    symbol: "none",
                    label: {
                        position: "end",
                        formatter: "{b}",
                        color: "#64748b",
                        fontSize: 10,
                    },
                    lineStyle: {
                        color: "#94a3b8",
                        type: "dashed",
                    },
                    data: [
                        {
                            yAxis: 4,
                            name: "採算分岐点",
                        },
                    ],
                },
            },
        ],
    };

    return (
        <Card className="bg-white border-slate-200 w-full h-full min-h-[450px] flex flex-col overflow-hidden relative group shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-0 relative z-10 border-b border-slate-100">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                            <CardTitle className="text-sm font-bold text-slate-500 tracking-widest uppercase">
                                メンタル不調による経済損失の解消
                            </CardTitle>
                        </div>
                        <div className="text-3xl font-bold text-slate-900 tracking-tighter">
                            7.3 <span className="text-sm font-normal text-slate-500">兆円 / 年 (国内推計)</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-xs font-medium text-blue-600 mb-2">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                            </span>
                            リアルタイム推計
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 min-h-0 relative z-10 p-0">
                <div className="w-full h-full min-h-[300px]">
                    <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
                </div>
            </CardContent>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-[10px] text-slate-500 leading-relaxed relative z-10">
                <div className="flex items-start gap-2 mb-1">
                    <Info className="w-3 h-3 text-slate-400 mt-0.5" />
                    <span>出典: <span className="text-slate-600 font-medium">Journal of Occupational and Environmental Medicine (2025)</span>:</span>
                </div>
                <div className="pl-5 space-y-1">
                    <a
                        href="https://journals.lww.com/joem/fulltext/2025/09000/the_impact_of_productivity_loss_from_presenteeism.3.aspx"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block hover:text-blue-600 transition-colors underline decoration-slate-300 underline-offset-2"
                    >
                        • The Impact of Productivity Loss from Presenteeism (Sample: N=27,507)
                    </a>
                    <div className="text-slate-500 mt-1">
                        • 総損失: $48.58B (約7.3兆円) | GDP比: 1.11%<br />
                        • 内訳: プレゼンティーイズム $46.73B vs アブセンティーイズム $1.85B
                    </div>
                </div>
            </div>
        </Card>
    );
}

```

---

## `src\components\EssenceInput.tsx`

```tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Activity, Sparkles, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EssenceInputData {
    fragments: string[];
    biases: number[];
    purpose: string;
}

interface EssenceInputProps {
    onComplete: (data: EssenceInputData) => void;
}

export default function EssenceInput({ onComplete }: EssenceInputProps) {
    const [step, setStep] = useState<"purpose" | "attributes" | "sns" | "fragments">("purpose");
    const [data, setData] = useState({
        purpose: "",
        attributes: [] as string[],
        sns: "",
        fragments: ["", "", ""],
    });

    const steps = ["purpose", "attributes", "sns", "fragments"];
    const currentStepIndex = steps.indexOf(step);
    const stepLabels = ["目的", "興味", "連携", "分析"];

    const purposes = [
        { id: "happiness", label: "HAPPINESS", title: "幸福の探求", desc: "人生単位の幸福と精神的充足を追求する", emoji: "✨", color: "#F59E0B" },
        { id: "romance", label: "ROMANCE", title: "深い結びつき", desc: "心から信頼し合える深いパートナーシップを築く", emoji: "💫", color: "#EC4899" },
        { id: "friendship", label: "ALLIANCE", title: "生涯の盟友", desc: "相互に高め合う生涯の盟友を見つける", emoji: "🤝", color: "#7C3AED" },
    ];

    const tags = [
        "Startup", "Design", "Engineering", "Sauna", "Art", "Music", 
        "Cinema", "Philosophy", "Fashion", "Travel", "Crypto", "Cooking"
    ];

    const handleNext = () => {
        if (currentStepIndex < steps.length - 1) {
            setStep(steps[currentStepIndex + 1] as typeof step);
        } else {
            onComplete({ 
                fragments: data.fragments, 
                biases: [50, 50, 50], 
                purpose: data.purpose 
            });
        }
    };

    const toggleTag = (tag: string) => {
        if (data.attributes.includes(tag)) {
            setData({ ...data, attributes: data.attributes.filter(t => t !== tag) });
        } else {
            setData({ ...data, attributes: [...data.attributes, tag] });
        }
    };

    return (
        <div 
            className="min-h-screen font-sans flex flex-col relative overflow-hidden"
            style={{ 
                backgroundColor: '#FAFAFA', 
                color: '#1A1A1A',
                backgroundImage: `radial-gradient(circle at 30% 20%, rgba(124, 58, 237, 0.04) 0%, transparent 50%),
                                  radial-gradient(circle at 70% 80%, rgba(14, 165, 233, 0.04) 0%, transparent 50%)`,
            }}
        >
            {/* Progress Header */}
            <div 
                className="sticky top-0 z-50 px-6 py-5"
                style={{ 
                    backgroundColor: 'rgba(255,255,255,0.9)', 
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(0,0,0,0.05)'
                }}
            >
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)' }}
                        >
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <span className="font-black text-lg tracking-tight" style={{ color: '#1A1A1A' }}>ZAX</span>
                            <span className="text-sm ml-3 font-mono" style={{ color: '#888' }}>
                                STEP {currentStepIndex + 1} / {steps.length}
                            </span>
                        </div>
                    </div>
                    
                    {/* Progress Steps */}
                    <div className="hidden sm:flex items-center gap-3">
                        {steps.map((s, i) => (
                            <div key={s} className="flex items-center gap-3">
                                <div 
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                                    style={{
                                        backgroundColor: i <= currentStepIndex ? 'rgba(124, 58, 237, 0.1)' : 'rgba(0,0,0,0.03)',
                                        color: i <= currentStepIndex ? '#7C3AED' : '#888',
                                        border: i === currentStepIndex ? '1px solid rgba(124, 58, 237, 0.3)' : '1px solid transparent',
                                    }}
                                >
                                    {i < currentStepIndex ? <Check className="w-3 h-3" /> : null}
                                    {stepLabels[i]}
                                </div>
                                {i < steps.length - 1 && (
                                    <div 
                                        className="w-8 h-px"
                                        style={{ backgroundColor: i < currentStepIndex ? 'rgba(124, 58, 237, 0.3)' : 'rgba(0,0,0,0.08)' }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center px-6 py-16 relative z-10">
                <div className="w-full max-w-4xl">
                    <AnimatePresence mode="wait">
                        
                        {/* STEP 1: PURPOSE */}
                        {step === "purpose" && (
                            <motion.div
                                key="purpose"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30 }}
                                transition={{ duration: 0.4 }}
                                className="text-center"
                            >
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
                                    style={{ backgroundColor: 'rgba(124, 58, 237, 0.08)', border: '1px solid rgba(124, 58, 237, 0.15)' }}
                                >
                                    <span className="text-xs font-mono" style={{ color: '#7C3AED' }}>STEP 01</span>
                                </motion.div>

                                <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
                                    <span style={{ color: '#1A1A1A' }}>あなたの</span>
                                    <span 
                                        style={{ 
                                            background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                        }}
                                    >目的</span>
                                    <span style={{ color: '#1A1A1A' }}>は？</span>
                                </h2>
                                <p className="mb-16 text-lg" style={{ color: '#666' }}>
                                    ZAXを利用する主な目的を教えてください。
                                </p>
                                
                                {/* Purpose Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                                    {purposes.map((p, i) => (
                                        <motion.button
                                            key={p.id}
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                setData({ ...data, purpose: p.id });
                                                handleNext();
                                            }}
                                            className="group relative p-8 rounded-3xl transition-all duration-500 text-center"
                                            style={{
                                                backgroundColor: 'white',
                                                border: '1px solid rgba(0,0,0,0.06)',
                                                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                                            }}
                                        >
                                            <div className="text-5xl mb-6">{p.emoji}</div>
                                            <div 
                                                className="text-xs font-mono tracking-widest mb-2"
                                                style={{ color: p.color }}
                                            >
                                                {p.label}
                                            </div>
                                            <h3 className="text-xl font-bold mb-3" style={{ color: '#1A1A1A' }}>{p.title}</h3>
                                            <p className="text-sm leading-relaxed" style={{ color: '#888' }}>{p.desc}</p>
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: ATTRIBUTES */}
                        {step === "attributes" && (
                            <motion.div
                                key="attributes"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30 }}
                                className="text-center"
                            >
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
                                    style={{ backgroundColor: 'rgba(14, 165, 233, 0.08)', border: '1px solid rgba(14, 165, 233, 0.15)' }}
                                >
                                    <span className="text-xs font-mono" style={{ color: '#0EA5E9' }}>STEP 02</span>
                                </motion.div>

                                <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
                                    <span 
                                        style={{ 
                                            background: 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                        }}
                                    >興味・関心</span>
                                    <span style={{ color: '#1A1A1A' }}>を選択</span>
                                </h2>
                                <p className="mb-12 text-lg" style={{ color: '#666' }}>
                                    興味のある分野を選択してください（複数可）
                                </p>
                                
                                <div className="flex flex-wrap gap-3 justify-center mb-12 max-w-2xl mx-auto">
                                    {tags.map((tag, i) => (
                                        <motion.button
                                            key={tag}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.03 }}
                                            onClick={() => toggleTag(tag)}
                                            className="px-5 py-3 rounded-full text-sm font-medium transition-all duration-300"
                                            style={{
                                                backgroundColor: data.attributes.includes(tag) ? '#7C3AED' : 'white',
                                                color: data.attributes.includes(tag) ? 'white' : '#666',
                                                border: data.attributes.includes(tag) ? '1px solid #7C3AED' : '1px solid rgba(0,0,0,0.08)',
                                                boxShadow: data.attributes.includes(tag) ? '0 4px 15px rgba(124, 58, 237, 0.3)' : '0 2px 8px rgba(0,0,0,0.04)',
                                            }}
                                        >
                                            {data.attributes.includes(tag) && <Check className="w-4 h-4 inline mr-1.5" />}
                                            {tag}
                                        </motion.button>
                                    ))}
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(124, 58, 237, 0.4)" }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleNext}
                                    disabled={data.attributes.length === 0}
                                    className="px-10 py-4 rounded-full font-bold text-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    style={{
                                        background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
                                        color: 'white',
                                        boxShadow: '0 4px 20px rgba(124, 58, 237, 0.35)',
                                    }}
                                >
                                    次のステップへ
                                    <ArrowRight className="w-5 h-5 inline ml-2" />
                                </motion.button>
                            </motion.div>
                        )}

                        {/* STEP 3: SNS */}
                        {step === "sns" && (
                            <motion.div
                                key="sns"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30 }}
                                className="text-center"
                            >
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
                                    style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.15)' }}
                                >
                                    <span className="text-xs font-mono" style={{ color: '#10B981' }}>STEP 03</span>
                                </motion.div>

                                <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
                                    <span 
                                        style={{ 
                                            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                        }}
                                    >シグナル</span>
                                    <span style={{ color: '#1A1A1A' }}>を同期</span>
                                </h2>
                                <p className="mb-12 text-lg" style={{ color: '#666' }}>
                                    SNSデータを連携して、思考ベクトルを抽出します
                                </p>
                                
                                <div className="max-w-md mx-auto space-y-4">
                                    <motion.button
                                        whileHover={{ scale: 1.02, boxShadow: '0 15px 35px rgba(0,0,0,0.1)' }}
                                        className="w-full p-6 rounded-2xl flex items-center gap-5 transition-all group"
                                        style={{
                                            backgroundColor: 'white',
                                            border: '1px solid rgba(0,0,0,0.06)',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                                        }}
                                    >
                                        <div 
                                            className="w-14 h-14 rounded-xl flex items-center justify-center"
                                            style={{ backgroundColor: '#000' }}
                                        >
                                            <X className="w-7 h-7 text-white" />
                                        </div>
                                        <div className="text-left flex-1">
                                            <div className="font-bold text-lg" style={{ color: '#1A1A1A' }}>X (Twitter)</div>
                                            <div className="text-sm" style={{ color: '#888' }}>テキストベクトルを解析</div>
                                        </div>
                                        <ArrowRight className="w-5 h-5" style={{ color: '#ccc' }} />
                                    </motion.button>
                                    
                                    <button 
                                        onClick={handleNext}
                                        className="w-full py-4 font-medium transition-colors"
                                        style={{ color: '#888' }}
                                    >
                                        スキップして手動入力 →
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 4: FRAGMENTS */}
                        {step === "fragments" && (
                            <motion.div
                                key="fragments"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30 }}
                                className="text-center"
                            >
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
                                    style={{ backgroundColor: 'rgba(124, 58, 237, 0.08)', border: '1px solid rgba(124, 58, 237, 0.15)' }}
                                >
                                    <span className="text-xs font-mono" style={{ color: '#7C3AED' }}>STEP 04</span>
                                </motion.div>

                                <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
                                    <span 
                                        style={{ 
                                            background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                        }}
                                    >分析開始</span>
                                </h2>
                                <p className="mb-12 text-lg" style={{ color: '#666' }}>
                                    入力データから本質ベクトルを生成します
                                </p>
                                
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="max-w-md mx-auto p-10 rounded-3xl"
                                    style={{
                                        backgroundColor: 'white',
                                        border: '1px solid rgba(0,0,0,0.06)',
                                        boxShadow: '0 4px 30px rgba(0,0,0,0.06)',
                                    }}
                                >
                                    <div 
                                        className="w-20 h-20 mx-auto mb-8 rounded-2xl flex items-center justify-center"
                                        style={{ 
                                            background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
                                            boxShadow: '0 10px 30px rgba(124, 58, 237, 0.3)',
                                        }}
                                    >
                                        <Activity className="w-10 h-10 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-black mb-3" style={{ color: '#1A1A1A' }}>ベクトル化準備完了</h3>
                                    <p className="text-sm leading-relaxed mb-10" style={{ color: '#888' }}>
                                        入力されたデータから、あなたの「本質ベクトル」を生成します。<br/>
                                        生成には10-20秒かかる場合があります。
                                    </p>
                                    <motion.button
                                        whileHover={{ scale: 1.02, boxShadow: "0 10px 40px rgba(124, 58, 237, 0.5)" }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => onComplete({
                                            fragments: ["シミュレート入力"],
                                            biases: [50, 50, 50],
                                            purpose: data.purpose
                                        })}
                                        className="w-full py-5 rounded-full font-bold text-lg"
                                        style={{
                                            background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
                                            color: 'white',
                                            boxShadow: '0 4px 20px rgba(124, 58, 237, 0.35)',
                                        }}
                                    >
                                        エッセンスベクトルを生成
                                        <Zap className="w-5 h-5 inline ml-2" />
                                    </motion.button>
                                </motion.div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

```

---

## `src\components\EvidenceAnalysis.tsx`

```tsx
"use client";

import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { create, all } from 'mathjs';
import { realHappinessData, HappinessData } from "@/data/happiness2019";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BrainCircuit, Info } from "lucide-react";

// Initialize MathJS
const math = create(all, {});

export default function EvidenceAnalysis() {
    // Helper: Polynomial Features (The "Advanced" Logic, now standard)
    const getPolyFeatures = (d: HappinessData) => [
        1,
        d.gdp,
        d.social,
        d.health,
        d.freedom,
        d.gdp * d.social,
        d.health * d.freedom,
        d.gdp * d.freedom
    ];

    // Helper: Solve OLS
    const solveOLS = (trainData: HappinessData[], featureExtractor: (d: HappinessData) => number[]) => {
        const X = trainData.map(featureExtractor);
        const y = trainData.map(d => [d.score]);

        try {
            const matX = math.matrix(X);
            const matY = math.matrix(y);
            const matXT = math.transpose(matX);
            const matXTX = math.multiply(matXT, matX);
            const matInv = math.inv(matXTX);
            const matXTy = math.multiply(matXT, matY);
            const beta = math.multiply(matInv, matXTy);
            // @ts-ignore
            return beta.toArray().flat().map((c: any) => Number(c));
        } catch (e) {
            return [];
        }
    };

    // 1. Legacy Model (GDP Only) - The "Old World"
    const legacyModel = useMemo(() => {
        const getLegacyFeatures = (d: HappinessData) => [1, d.gdp]; // Only GDP
        const coefs = solveOLS(realHappinessData, getLegacyFeatures);

        const predictions = realHappinessData.map(d => {
            const feats = getLegacyFeatures(d);
            const pred = feats.reduce((sum, v, idx) => sum + v * coefs[idx], 0);
            return { country: d.country, actual: d.score, predicted: pred };
        });

        const meanActual = math.mean(predictions.map(p => p.actual));
        const ssTotal = predictions.reduce((sum, p) => sum + Math.pow(p.actual - meanActual, 2), 0);
        const ssRes = predictions.reduce((sum, p) => sum + Math.pow(p.actual - p.predicted, 2), 0);
        const rSquared = 1 - (ssRes / ssTotal);

        return { rSquared, predictions };
    }, []);

    // 2. ZAX Model (Full Interaction) - The "New World"
    const zaxModel = useMemo(() => {
        const coefs = solveOLS(realHappinessData, getPolyFeatures);
        const predictions = realHappinessData.map(d => {
            const feats = getPolyFeatures(d);
            const pred = feats.reduce((sum, v, idx) => sum + v * coefs[idx], 0);
            return { country: d.country, actual: d.score, predicted: pred };
        });
        const meanActual = math.mean(predictions.map(p => p.actual));
        const ssTotal = predictions.reduce((sum, p) => sum + Math.pow(p.actual - meanActual, 2), 0);
        const ssRes = predictions.reduce((sum, p) => sum + Math.pow(p.actual - p.predicted, 2), 0);
        const rSquared = 1 - (ssRes / ssTotal);
        return { rSquared, predictions, coefs };
    }, []);


    // --- Chart Options (Stitch Style) ---

    // 1. Comparison Scatter
    const getComparisonOption = () => ({
        backgroundColor: "transparent",
        animationDuration: 2000,
        title: { 
            text: "MODEL PERFORMANCE COMPARISON", 
            left: 10, top: 10,
            textStyle: { color: '#94a3b8', fontSize: 10, fontFamily: 'monospace' } 
        },
        legend: { top: 10, right: 10, textStyle: { color: '#cbd5e1' }, icon: 'circle' },
        grid: { top: 50, right: 30, bottom: 30, left: 50, containLabel: true, borderColor: '#334155', show: true },
        tooltip: { 
            trigger: 'item', 
            backgroundColor: 'rgba(15, 23, 42, 0.9)', 
            borderColor: '#334155', 
            textStyle: { color: '#f8fafc' } 
        },
        xAxis: { 
            name: 'ACTUAL', 
            nameTextStyle: { fontFamily: 'monospace', color:'#64748b' },
            splitLine: { lineStyle: { color: '#334155', type: 'dashed' } },
            axisLabel: { color: '#94a3b8', fontFamily: 'monospace' }
        },
        yAxis: { 
            name: 'PREDICTED', 
            nameTextStyle: { fontFamily: 'monospace', color:'#64748b' },
            splitLine: { lineStyle: { color: '#334155', type: 'dashed' } },
            axisLabel: { color: '#94a3b8', fontFamily: 'monospace' }
        },
        series: [
            {
                name: 'Legacy (GDP)',
                type: 'scatter',
                data: legacyModel.predictions.map(p => [p.actual, p.predicted]),
                itemStyle: { color: '#475569', opacity: 0.4 }, 
                symbolSize: 6
            },
            {
                name: 'ZAX (Value)',
                type: 'scatter',
                data: zaxModel.predictions.map(p => [p.actual, p.predicted]),
                itemStyle: { 
                    color: '#22d3ee', // Cyan
                    shadowBlur: 10, 
                    shadowColor: '#22d3ee' 
                }, 
                symbolSize: 8
            },
            {
                type: 'line',
                data: [[2, 2], [8, 8]],
                lineStyle: { color: '#f472b6', width: 2, type: 'dashed' }, // Pink Line
                symbol: 'none'
            }
        ]
    });

    // 2. The Gap Chart
    const getGapOption = () => ({
        backgroundColor: "transparent",
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { 
            type: 'category', 
            data: ['LEGACY', 'ZAX CORE'],
            axisLabel: { color: '#cbd5e1', fontWeight: 'bold' } 
        },
        yAxis: { type: 'value', min: 0, max: 1.0, splitLine: { lineStyle: { color: '#334155' } } },
        series: [{
            data: [
                {
                    value: legacyModel.rSquared,
                    itemStyle: { color: '#475569' },
                    label: { show: true, position: 'top', color: '#94a3b8', formatter: 'R² 0.64' }
                },
                {
                    value: zaxModel.rSquared,
                    itemStyle: { color: '#f472b6' }, // Pink
                    label: { show: true, position: 'top', color: '#f472b6', fontWeight: 'bold', formatter: 'R² 0.94' }
                }
            ],
            type: 'bar',
            barWidth: '50%'
        }]
    });

    // 3. Feature Importance
    const getImportanceOption = () => {
        const labels = ["Intercept", "GDP", "Social Spt", "Health", "Freedom", "GDP*Social", "Health*Free", "GDP*Free"];
        const data = zaxModel.coefs.map(c => Math.abs(c));
        return {
            backgroundColor: "transparent",
            tooltip: { trigger: 'axis' },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            xAxis: { type: 'value', splitLine: { show: false } },
            yAxis: { 
                type: 'category', 
                data: labels,
                axisLabel: { color: '#94a3b8', fontSize: 10 }
            },
            series: [{
                type: 'bar',
                data: data,
                itemStyle: {
                    color: (params: any) => {
                        const label = labels[params.dataIndex];
                        if (label.includes("Social") || label.includes("Freedom")) return "#22d3ee"; // Cyan
                        return "#334155";
                    }
                }
            }]
        };
    };

    return (
        <div className="space-y-8 font-sans">
            {/* Header Panel */}
            <div className="border-l-4 border-l-slate-400 bg-slate-900/50 p-6 border-y border-r border-slate-800 backdrop-blur-md">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight uppercase mb-2">Evidence Analysis</h2>
                        <p className="text-sm text-slate-400 max-w-2xl">
                            Why GDP alone fails to predict happiness (R²=0.64) vs. How ZAX fills the void (R²=0.94).
                        </p>
                    </div>
                    <div className="text-right hidden md:block">
                        <div className="text-xs font-mono text-slate-400 mb-1">DATA_SOURCE</div>
                        <div className="text-sm font-bold text-white">WHR_2019_DATASET</div>
                    </div>
                </div>
            </div>

            {/* Main Viz Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-1 relative">
                    <div className="absolute top-0 left-0 bg-slate-800 px-3 py-1 text-[10px] text-white font-mono z-10">
                        FIG_01: REGRESSION_FIT
                    </div>
                    <div className="h-[400px] w-full mt-4">
                         <ReactECharts option={getComparisonOption()} style={{ height: '100%', width: '100%' }} />
                    </div>
                </div>

                {/* Side Metrics */}
                <div className="space-y-6">
                    {/* Metric 1 */}
                    <div className="bg-slate-900 border border-slate-800 p-4 flex flex-col h-[200px] relative">
                        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">PREDICTION GAP</div>
                        <div className="flex-1">
                            <ReactECharts option={getGapOption()} style={{ height: '100%', width: '100%' }} />
                        </div>
                    </div>

                    {/* Metric 2 */}
                    <div className="bg-slate-900 border border-slate-800 p-4 flex flex-col h-[200px] relative">
                         <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">KEY DRIVERS</div>
                         <div className="flex-1">
                             <ReactECharts option={getImportanceOption()} style={{ height: '100%', width: '100%' }} />
                         </div>
                    </div>
                </div>
            </div>

            {/* Footer Citation */}
            <div className="flex items-center gap-4 text-[10px] font-mono text-slate-600 border-t border-slate-800 pt-4 mt-8">
                <Info className="w-3 h-3" />
                <span>DATA VERIFICATION ID: 0x99283_ZAX_CORE</span>
                <span className="flex-1 h-px bg-slate-800" />
                <span>JOURNAL_REF: JOEM_2025_0900</span>
            </div>
        </div>
    );
}

```

---

## `src\components\BlindChat.tsx`

_ファイルが見つかりませんでした: ENOENT: no such file or directory, open 'c:\ZAX\src\components\BlindChat.tsx'_

---

## `src\components\VectorTransformationVisual.tsx`

```tsx
"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function VectorTransformationVisual() {
    return (
        <div className="relative w-full h-[300px] flex items-center justify-center overflow-hidden my-12 bg-white border border-[#E5E5E5]">
            {/* Grid Background */}
            <div className="absolute inset-0 z-0 opacity-40" 
                style={{ backgroundImage: 'linear-gradient(#E5E5E5 1px, transparent 1px), linear-gradient(90deg, #E5E5E5 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
            />

            <div className="relative z-10 flex items-center gap-4 lg:gap-12 w-full max-w-4xl px-8">
                
                {/* 1. INPUT NODE */}
                <div className="flex flex-col gap-2 items-center flex-1">
                     <span className="text-[10px] font-mono text-[#0022FF] tracking-widest uppercase mb-2">INPUT_SIGNALS</span>
                     <div className="flex flex-col gap-2 w-full">
                        {["Universities", "Income", "Jobs"].map((label, i) => (
                           <motion.div 
                             key={i}
                             initial={{x:-20, opacity:0}}
                             whileInView={{x:0, opacity:1}}
                             transition={{delay:i*0.2}}
                             className="bg-[#F9F9F9] border border-[#E5E5E5] p-2 text-center text-xs text-black font-mono uppercase tracking-wider shadow-[2px_2px_0px_#E5E5E5]"
                           >
                             {label}
                           </motion.div>
                        ))}
                     </div>
                </div>

                {/* 2. PROCESS NODE (Center) */}
                <div className="relative flex items-center justify-center shrink-0">
                    <motion.div 
                       animate={{ rotate: 360 }}
                       transition={{ duration: 10, ease: "linear", repeat: Infinity }}
                       className="w-24 h-24 lg:w-32 lg:h-32 border border-[#E5E5E5] rounded-full border-dashed flex items-center justify-center relative bg-white"
                    >
                         <div className="absolute inset-0 border border-[#0022FF]/20 rounded-full scale-75" />
                    </motion.div>
                    <ArrowRight className="absolute text-black w-6 h-6" />
                </div>

                {/* 3. OUTPUT NODE */}
                 <div className="flex flex-col gap-2 items-center flex-1">
                     <span className="text-[10px] font-mono text-[#0022FF] tracking-widest uppercase mb-2">ESSENCE_VECTOR</span>
                     <div className="bg-white border border-[#0022FF] w-full h-32 relative overflow-hidden p-4 group shadow-[4px_4px_0px_#E5E5E5]">
                        <div className="absolute inset-0 bg-[#0022FF]/5 group-hover:bg-[#0022FF]/10 transition-colors" />
                        {/* Simulated Tensor Data */}
                        <div className="grid grid-cols-3 gap-2 h-full content-center">
                           {[...Array(9)].map((_,i) => (
                               <motion.div 
                                 key={i}
                                 animate={{opacity: [0.3, 1, 0.3], height: ["2px", "4px", "2px"]}}
                                 transition={{duration: 1.5, delay: i*0.1, repeat: Infinity}}
                                 className="bg-[#0022FF] w-full rounded-full"
                               />
                           ))}
                        </div>
                     </div>
                </div>

            </div>
            
            <div className="absolute bottom-2 right-4 text-[9px] font-mono text-slate-400">
                PIPELINE_STATUS: ACTIVE
            </div>
        </div>
    );
}


```

---

## `src\components\Footer.tsx`

```tsx
"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <Link href="/" className="font-bold text-xl tracking-tighter">ZAX</Link>
          <div className="text-[10px] text-slate-400 tracking-widest uppercase">
            &copy; 2026 ZAX
          </div>
        </div>
        
        <div className="flex gap-8 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <Link href="/terms" className="hover:text-black transition-colors">利用規約</Link>
          <Link href="/privacy" className="hover:text-black transition-colors">プライバシーポリシー</Link>
          <Link href="/about" className="hover:text-black transition-colors">私たちについて</Link>
        </div>
      </div>
    </footer>
  );
}

```

---

## `src\components\Providers.tsx`

```tsx
'use client';

import { DiagnosticProvider } from "@/context/DiagnosticContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DiagnosticProvider>
      {children}
    </DiagnosticProvider>
  );
}

```

---

## `src\components\diagnostic\DiagnosticWizard.tsx`

```tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { questions } from '@/data/questions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { useDiagnostic } from '@/context/DiagnosticContext';

export default function DiagnosticWizard() {
  const { answers, currentStep: currentQuestionIndex, setAnswer: contextSetAnswer, setStep: setCurrentQuestionIndex } = useDiagnostic();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [isComplete, setIsComplete] = useState(false);
  const [freeText, setFreeText] = useState('');

  // For auto-scroll or focus effects
  const cardRef = useRef<HTMLDivElement>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const lastQuestionAnswered = currentQuestion && answers[currentQuestion.id] !== undefined;
  
  const allAnswered = answeredCount >= totalQuestions * 0.8 ||
                      (currentQuestionIndex === totalQuestions - 1 && (lastQuestionAnswered || answeredCount >= totalQuestions * 0.7));

  const handleAnswer = (value: number) => {
    if (currentQuestion) {
       contextSetAnswer(currentQuestion.id, value);
    }
    
    // Auto-advance with a slight delay for visual feedback
    if (currentQuestionIndex < totalQuestions - 1) {
      setTimeout(() => {
        setDirection('next');
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }, 300);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setDirection('next');
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentQuestionIndex === totalQuestions - 1 && allAnswered) {
      setIsComplete(true);
    }
  };

  const handlePrevious = () => {
    if (isComplete) {
        setIsComplete(false);
        return;
    }
    if (currentQuestionIndex > 0) {
      setDirection('prev');
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/diagnostic/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, freeText }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        const resultData = { id: data.id, synthesis: data.synthesis, answers: data.answers };
        sessionStorage.setItem(`diagnostic_result_${data.id}`, JSON.stringify(resultData));
        window.location.href = `/diagnostic/result/${data.id}`;
      } else {
        console.error('Failed to submit:', data.error);
        alert('エラーが発生しました: ' + (data.error || '不明なエラー'));
      }
    } catch (error) {
      console.error('Error submitting diagnostic:', error);
      alert('通信エラーが発生しました。ブラウザのコンソールを確認してください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const options = [
    { value: 1, label: '同意しない', color: 'bg-black', size: 'w-16 h-16', border: 'border-black' },
    { value: 2, label: '', color: 'bg-gray-800', size: 'w-12 h-12', border: 'border-gray-800' },
    { value: 3, label: '', color: 'bg-gray-600', size: 'w-8 h-8', border: 'border-gray-600' },
    { value: 4, label: '中立', color: 'bg-gray-200', size: 'w-6 h-6', border: 'border-gray-300' },
    { value: 5, label: '', color: 'bg-gray-400', size: 'w-8 h-8', border: 'border-gray-400' },
    { value: 6, label: '', color: 'bg-gray-600', size: 'w-12 h-12', border: 'border-gray-600' },
    { value: 7, label: '同意する', color: 'bg-black', size: 'w-16 h-16', border: 'border-black' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 min-h-[600px] flex flex-col justify-center">
      <div className="relative">
          <Card 
            ref={cardRef}
            className="border-2 border-black shadow-none rounded-none bg-white"
          >
            <CardContent className="p-8 sm:p-12 text-center space-y-10">
              
              {!isComplete ? (
                <>
                  {currentQuestion && (
                  <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300 key={currentQuestionIndex}">
                    <span className="text-[10px] font-bold text-gray-400 tracking-[0.3em] uppercase">
                        質問 {currentQuestion.id} / {totalQuestions}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-black leading-tight tracking-tight">
                      {currentQuestion.text}
                    </h2>
                  </div>
                  )}

                  <div className="flex items-center justify-center gap-3 sm:gap-6 py-4">
                    <div className="hidden sm:block text-[10px] font-bold text-gray-400 mr-2">同意しない</div>
                    
                        {options.map((opt) => {
                        const isSelected = currentQuestion && answers[currentQuestion.id] === opt.value;
                        const isAnswered = currentQuestion && answers[currentQuestion.id] !== undefined;
                        
                        return (
                            <button
                                key={opt.value}
                                onClick={() => currentQuestion && handleAnswer(opt.value)}
                                className={`
                                    rounded-full transition-all duration-300 flex items-center justify-center
                                    ${opt.size}
                                    ${isSelected 
                                        ? `bg-black ring-4 ring-offset-2 ring-gray-100 scale-110` 
                                        : `bg-transparent border border-gray-200 hover:bg-black group`
                                    }
                                    ${!isSelected && isAnswered ? 'opacity-40 hover:opacity-100' : 'opacity-100'}
                                `}
                                aria-label={`Select option ${opt.value}`}
                            >
                                {isSelected ? (
                                    <Check className="text-white w-5 h-5 stroke-[3px]" />
                                ) : (
                                    <span className="opacity-0 group-hover:opacity-10 transition-opacity bg-black rounded-full w-full h-full"></span>
                                )}
                            </button>
                        );
                    })}

                    <div className="hidden sm:block text-[10px] font-bold text-gray-400 ml-2">同意する</div>
                  </div>

                  <div className="flex sm:hidden justify-between text-[10px] font-bold text-gray-400 px-2">
                    <span>同意しない</span>
                    <span>同意する</span>
                  </div>
                </>
              ) : (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300 py-6">
                    <h2 className="text-2xl font-black text-black tracking-widest text-center uppercase">診断完了</h2>
                    <p className="text-gray-500 text-xs leading-relaxed max-w-md mx-auto text-center px-4">
                        すべての質問への回答が完了しました。<br/>
                        最後に、あなたの回答をどう解釈してほしいかなどを自由に教えてください（任意）。<br/>
                        <span className="text-[10px] text-gray-400">例：「『優しい嘘』ならついてもいいと思う」「仕事より平穏を優先したい」など</span>
                    </p>
                    <div className="px-4">
                        <textarea
                            value={freeText}
                            onChange={(e) => setFreeText(e.target.value)}
                            placeholder="例：回答には、論理よりも感情を大切にしたいという意図が含まれています..."
                            className="text-black w-full h-32 p-4 text-sm border-2 border-black focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all resize-none placeholder:text-gray-300"
                        />
                        <p className="text-[9px] text-gray-400 mt-2 text-right">※入力するとAIによる分析がより詳細になります</p>
                    </div>
                </div>
              )}

            </CardContent>
          </Card>
      </div>

      <div className="mt-12 flex justify-between items-center px-4">
        <Button
          variant="ghost"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0 && !isComplete}
          className="text-gray-400 hover:text-black hover:bg-transparent transition-colors text-[10px] font-bold"
        >
          <ChevronLeft className="w-3 h-3 mr-1" />
          戻る
        </Button>

        {!isComplete ? (
            currentQuestionIndex === totalQuestions - 1 ? (
                 <Button 
                    onClick={() => setIsComplete(true)} 
                    disabled={!allAnswered}
                    className="bg-black text-white hover:bg-gray-800 px-8 py-6 rounded-none font-bold uppercase tracking-widest text-xs transition-all disabled:opacity-20"
                 >
                    完了
                 </Button>
            ) : (
                <div className="text-[10px] font-bold text-gray-300">
                    進捗: {Math.round((answeredCount / totalQuestions) * 100)}%
                </div>
            )
        ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="bg-black text-white hover:bg-gray-800 px-10 py-7 rounded-none font-bold uppercase tracking-widest text-xs transition-all disabled:opacity-20 translate-y-[-10px] border-2 border-black"
             >
                {isSubmitting ? '分析中...' : '結果を見る'}
             </Button>
        )}
      </div>
    </div>
  );
}

```

---

## `src\components\diagnostic\DiagnosticResultClient.tsx`

```tsx
"use client";

import { useEffect, useState } from "react";
import { questions, effectiveScore } from "@/data/questions";
import { DIMENSION_LABELS } from "@/lib/rec/engine";
import ResultRadarChart from "./ResultRadarChart";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

interface ResultData {
  id: string;
  synthesis: string;
  answers: Record<string, number>;
}

interface DiagnosticResultClientProps {
  resultId: string;
}

export default function DiagnosticResultClient({ resultId }: DiagnosticResultClientProps) {
  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const key = `diagnostic_result_${resultId}`;
    const cached = sessionStorage.getItem(key);
    if (cached) {
      try {
        setData(JSON.parse(cached));
      } catch {
        setError("データの読み込みに失敗しました");
      }
      setLoading(false);
      return;
    }
    fetch(`/api/diagnostic/result/${resultId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Not found"))))
      .then((json) => setData(json))
      .catch(() => setError("結果の取得に失敗しました。もう一度診断をお試しください。"))
      .finally(() => setLoading(false));
  }, [resultId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-semibold uppercase tracking-widest text-sm">Analyzing...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <p className="text-slate-600 mb-6">{error || "結果が見つかりませんでした"}</p>
          <Link
            href="/diagnostic"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800"
          >
            診断をやり直す
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const answers = data.answers;

  // 5カテゴリ（質問ベース）のスコア計算
  const CATEGORY_ORDER = ['Social', 'Empathy', 'Discipline', 'Openness', 'Emotional'] as const;
  const categoryScores: Record<string, { sum: number; count: number }> = {};
  CATEGORY_ORDER.forEach((c) => { categoryScores[c] = { sum: 0, count: 0 }; });

  Object.entries(answers).forEach(([qId, score]) => {
    const q = questions.find((q) => q.id === Number(qId));
    const rawScore = Number(score);
    if (q && categoryScores[q.category] && !isNaN(rawScore)) {
      categoryScores[q.category].sum += effectiveScore(q, rawScore);
      categoryScores[q.category].count += 1;
    }
  });

  // 0-100スケールの生スコア
  const rawByCat = CATEGORY_ORDER.map((c) => {
    const d = categoryScores[c];
    const avg = d.count > 0 ? d.sum / d.count : 4;
    return Math.round(((avg - 1) / 6) * 100);
  });
  const [social, empathy, discipline, openness, emotional] = rawByCat;

  // 6次元マッピング
  const userVector6d: number[] = [
    discipline, openness, empathy, discipline, openness,
    Math.round((emotional + social) / 2),
  ];

  const chartData = DIMENSION_LABELS.map((label, i) => ({
    subject: label,
    A: userVector6d[i] ?? 50,
    fullMark: 100,
  }));

  const synthesisParagraphs = data.synthesis
    .split("\n")
    .filter((p: string) => p.trim() !== "")
    .map((p: string) => p.replace(/AI・?/g, "").replace(/AI分析/g, "分析").replace(/\*/g, ""));

  const handleRegister = async () => {
    if (!nickname) return;
    setIsRegistering(true);
    try {
      const res = await fetch('/api/matching/register', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, email })
      });
      const json = await res.json();
      if (json.success) {
        setIsRegistered(true);
      } else {
        alert("登録に失敗しました: " + (json.error || ""));
      }
    } catch (e) {
      alert("通信エラーが発生しました");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <div className="h-16" />

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-16">
        <section className="bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-xl shadow-slate-200/30 border border-slate-200/60">
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <ResultRadarChart data={chartData} />
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            {chartData.map((item) => (
              <div key={item.subject} className="p-3 bg-slate-50 rounded-xl">
                <div className="text-xs text-slate-500 font-bold mb-1">{item.subject}</div>
                <div className="text-2xl font-black text-slate-900">{item.A}</div>
              </div>
            ))}
          </div>
        </section>

        {isRegistered && (
          <section className="bg-white border-2 border-black rounded-none p-8 md:p-12 shadow-sm relative overflow-hidden">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 tracking-widest text-black border-b-2 border-black pb-4">
              分析レポート
            </h2>
            <div className="space-y-6 text-sm md:text-base leading-relaxed text-black font-medium">
              {synthesisParagraphs.map((para: string, i: number) =>
                para.startsWith("#") ? (
                  <h3 key={i} className="text-lg font-black text-black mt-8 mb-2">
                    {para.replace(/^#+\s/, "")}
                  </h3>
                ) : (
                  <p key={i}>{para}</p>
                )
              )}
            </div>
          </section>
        )}

        <section className="text-center pt-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">

            {isRegistered ? (
              <div className="inline-flex items-center gap-3 px-8 py-4 bg-slate-100 text-slate-500 border-2 border-slate-200 rounded-none font-bold text-sm">
                登録完了しました！
              </div>
            ) : (
              <div className="w-full max-w-md mx-auto bg-white p-8 border-2 border-slate-200 rounded-2xl shadow-sm text-left mt-8">
                <h3 className="text-xl font-bold mb-4 tracking-tight">あなたの軌跡を記録する</h3>
                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                  詳細な分析レポートの閲覧や、今後の自己変容の軌跡を記録するためには登録が必要です。
                </p>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-black ml-1">ニックネーム (必須)</label>
                      <input 
                          type="text"
                          placeholder="例: 匿名希望"
                          value={nickname}
                          onChange={(e) => setNickname(e.target.value)}
                          className="w-full bg-white border-2 border-black px-4 py-3 text-sm text-black focus:outline-none transition-colors rounded-none font-bold"
                      />
                  </div>
                  <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-black ml-1">大学メールアドレス または 学籍番号（任意）</label>
                      <input 
                          type="text"
                          placeholder="例: s1234567 または 12345678"
                          value={email}
                          onChange={(e) => {
                              const val = e.target.value;
                              const trimmed = val.trim().toLowerCase();
                              if (/^[sS]\d{7}$/.test(trimmed) || /^\d{8}$/.test(trimmed)) {
                                  setEmail(`${trimmed}@stu.musashino-u.ac.jp`);
                              } else {
                                  setEmail(val);
                              }
                          }}
                          className="w-full bg-white border-2 border-black px-4 py-3 text-sm text-black focus:outline-none transition-colors rounded-none placeholder:text-gray-300 font-bold"
                      />
                      <p className="text-[9px] text-gray-400 mt-1 leading-relaxed">
                          ※ s＋7桁 または 8桁の学籍番号を入力した瞬間に、@stu.musashino-u.ac.jp が自動入力されます。<br/>
                          ※メールアドレスはハッシュ化されて保存され、個人は特定されません。学内共通ドメイン判定に使用されます。<br/>
                          ※送信ボタンを押すことで、<a href="/terms" target="_blank" className="underline hover:text-black">利用規約</a>および<a href="/privacy" target="_blank" className="underline hover:text-black">プライバシーポリシー</a>に同意したものとみなされます。
                      </p>
                  </div>
                  <button
                    onClick={handleRegister}
                    disabled={isRegistering || !nickname.trim()}
                    className="w-full mt-4 flex justify-center items-center gap-3 px-8 py-4 bg-black text-white border-2 border-black rounded-none font-bold text-sm hover:bg-white hover:text-black transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isRegistering ? "処理中..." : "分析レポートを記録して確認する"}
                    {!isRegistering && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

```

---

## `src\components\diagnostic\ResultRadarChart.tsx`

```tsx
"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  PolarRadiusAxis
} from "recharts";

interface ResultRadarChartProps {
  data: {
    subject: string;
    A: number;
    fullMark: number;
  }[];
}

export default function ResultRadarChart({ data }: ResultRadarChartProps) {
  return (
    <div className="w-full h-[300px] sm:h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 600 }}
          />
          <PolarRadiusAxis angle={30} domain={[0, data[0]?.fullMark ?? 100]} tick={false} axisLine={false} />
          <Radar
            name="Personality"
            dataKey="A"
            stroke="#7C3AED"
            fill="#7C3AED"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

```

---

## `src\components\diagnostic\CompareRadarChart.tsx`

```tsx
"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface CompareRadarChartProps {
  myVector: number[];
  partnerVector: number[];
  labels?: string[];
}

export default function CompareRadarChart({
  myVector,
  partnerVector,
  labels = ["論理性", "直感力", "共感性", "意志力", "創造性", "柔軟性"],
}: CompareRadarChartProps) {
  const data = labels.map((label, i) => ({
    subject: label,
    me: myVector[i] ?? 0,
    partner: partnerVector[i] ?? 0,
    fullMark: 100,
  }));

  return (
    <div className="w-full h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }}
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="あなた"
            dataKey="me"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.25}
            strokeWidth={2}
          />
          <Radar
            name="相手"
            dataKey="partner"
            stroke="#f43f5e"
            fill="#f43f5e"
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, fontWeight: 600 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

```

---

## `src\components\chat\PostChatInterview.tsx`

```tsx
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, ChevronLeft, ChevronRight, Check } from "lucide-react";

const QUESTIONS = [
  { key: "aboutPartner" as const, label: "相手はどうでしたか？" },
  { key: "howChanged" as const, label: "自分はどう変わった？" },
  { key: "grew" as const, label: "成長を実感できた？" },
  { key: "togetherFeel" as const, label: "一緒にいてどうだった？" },
] as const;

const LIKERT_OPTIONS = [
  { value: 1, label: "同意しない", color: "bg-red-500", size: "w-16 h-16", border: "border-red-500" },
  { value: 2, label: "", color: "bg-red-400", size: "w-12 h-12", border: "border-red-400" },
  { value: 3, label: "", color: "bg-red-300", size: "w-8 h-8", border: "border-red-300" },
  { value: 4, label: "中立", color: "bg-slate-200", size: "w-6 h-6", border: "border-slate-300" },
  { value: 5, label: "", color: "bg-green-300", size: "w-8 h-8", border: "border-green-300" },
  { value: 6, label: "", color: "bg-green-400", size: "w-12 h-12", border: "border-green-400" },
  { value: 7, label: "同意する", color: "bg-green-500", size: "w-16 h-16", border: "border-green-500" },
];

export interface ReflectionAnswers {
  aboutPartner: number;
  howChanged: number;
  grew: number;
  togetherFeel: number;
}

interface PostChatInterviewProps {
  partnerName: string;
  onSubmit: (answers: ReflectionAnswers) => void;
  onSkip: () => void;
}

export default function PostChatInterview({
  partnerName,
  onSubmit,
  onSkip,
}: PostChatInterviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<ReflectionAnswers>>({});

  const currentQ = QUESTIONS[currentIndex];
  const value = answers[currentQ.key];
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === 4;

  const handleAnswer = (v: number) => {
    setAnswers((prev) => ({ ...prev, [currentQ.key]: v }));
    if (currentIndex < 3) {
      setTimeout(() => setCurrentIndex((i) => i + 1), 300);
    }
  };

  const handleSubmit = () => {
    if (
      typeof answers.aboutPartner === "number" &&
      typeof answers.howChanged === "number" &&
      typeof answers.grew === "number" &&
      typeof answers.togetherFeel === "number"
    ) {
      onSubmit({
        aboutPartner: answers.aboutPartner,
        howChanged: answers.howChanged,
        grew: answers.grew,
        togetherFeel: answers.togetherFeel,
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 min-h-[600px] flex flex-col justify-center">
      <div className="relative perspective-1000">
        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm overflow-visible transition-all duration-500 text-slate-900">
          <CardContent className="p-8 sm:p-12 text-center space-y-10">
            <div className="space-y-4">
              <span className="text-sm font-bold text-indigo-500 tracking-widest uppercase">
                振り返り {currentIndex + 1} / 4
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 leading-tight">
                {partnerName}さんとの振り返り
              </h2>
              <p className="text-sm text-slate-500">1〜7で回答してください</p>
            </div>

            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="text-xl font-bold text-slate-800">{currentQ.label}</h3>
              <div className="flex items-center justify-center gap-3 sm:gap-6 py-4">
                <div className="hidden sm:block text-xs font-bold text-red-500/80 mr-2">同意しない</div>
                {LIKERT_OPTIONS.map((opt) => {
                  const isSelected = value === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleAnswer(opt.value)}
                      className={`
                        rounded-full transition-all duration-300 flex items-center justify-center
                        ${opt.size}
                        ${isSelected
                          ? `${opt.color} ring-4 ring-offset-2 ring-indigo-100 scale-110 text-white`
                          : `bg-transparent border-2 ${opt.border} hover:bg-slate-50`}
                      `}
                      aria-label={`Select ${opt.value}`}
                    >
                      {isSelected && <Check className="w-5 h-5 stroke-[3px]" />}
                    </button>
                  );
                })}
                <div className="hidden sm:block text-xs font-bold text-green-600/80 ml-2">同意する</div>
              </div>
              <div className="flex sm:hidden justify-between text-xs font-bold text-slate-400 px-2">
                <span className="text-red-500">同意しない</span>
                <span className="text-green-600">同意する</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={onSkip}
                className="flex-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              >
                スキップ
              </Button>
              <Button
                variant="ghost"
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
                className="text-slate-500"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!allAnswered}
                className="flex-1 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                送信
              </Button>
              <Button
                variant="ghost"
                onClick={() => setCurrentIndex((i) => Math.min(3, i + 1))}
                disabled={currentIndex === 3}
                className="text-slate-500"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

```

---

## `src\components\chat\ReflectionView.tsx`

```tsx
"use client";

import { motion } from "framer-motion";
import { Sparkles, Home } from "lucide-react";
import Link from "next/link";

const LIKERT_LABELS: Record<number, string> = {
    1: "同意しない",
    2: "やや同意しない",
    3: "どちらかといえば同意しない",
    4: "中立",
    5: "どちらかといえば同意する",
    6: "やや同意する",
    7: "同意する",
};

interface ReflectionViewProps {
    answers: { aboutPartner: number; howChanged: number; grew: number; togetherFeel: number };
    summary: string;
    partnerName: string;
}

export default function ReflectionView({ answers, summary, partnerName }: ReflectionViewProps) {
    const items = [
        { q: "相手はどうでしたか？", a: LIKERT_LABELS[answers.aboutPartner] ?? answers.aboutPartner },
        { q: "自分はどう変わった？", a: LIKERT_LABELS[answers.howChanged] ?? answers.howChanged },
        { q: "成長を実感できた？", a: LIKERT_LABELS[answers.grew] ?? answers.grew },
        { q: "一緒にいてどうだった？", a: LIKERT_LABELS[answers.togetherFeel] ?? answers.togetherFeel },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/60 p-6"
        >
            <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-slate-700" />
                <h3 className="text-lg font-bold text-slate-900">あなたの変化</h3>
            </div>

            <div className="p-4 bg-slate-100 rounded-xl mb-6">
                <p className="text-sm text-slate-900 font-medium leading-relaxed">{summary}</p>
            </div>

            <div className="space-y-3 mb-8">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {partnerName}さんとの振り返り
                </p>
                {items.map((item) => (
                    <div key={item.q} className="text-sm">
                        <span className="text-slate-500">{item.q}</span>
                        <p className="text-slate-800 mt-0.5">{item.a}</p>
                    </div>
                ))}
            </div>

            <div className="flex gap-3">
              <Link
                href="/mypage"
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl transition-colors"
              >
                マイページ
              </Link>
              <Link
                href="/"
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors"
              >
                <Home className="w-4 h-4" />
                ホームへ
              </Link>
            </div>
        </motion.div>
    );
}

```

---

## `src\components\product\ThreeLayerModel.tsx`

```tsx
"use client";

import { motion } from "framer-motion";

export default function ThreeLayerModel() {
  return (
    <div className="relative w-full h-full min-h-[300px] flex flex-col justify-end items-center py-8">
      
      {/* Layer 3: Delta (High Frequency) */}
      <div className="relative w-48 h-16 mb-4 z-30">
        <motion.div 
          className="absolute inset-0 bg-slate-200/20 border border-slate-300/50 rounded-lg backdrop-blur-sm"
          animate={{ 
            boxShadow: ["0 0 10px rgba(203, 213, 225, 0.2)", "0 0 20px rgba(203, 213, 225, 0.6)", "0 0 10px rgba(203, 213, 225, 0.2)"],
            borderColor: ["rgba(148, 163, 184, 0.5)", "rgba(148, 163, 184, 1)", "rgba(148, 163, 184, 0.5)"]
           }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-slate-700 font-bold font-mono tracking-widest text-sm">LAYER 3: Δ</span>
        </div>
        {/* Floating Particles */}
        {[...Array(5)].map((_, i) => (
            <motion.div
                key={i}
                className="absolute w-1 h-1 bg-slate-400 rounded-full"
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{ 
                    x: (Math.random() - 0.5) * 100, 
                    y: (Math.random() - 0.5) * 50, 
                    opacity: [0, 1, 0] 
                }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                style={{ top: '50%', left: '50%' }}
            />
        ))}
      </div>

      {/* Layer 2: Merge (Fluid) */}
      <div className="relative w-56 h-24 mb-1 z-20">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-400/10 to-slate-600/10 border-x border-t border-slate-500/30 rounded-t-xl" />
        <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-slate-400 font-bold font-mono tracking-widest text-sm">LAYER 2: MERGE</span>
        </div>
        {/* Connecting Lines */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-slate-500/20" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-slate-500/20" />
      </div>

      {/* Layer 1: Core (Solid) */}
      <div className="relative w-64 h-32 z-10 glass-panel border border-slate-700 bg-slate-900/80 rounded-xl shadow-2xl flex items-center justify-center">
        <div className="absolute inset-0 bg-black/20 rounded-xl" />
        <div className="text-center">
            <div className="text-slate-200 font-black text-xl tracking-widest mb-1">CORE</div>
            <div className="text-[10px] text-slate-400 font-mono">IMMUTABLE LOGIC</div>
        </div>
        {/* Grid Pattern */}
        <div 
            className="absolute inset-0 opacity-10" 
            style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '10px 10px' }} 
        />
      </div>

      {/* Central Axis */}
      <div className="absolute top-10 bottom-10 w-px bg-gradient-to-b from-slate-300/0 via-slate-500/50 to-slate-900/0 z-0" />

    </div>
  );
}

```

---

## `src\components\ui\card.tsx`

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "rounded-xl border border-white/10 bg-black/40 text-white shadow-sm backdrop-blur-sm",
            className
        )}
        {...props}
    />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 p-6", className)}
        {...props}
    />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn(
            "text-2xl font-semibold leading-none tracking-tight",
            className
        )}
        {...props}
    />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-zax-muted", className)}
        {...props}
    />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex items-center p-6 pt-0", className)}
        {...props}
    />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }

```

---

## `src\components\ui\button.tsx`

```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default:
                    "bg-primary text-primary-foreground shadow hover:bg-primary/90",
                destructive:
                    "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
                outline:
                    "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
                secondary:
                    "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline",
            },
            size: {
                default: "h-9 px-4 py-2",
                sm: "h-8 rounded-md px-3 text-xs",
                lg: "h-10 rounded-md px-8",
                icon: "h-9 w-9",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }

```

---

## `src\lib\gemini.ts`

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logGemini } from "./gemini-log";

const API_KEY = process.env.GOOGLE_API_KEY || "";

export const genAI = new GoogleGenerativeAI(API_KEY);
export const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
export const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" }); // Updated to supported embedding model

export interface AnalysisResult {
    vector: number[]; // 6-dim radar chart stats (0-100) -> V_display
    embedding?: number[]; // 768-dim raw embedding -> V_essence (Hidden)
    reasoning: string;
    resonance_score: number;
}

export async function analyzeEssence(inputs: string[], biases: number[] = [50, 50, 50], purpose: string = "general"): Promise<AnalysisResult> {
    if (!API_KEY) {
        throw new Error("GOOGLE_API_KEY is not configured. Cannot perform analysis.");
    }

    // 1. Generate V_display (6-dim) via LLM
    // Sanitize function to prevent simple injection
    const sanitize = (str: string) => str.replace(/`/g, "'").replace(/\$/g, "");
    
    const safeInputs = inputs.map(sanitize);

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

        const out = { ...parsed, embedding: embeddingResult.embedding.values.slice(0, 768) };
        logGemini("analyzeEssence", prompt, JSON.stringify(parsed), { inputs: safeInputs.length }).catch(() => {});
        return out;
    } catch (e: any) {
        console.error("Gemini API Error (Synthesis):", e);
        // Log the error to the DB for debugging
        await logGemini("error", prompt, `ERROR: ${e.message || String(e)}`, { stack: e.stack }).catch(() => {});
        
        // Throw error instead of returning mock data to avoid polluting database
        throw new Error("診断 API の通信に失敗しました。時間をおいて再度お試しください。");
    }
}

/** RAG風: ユーザー分析＋相手プロフィールから相性の理由を生成 */
export async function generateMatchReasoning(
    userSynthesis: string,
    partnerName: string,
    partnerBio: string,
    partnerTags: string[],
    similarityPercent: number,
    growthScore: number
): Promise<string> {
    if (!API_KEY) throw new Error("GOOGLE_API_KEY is not configured.");
    const prompt = `
あなたはマッチングアドバイザーです。以下の情報をもとに、なぜこの2人が相性が良いか、50文字以内の日本語で簡潔に説明してください。

【ユーザーの性格分析】
${userSynthesis.slice(0, 500)}

【相性の良い相手】
名前: ${partnerName}
プロフィール: ${partnerBio}
タグ: ${partnerTags.join(", ")}

【数値】
マッチ度: ${similarityPercent}%
成長ポテンシャル: ${growthScore}%

50文字以内で、具体的で温かい推薦理由を1文で出力してください。JSONは不要、テキストのみ。
`;
    try {
        const result = await model.generateContent(prompt);
        const text = (await result.response).text().trim().slice(0, 120) || `${partnerName}さんとの相性が良いです。`;
        logGemini("matchReasoning", prompt, text, { partnerName, similarityPercent, growthScore }).catch(() => {});
        return text;
    } catch (e) {
        console.warn("Gemini match reasoning error:", e);
        return `${partnerName}さんは${partnerBio} マッチ度${similarityPercent}%。`;
    }
}

export interface DeltaResult {
    delta_vector: number[];
    new_vector: number[];
    growth_score: number;
}

export async function calculateDeltaVector(feedback: string, currentVector: number[] = [50, 50, 50, 50, 50, 50], tags: string[] = []): Promise<DeltaResult> {
    if (!API_KEY) {
        throw new Error("GOOGLE_API_KEY is not configured.");
    }

    const prompt = `
    User Context Vector: [${currentVector.join(", ")}] (Logic, Intuition, Empathy, Determination, Creativity, Flexibility)
    User Feedback after interaction: "${feedback}"
    Selected Resonance Tags: "${tags.join(", ")}"
    * Tags like "Reassurance" should stabilize vector. "Challenge" should trigger larger delta. "Inspiration" increases Creativity.

    Task:
    1. Analyze the feedback to understand how the user's internal state has changed.
    2. Calculate a "Delta Vector" (6 dims) representing this shift. Positive means growth/increase, negative means decrease.
    3. Calculate the "New Vector" = Current + Delta. Ensure bounds 0-100.
    4. Calculate a "Growth Score" (0-100) based on the magnitude of positive, constructive change.

    Format: JSON only. Keys: "delta_vector" (array), "new_vector" (array), "growth_score" (number).
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(jsonStr) as DeltaResult;
    } catch (e) {
        console.error("Delta Calc Error", e);
        return {
            delta_vector: [0, 0, 0, 0, 0, 0],
            new_vector: currentVector,
            growth_score: 0
        };
    }
}

/** インタビュー回答から「あなたの変化」サマリーを生成 */
export async function generateReflectionSummary(interviewText: string): Promise<string> {
    if (!API_KEY) return "あなたの振り返りが記録されました。";
    const prompt = `
以下の振り返り回答をもとに、「あなたがどう変わったか」を50文字以内の日本語で要約してください。
温かく、前向きな表現で。

【振り返り】
${interviewText.slice(0, 500)}

50文字以内、1文で。JSON不要、テキストのみ。
`;
    try {
        const result = await model.generateContent(prompt);
        const text = (await result.response).text().trim().slice(0, 80) || "あなたの振り返りが記録されました。";
        logGemini("reflectionSummary", prompt, text).catch(() => {});
        return text;
    } catch (e) {
        console.warn("Reflection summary error:", e);
        return "あなたの振り返りが記録されました。";
    }
}

```

---

## `src\lib\gemini-log.ts`

```typescript
import { prisma } from "./db/client";

export type GeminiLogType =
  | "synthesis"
  | "matchReasoning"
  | "reflectionSummary"
  | "analyzeEssence"
  | "calculateDeltaVector"
  | "error";

/** Geminiの入出力をDBに保存（非同期・エラーは握りつぶす） */
export async function logGemini(
  type: GeminiLogType,
  prompt: string,
  response: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const p = prisma as { geminiLog?: { create: (args: any) => Promise<any> } };
    if (!p?.geminiLog) return;
    await p.geminiLog.create({
      data: {
        type,
        prompt: prompt.slice(0, 50000),
        response: response.slice(0, 50000),
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch {
    // ログ失敗は本処理に影響させない
  }
}

```

---

## `src\lib\db\client.ts`

```typescript

import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let connectionUrl: string | undefined = undefined;

if (process.env.DATABASE_URL) {
  try {
    // 改行文字（\n）や空白がVercelの環境変数に混入しているケースを防ぐためのクレンジング
    let rawUrl = process.env.DATABASE_URL.replace(/\\n/g, '').replace(/\n/g, '').trim();
    
    // URLオブジェクトを使って安全にクエリパラメータを付与・上書きする
    const url = new URL(rawUrl);
    url.searchParams.set('pgbouncer', 'true');
    url.searchParams.set('connection_limit', '1');
    connectionUrl = url.toString();
  } catch (e) {
    console.error("Failed to parse DATABASE_URL", e);
    // パース失敗時のフォールバック
    let rawUrl = process.env.DATABASE_URL.replace(/\\n/g, '').replace(/\n/g, '').trim();
    connectionUrl = `${rawUrl}${rawUrl.includes('?') ? '&' : '?'}pgbouncer=true&connection_limit=1`;
  }
}

export const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: connectionUrl ? { db: { url: connectionUrl } } : undefined,
  log: ['query', 'info', 'warn', 'error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * ベクトル検索と保存のためのヘルパーオブジェクト
 * PostgreSQLのpgvector拡張を使用
 */
export const vectorStore = {
    /**
     * ベクトルを保存する
     * @param userId ユーザーID
     * @param embedding 埋め込みベクトル (768次元 - RAG用)
     * @param statsVector ステータスベクトル (6次元 - 可視化用) [Optional]
     * @param reasoning ベクトルの根拠・コンテキスト
     * @param resonanceScore マッチスコア (各ベクトルの重み付け)
     */
    async saveEmbedding(userId: string, embedding: number[], statsVector: number[] | null, reasoning: string, resonanceScore: number) {
        // pgvector形式の文字列に変換 '[0.1, 0.2, ...]'
        const vectorString = `[${embedding.join(",")}]`;
        const statsString = statsVector ? JSON.stringify(statsVector) : null;
        
        // 1. EssenceVectorテーブルへの保存 (pgvector型)
        // vectorJsonにはembeddingを保存しておく（バックアップ）
        // statsVectorには6次元ステータスをJSONとして保存
        await prisma.$executeRaw`
            INSERT INTO "essence_vectors" ("id", "userId", "vector", "vectorJson", "statsVector", "reasoning", "resonanceScore", "createdAt")
            VALUES (gen_random_uuid(), ${userId}, ${vectorString}::vector, ${vectorString}, ${statsString}, ${reasoning}, ${resonanceScore}, NOW())
        `;
    },

    /**
     * 類似ベクトルを検索する
     * @param targetVector 検索対象ベクトル (768次元)
     * @param limit 取得件数
     * @param userId (Optional) 特定ユーザーのみ対象にする場合
     * @returns 類似度順にソートされた結果
     */
    async searchSimilar(targetVector: number[], limit: number = 5, userId?: string) {
        const vectorString = `[${targetVector.join(",")}]`;
        
        // Cosine distance (<=>) を使用して距離を計算し、昇順ソート (距離が近い＝類似)
        if (userId) {
            return await prisma.$queryRaw`
                SELECT ev.id, ev."userId", ev.reasoning, ev."resonanceScore", ev."createdAt", ev."statsVector",
                       (ev.vector <=> ${vectorString}::vector) as distance
                FROM "essence_vectors" ev
                WHERE ev."userId" = ${userId}
                ORDER BY distance ASC
                LIMIT ${limit}
            `;
        } else {
             return await prisma.$queryRaw`
                SELECT ev.id, ev."userId", ev.reasoning, ev."resonanceScore", ev."createdAt", ev."statsVector",
                       (ev.vector <=> ${vectorString}::vector) as distance
                FROM "essence_vectors" ev
                ORDER BY distance ASC
                LIMIT ${limit}
            `;
        }
    },

    /**
     * マッチング候補を検索する (ドメイン限定)
     * @param targetVector 検索対象ベクトル
     * @param domainHash ドメインハッシュ (必須)
     * @param limit 取得件数
     * @param excludeUserId 除外するユーザーID (自分自身)
     */
    async searchCandidates(targetVector: number[], domainHash: string, limit: number = 10, excludeUserId: string) {
        const vectorString = `[${targetVector.join(",")}]`;
        
        // UsersテーブルとJOINしてdomainHashでフィルタリング
        return await prisma.$queryRaw`
            SELECT u.id as "userId", u.nickname, u.affiliation, u."contactEmail", ev.reasoning, ev."statsVector",
                   (ev.vector <=> ${vectorString}::vector) as distance
            FROM "essence_vectors" ev
            JOIN "users" u ON ev."userId" = u.id
            WHERE u."domainHash" = ${domainHash}
            AND u.id != ${excludeUserId}
            ORDER BY distance ASC
            LIMIT ${limit}
        `;
    }
};

```

---

## `src\lib\crypto.ts`

```typescript
import crypto from 'crypto';

// セキュリティ: 環境変数がなければ起動を拒否（デフォルトキーは含めない）
// ビルドフェーズ（next build）では未使用のプレースホルダーで通過を許可
const rawKey = process.env.ENCRYPTION_KEY;
const isBuildPhase =
    process.env.npm_lifecycle_event === 'build' ||
    process.env.NEXT_PHASE === 'phase-production-build';

if ((!rawKey || rawKey.trim() === '') && !isBuildPhase) {
    throw new Error(
        "[ZAX] ENCRYPTION_KEY environment variable is required. " +
        "Set a secure 32-character key (e.g. openssl rand -base64 24)."
    );
}

const ENCRYPTION_KEY = (rawKey && rawKey.trim() !== '') ? rawKey : 'build-placeholder-never-used-at-runtime';
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Encrypts a text string using AES-256-CBC
 */
export function encrypt(text: string): string {
    // Ensure the key is 32 bytes (256 bits)
    // If the provided key is short, we pad it or hash it. Here we assume it's roughly correct or just hash it to be safe.
    const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest('base64').slice(0, 32);
    
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    // Return properly formatted string: IV:EncryptedText
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Decrypts a text string using AES-256-CBC
 */
export function decrypt(text: string): string {
    const textParts = text.split(':');
    const ivPart = textParts.shift();
    if (!ivPart) throw new Error("Invalid encrypted text format");
    
    const iv = Buffer.from(ivPart, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest('base64').slice(0, 32);
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString();
}

/**
 * Signs a session ID using HMAC-SHA256 to prevent tampering (Session Hijacking protection).
 * Format: "userId.signature"
 */
export function signSession(userId: string): string {
    const hmac = crypto.createHmac('sha256', ENCRYPTION_KEY);
    hmac.update(userId);
    return `${userId}.${hmac.digest('hex')}`;
}

/**
 * Verifies a signed session ID and returns the raw userId as string.
 * Returns null if the signature is invalid or tampered with.
 */
export function verifySession(signedSession: string | undefined | null): string | null {
    if (!signedSession) return null;
    const parts = signedSession.split('.');
    
    // If no signature is present (old cookie), return null for security to force re-auth
    if (parts.length !== 2) return null; 
    
    const [userId, signature] = parts;
    const hmac = crypto.createHmac('sha256', ENCRYPTION_KEY);
    hmac.update(userId);
    
    // Use timingSafeEqual to prevent timing attacks
    const expectedSignature = hmac.digest('hex');
    if (expectedSignature.length === signature.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        return userId;
    }
    return null;
}

```

---

## `src\lib\utils.ts`

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

```

---

## `src\lib\rec\engine.ts`

```typescript
import { vectorStore } from "../db/client";
import { generateMatchReasoning } from "../gemini";

// ─── 50 Archetype Personas (Demo Seed) ───
// 性格パターンを反映した6次元ベクトル [Logic, Intuition, Empathy, Determination, Creativity, Flexibility]
export const ARCHETYPE_USERS = [
  // ─── 論理重視型 (10人) ───
  { id: "A-001", name: "田中 健太", vector: [92, 25, 35, 78, 40, 30], bio: "構造的な思考を得意とし、物事の根本原理を追求する。", tags: ["Logic", "Structure"] },
  { id: "A-002", name: "山本 理沙", vector: [88, 30, 45, 70, 35, 40], bio: "データに基づく意思決定を重視する分析家。", tags: ["Logic", "Analysis"] },
  { id: "A-003", name: "鈴木 翔", vector: [85, 40, 30, 85, 30, 25], bio: "効率と合理性を追求するストラテジスト。", tags: ["Logic", "Strategy"] },
  { id: "A-004", name: "高橋 美咲", vector: [90, 20, 50, 65, 45, 35], bio: "論理と共感のバランスを模索する研究者。", tags: ["Logic", "Research"] },
  { id: "A-005", name: "伊藤 大輝", vector: [95, 15, 20, 90, 25, 20], bio: "数理モデルで世界を理解しようとする純粋な論理型。", tags: ["Logic", "Math"] },
  { id: "A-006", name: "渡辺 麻衣", vector: [82, 35, 55, 60, 50, 45], bio: "科学的思考と人への配慮を両立する。", tags: ["Logic", "Care"] },
  { id: "A-007", name: "中村 拓也", vector: [87, 28, 40, 75, 38, 32], bio: "システム設計に情熱を注ぐエンジニア気質。", tags: ["Logic", "Systems"] },
  { id: "A-008", name: "小林 由香", vector: [80, 45, 48, 68, 42, 50], bio: "論理と直感の境界を探る哲学者タイプ。", tags: ["Logic", "Philosophy"] },
  { id: "A-009", name: "加藤 陸", vector: [93, 18, 25, 88, 20, 28], bio: "白黒はっきりつけたい完璧主義者。", tags: ["Logic", "Precision"] },
  { id: "A-010", name: "吉田 さくら", vector: [84, 38, 60, 55, 48, 42], bio: "理系でありながら文系的感性も持つ。", tags: ["Logic", "Hybrid"] },

  // ─── 直感・創造型 (10人) ───
  { id: "A-011", name: "佐藤 愛", vector: [25, 90, 75, 35, 92, 80], bio: "直感でパターンを見抜く天才的な創造力。", tags: ["Intuition", "Creative"] },
  { id: "A-012", name: "松本 龍之介", vector: [30, 85, 65, 40, 95, 75], bio: "既存の枠を壊して新しいものを生み出す。", tags: ["Creativity", "Innovation"] },
  { id: "A-013", name: "井上 彩花", vector: [35, 80, 70, 30, 88, 85], bio: "アートと直感で世界を理解する感性派。", tags: ["Intuition", "Art"] },
  { id: "A-014", name: "木村 悠真", vector: [40, 88, 55, 45, 90, 70], bio: "閃きを形にする発明家タイプ。", tags: ["Creativity", "Invention"] },
  { id: "A-015", name: "林 美月", vector: [20, 92, 80, 25, 85, 90], bio: "流れるように変化を受け入れる自由人。", tags: ["Intuition", "Flow"] },
  { id: "A-016", name: "清水 蓮", vector: [45, 78, 60, 50, 92, 65], bio: "音楽とテクノロジーの融合を追求する。", tags: ["Creativity", "Music"] },
  { id: "A-017", name: "山口 千尋", vector: [28, 86, 72, 32, 88, 82], bio: "言語を超えた表現を模索するアーティスト。", tags: ["Creativity", "Expression"] },
  { id: "A-018", name: "中島 海斗", vector: [38, 82, 58, 48, 94, 68], bio: "未来を先読みするビジョナリー。", tags: ["Intuition", "Vision"] },
  { id: "A-019", name: "藤田 凛", vector: [32, 90, 68, 28, 86, 88], bio: "感覚で捉えた美をデザインに落とし込む。", tags: ["Creativity", "Design"] },
  { id: "A-020", name: "岡田 颯太", vector: [42, 84, 50, 55, 90, 60], bio: "常識を疑い、新しい価値を創出する。", tags: ["Creativity", "Disruption"] },

  // ─── 共感・調和型 (10人) ───
  { id: "A-021", name: "三浦 優奈", vector: [30, 70, 95, 35, 55, 88], bio: "人の痛みを自分のことのように感じる共感力。", tags: ["Empathy", "Compassion"] },
  { id: "A-022", name: "前田 隼人", vector: [40, 65, 90, 45, 50, 82], bio: "チームの調和を第一に考えるファシリテーター。", tags: ["Empathy", "Harmony"] },
  { id: "A-023", name: "石川 結衣", vector: [25, 75, 92, 30, 60, 90], bio: "相手の心に寄り添うカウンセラー気質。", tags: ["Empathy", "Healing"] },
  { id: "A-024", name: "小川 大和", vector: [45, 60, 88, 50, 45, 78], bio: "組織の潤滑油として信頼を集める。", tags: ["Empathy", "Trust"] },
  { id: "A-025", name: "後藤 真奈", vector: [35, 72, 94, 28, 58, 85], bio: "言葉にならない感情を察知する。", tags: ["Empathy", "Sensitivity"] },
  { id: "A-026", name: "長谷川 悠斗", vector: [50, 55, 85, 55, 40, 80], bio: "実務能力と共感力を兼ね備えたリーダー。", tags: ["Empathy", "Leadership"] },
  { id: "A-027", name: "村上 あかり", vector: [28, 68, 92, 32, 62, 92], bio: "多様性を受け入れ、全ての人と繋がれる。", tags: ["Empathy", "Diversity"] },
  { id: "A-028", name: "近藤 蒼", vector: [42, 58, 86, 48, 52, 75], bio: "対話を通じて相互理解を促進する。", tags: ["Empathy", "Dialogue"] },
  { id: "A-029", name: "坂本 花音", vector: [22, 78, 90, 25, 65, 88], bio: "自然体で周囲を癒やす存在。", tags: ["Empathy", "Natural"] },
  { id: "A-030", name: "遠藤 陽向", vector: [38, 62, 88, 42, 48, 82], bio: "対立を解消し、Win-Winを実現する調停者。", tags: ["Empathy", "Mediation"] },

  // ─── 意志・推進型 (10人) ───
  { id: "A-031", name: "青木 凌", vector: [65, 35, 25, 95, 45, 35], bio: "目標に向かって一直線に突き進む。", tags: ["Determination", "Focus"] },
  { id: "A-032", name: "藤井 七海", vector: [55, 40, 35, 92, 50, 40], bio: "困難を楽しむチャレンジャー精神。", tags: ["Determination", "Challenge"] },
  { id: "A-033", name: "西村 晃太", vector: [70, 30, 20, 90, 40, 30], bio: "結果にこだわる実績主義者。", tags: ["Determination", "Results"] },
  { id: "A-034", name: "松田 莉子", vector: [60, 45, 40, 88, 55, 45], bio: "ビジョンを語り、人を動かすリーダー。", tags: ["Determination", "Vision"] },
  { id: "A-035", name: "井田 大翔", vector: [72, 25, 30, 94, 35, 28], bio: "自分に厳しく、限界を超え続ける。", tags: ["Determination", "Discipline"] },
  { id: "A-036", name: "原田 杏", vector: [50, 50, 45, 85, 60, 50], bio: "起業家精神で新しい道を切り開く。", tags: ["Determination", "Entrepreneurship"] },
  { id: "A-037", name: "石田 瑛太", vector: [68, 32, 28, 92, 38, 32], bio: "勝負の世界で生きるアスリート気質。", tags: ["Determination", "Competition"] },
  { id: "A-038", name: "大野 詩織", vector: [58, 42, 50, 86, 48, 48], bio: "粘り強さと柔軟性を使い分ける。", tags: ["Determination", "Resilience"] },
  { id: "A-039", name: "菅原 匠", vector: [75, 28, 22, 96, 30, 25], bio: "妥協を許さない完遂への執念。", tags: ["Determination", "Completion"] },
  { id: "A-040", name: "上田 実央", vector: [52, 48, 55, 82, 52, 55], bio: "情熱と思いやりで周囲を巻き込む。", tags: ["Determination", "Passion"] },

  // ─── バランス・柔軟型 (10人) ───
  { id: "A-041", name: "竹内 涼", vector: [60, 58, 62, 55, 65, 92], bio: "どんな環境にも適応するカメレオン。", tags: ["Flexibility", "Adaptation"] },
  { id: "A-042", name: "金子 ひなた", vector: [55, 62, 58, 52, 60, 88], bio: "バランスの中に独自のスタイルを見出す。", tags: ["Flexibility", "Balance"] },
  { id: "A-043", name: "山下 湊", vector: [65, 55, 55, 60, 58, 90], bio: "多趣味で視野が広い万能型。", tags: ["Flexibility", "Versatile"] },
  { id: "A-044", name: "佐々木 心晴", vector: [50, 65, 65, 48, 68, 85], bio: "流行を敏感にキャッチし、変化を先取りする。", tags: ["Flexibility", "Trend"] },
  { id: "A-045", name: "阿部 壮太", vector: [58, 60, 55, 58, 62, 94], bio: "対立を嫌い、常に最適解を探す。", tags: ["Flexibility", "Optimization"] },
  { id: "A-046", name: "橋本 凪", vector: [52, 58, 68, 45, 72, 88], bio: "穏やかさの中に確かな芯を持つ。", tags: ["Flexibility", "Calm"] },
  { id: "A-047", name: "野村 光", vector: [62, 52, 50, 62, 55, 92], bio: "実行力と柔軟性の高次元バランス。", tags: ["Flexibility", "Execution"] },
  { id: "A-048", name: "石橋 瑠奈", vector: [48, 68, 62, 42, 75, 86], bio: "好奇心旺盛で、常に新しい体験を求める。", tags: ["Flexibility", "Curiosity"] },
  { id: "A-049", name: "福田 翼", vector: [55, 55, 55, 55, 55, 95], bio: "究極のバランサー。どんな人ともうまくやれる。", tags: ["Flexibility", "Universal"] },
  { id: "A-050", name: "安藤 紬", vector: [58, 62, 60, 50, 65, 90], bio: "多様な価値観を繋ぎ合わせるコネクター。", tags: ["Flexibility", "Connection"] },
];

// ─── 6次元ラベル ───
export const DIMENSION_LABELS = ["論理性", "直感力", "共感性", "意志力", "創造性", "柔軟性"];
export const DIMENSION_KEYS = ["Logic", "Intuition", "Empathy", "Determination", "Creativity", "Flexibility"];

// ─── Math Utilities ───
function dotProduct(a: number[], b: number[]): number {
  return a.reduce((sum, val, i) => sum + val * b[i], 0);
}

function magnitude(a: number[]): number {
  return Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const magA = magnitude(a);
  const magB = magnitude(b);
  return magA === 0 || magB === 0 ? 0 : dotProduct(a, b) / (magA * magB);
}

/** 補完性スコア: 類似度 optimalSimilarity をピークとするベルカーブ。ユーザー意図で調整可能。 */
export const DEFAULT_OPTIMAL_SIMILARITY = 0.5; // 恋愛: 0.4, ビジネス: 0.5, 深い共感: 0.6 等
export function calculateComplementarityScore(
  userVec: number[],
  targetVec: number[],
  optimalSimilarity: number = DEFAULT_OPTIMAL_SIMILARITY
): number {
  const sim = cosineSimilarity(userVec, targetVec);
  const growthPotential = Math.exp(-Math.pow(sim - optimalSimilarity, 2) / 0.1);
  return growthPotential * 100;
}

// ─── Match Result Types ───
export interface MatchResult {
  matchUser: {
    id: string;
    name: string;
    vector: number[];
    bio: string;
    tags: string[];
  };
  similarity: number;
  growthScore: number;
  reasoning: string;
}

// ─── 日本語の推薦理由を生成 ───
function generateReasoning(userVec: number[], targetVec: number[], sim: number): string {
  let maxGapIndex = 0;
  let maxGap = -100;
  let minGapIndex = 0;
  let minGap = 100;

  userVec.forEach((val, i) => {
    const gap = targetVec[i] - val;
    if (gap > maxGap) { maxGap = gap; maxGapIndex = i; }
    if (gap < minGap) { minGap = gap; minGapIndex = i; }
  });

  const strongDim = DIMENSION_LABELS[maxGapIndex];
  const weakDim = DIMENSION_LABELS[minGapIndex];
  const simPercent = Math.round(sim * 100);
  const growthScore = Math.round(calculateComplementarityScore(userVec, targetVec));

  const templates = [
    `あなたの${weakDim}の高さが、相手の${strongDim}と補完関係にあります。マッチ度${simPercent}%は、成長を促す理想的な距離です。`,
    `${strongDim}が際立つ相手です。あなたにない視点を提供し、${weakDim}の強みで支え合える関係が期待できます。`,
    `ベクトル分析の結果、${strongDim}領域で+${Math.round(maxGap)}の差異を検出。互いの盲点を補い合う、成長ポテンシャル${growthScore}%の組み合わせです。`,
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}

// ─── Top N マッチング検索 ───
export async function findTopMatches(
  userVector: number[],
  topN: number = 5,
  userSynthesis?: string,
  optimalSimilarity: number = DEFAULT_OPTIMAL_SIMILARITY
): Promise<MatchResult[]> {
  const scoreFn = (a: number[], b: number[]) => calculateComplementarityScore(a, b, optimalSimilarity);

  // 1. DB検索を試みる
  try {
    const dbCandidates = await vectorStore.searchSimilar(userVector, 20) as any[];

    if (dbCandidates.length > 0) {
      const results: MatchResult[] = [];
      for (const candidate of dbCandidates) {
        let candidateVector: number[] = [];
        try {
          candidateVector = JSON.parse(candidate.vectorJson || candidate.vector);
        } catch { continue; }

        const sim = cosineSimilarity(userVector, candidateVector);
        const score = scoreFn(userVector, candidateVector);

        let reasoning = generateReasoning(userVector, candidateVector, sim);
        if (userSynthesis) {
          try {
            reasoning = await generateMatchReasoning(
              userSynthesis,
              "価値観の合う仲間",
              candidate.reasoning || "互いの考え方に刺激を受け合える存在。",
              [],
              Math.round(sim * 100),
              Math.round(score)
            );
          } catch {
            /* fallback */
          }
        }
        results.push({
          matchUser: {
            id: candidate.userId,
            name: "価値観の合う仲間",
            vector: candidateVector,
            bio: candidate.reasoning || "互いの考え方に刺激を受け合える存在。",
            tags: [],
          },
          similarity: sim,
          growthScore: Math.round(score),
          reasoning,
        });
      }

      if (results.length > 0) {
        return results
          .sort((a, b) => b.growthScore - a.growthScore)
          .slice(0, topN);
      }
    }
  } catch (e) {
    console.warn("DB Match failed, falling back to Archetypes", e);
  }

  // 2. アーキタイプ（50人）をフォールバック
  const scored = ARCHETYPE_USERS.map((arch) => {
    const sim = cosineSimilarity(userVector, arch.vector);
    const score = scoreFn(userVector, arch.vector);
    return { arch, sim, score };
  })
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);

  const results: MatchResult[] = [];
  for (const { arch, sim, score } of scored) {
    let reasoning = generateReasoning(userVector, arch.vector, sim);
    if (userSynthesis) {
      try {
        reasoning = await generateMatchReasoning(
          userSynthesis,
          arch.name,
          arch.bio,
          arch.tags,
          Math.round(sim * 100),
          Math.round(score)
        );
      } catch {
        // フォールバックは既に reasoning に設定済み
      }
    }
    results.push({
      matchUser: arch,
      similarity: sim,
      growthScore: Math.round(score),
      reasoning,
    });
  }
  return results;
}

// 後方互換
export async function findBestMatch(userVector: number[]): Promise<MatchResult> {
  const matches = await findTopMatches(userVector, 1);
  return matches[0];
}

```

---

## `src\lib\actions\manual-auth.ts`

```typescript
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import crypto from 'crypto';
import { encrypt, signSession, verifySession } from '@/lib/crypto';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

async function migrateGuestData(guestId: string, newUserId: string) {
    if (!guestId || !guestId.startsWith('guest_')) return;
    try {
        await prisma.$transaction([
            prisma.diagnosticResult.updateMany({ where: { userId: guestId }, data: { userId: newUserId } }),
            prisma.essenceVector.updateMany({ where: { userId: guestId }, data: { userId: newUserId } }),
            prisma.feedback.updateMany({ where: { userId: guestId }, data: { userId: newUserId } }),
            prisma.reflection.updateMany({ where: { userId: guestId }, data: { userId: newUserId } })
        ]);
        console.log(`Migrated guest data from ${guestId} to ${newUserId}`);
    } catch (e) {
        console.error('Failed to migrate guest data', e);
    }
}

export async function manualLogin(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // 1. バリデーション
    const validated = schema.safeParse({ email, password });
    if (!validated.success) {
        return { message: "無効な入力データです。" };
    }

    // 2. メールアドレスをハッシュ化してDB検索（register時と同じアルゴリズムです）
    const { createHash } = await import('crypto');
    const emailHash = createHash('sha256').update(email.toLowerCase().trim()).digest('hex');

    const user = await prisma.user.findUnique({
        where: { email: emailHash }
    });

    if (!user) {
        return { message: "メールアドレスまたはパスワードが間違っています。" };
    }

    // 3. パスワード照合 (ハッシュ比較)
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
        return { message: "メールアドレスまたはパスワードが間違っています。" };
    }

    // 4. ゲストデータの引き継ぎ (もし診断後にログインした場合)
    const cookieStore = await cookies();
    const currentSessionId = verifySession(cookieStore.get('zax-session')?.value);
    if (currentSessionId && currentSessionId !== user.id) {
        await migrateGuestData(currentSessionId, user.id);
    }

    // 5. セッション発行 (HTTP-only Cookie)
    // 注意: 本番環境ではJWTやLucia Auth等のライブラリ推奨だが、ここでは簡易実装
    cookieStore.set('zax-session', signSession(user.id), { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7 // 1週間
    });

    redirect('/');
}

export async function manualRegister(prevState: any, formData: FormData) {
    const rawEmail = formData.get('email') as string;
    const password = formData.get('password') as string;

    const validated = schema.safeParse({ email: rawEmail, password });
    if (!validated.success) {
        return { message: "パスワードは6文字以上で入力してください。" };
    }

    const lowerEmail = rawEmail.toLowerCase().trim();

    // ドメイン制限 (武蔵野大学)
    let isStudent = false;
    let domainHash = null;
    let affiliation = null;

    if (lowerEmail.endsWith('@stu.musashino-u.ac.jp') || lowerEmail.endsWith('@musashino-u.ac.jp')) {
        isStudent = true;
        domainHash = crypto.createHash('sha256').update('musashino-u.ac.jp').digest('hex');
        affiliation = "Musashino Univ.";
    } else {
        return { message: "武蔵野大学のメールアドレスのみ登録可能です。" };
    }

    // メールアドレスをハッシュ化（プライバシー保護＆ログイン一貫性）
    const emailHash = crypto.createHash('sha256').update(lowerEmail).digest('hex');

    const existingUser = await prisma.user.findUnique({ where: { email: emailHash } });
    if (existingUser) {
        return { message: "このメールアドレスは既に登録されています。" };
    }

    // パスワードハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
        data: {
            email: emailHash,
            password: hashedPassword,
            isStudent,
            domainHash,
            affiliation,
            isCampusMatchRegistered: true,
            contactEmail: encrypt(lowerEmail)
        }
    });

    // ゲストデータの引き継ぎ
    const cookieStore = await cookies();
    const currentSessionId = verifySession(cookieStore.get('zax-session')?.value);
    if (currentSessionId && currentSessionId !== newUser.id) {
        await migrateGuestData(currentSessionId, newUser.id);
    }

    return { message: "登録成功！ログインしてください。" };
}

export async function logout() {
  (await cookies()).delete('zax-session');
  redirect('/login');
}

```

---

## `src\data\questions.ts`

```typescript
export type Question = {
  id: number;
  text: string;
  category: 'Social' | 'Empathy' | 'Discipline' | 'Openness' | 'Emotional';
  categoryJa: string;
  /** 逆転項目: true のとき 1-7 を 8-score で反転（黙従バイアス軽減） */
  reverse?: boolean;
};

const Q = (o: Question) => o;

/** 1-7スケールで逆転項目の場合は 8 - score を返す */
export function effectiveScore(question: Question, rawScore: number): number {
  if (question.reverse) return 8 - rawScore;
  return rawScore;
}

export const questions: Question[] = [
  // Social Interaction (外向性・コミュニケーション)
  Q({ id: 1, text: "初対面の人と会話を始めるのは得意な方だ。", category: 'Social', categoryJa: '外向性' }),
  Q({ id: 2, text: "週末は家で一人で過ごすよりも、友人と出かけたりイベントに参加したい。", category: 'Social', categoryJa: '外向性' }),
  Q({ id: 3, text: "グループの中では、聞き役よりも話し役になることが多い。", category: 'Social', categoryJa: '外向性' }),
  Q({ id: 4, text: "注目を浴びることに抵抗がない、むしろ好きだ。", category: 'Social', categoryJa: '外向性' }),
  Q({ id: 5, text: "自分の感情や考えを、すぐに言葉にして表現する方だ。", category: 'Social', categoryJa: '外向性' }),
  Q({ id: 6, text: "パーティーや交流会など、人が多い場所に行くとエネルギーをもらえる。", category: 'Social', categoryJa: '外向性' }),
  Q({ id: 7, text: "電話よりもテキストメッセージでのやり取りを好む。", category: 'Social', categoryJa: '外向性', reverse: true }), // テキスト好み=対面減
  Q({ id: 8, text: "誰かと一緒にいるとき、沈黙が続くと気まずいと感じる。", category: 'Social', categoryJa: '外向性' }),
  Q({ id: 9, text: "浅く広い付き合いよりも、狭く深い付き合いを好む。", category: 'Social', categoryJa: '外向性', reverse: true }), // 深く狭く=内向的傾向
  Q({ id: 10, text: "他人の意見に流されず、自分の主張をはっきりと伝えることができる。", category: 'Social', categoryJa: '外向性' }),

  // Empathy & Harmony (協調性・共感性)
  Q({ id: 11, text: "他人の感情の変化に敏感で、すぐ気がつく方だ。", category: 'Empathy', categoryJa: '協調性' }),
  Q({ id: 12, text: "困っている人がいると、自分のことを後回しにしてでも助けたくなる。", category: 'Empathy', categoryJa: '協調性' }),
  Q({ id: 13, text: "議論で勝つことよりも、相手との調和を保つことの方が重要だと思う。", category: 'Empathy', categoryJa: '協調性' }),
  Q({ id: 14, text: "人を批判するよりも、良いところを見つけて褒めるようにしている。", category: 'Empathy', categoryJa: '協調性' }),
  Q({ id: 15, text: "自分の利益よりも、チームやコミュニティ全体の利益を優先する。", category: 'Empathy', categoryJa: '協調性' }),
  Q({ id: 16, text: "映画や小説の登場人物に感情移入して泣いてしまうことがある。", category: 'Empathy', categoryJa: '協調性' }),
  Q({ id: 17, text: "他人の失敗に対して寛容であり、すぐに許すことができる。", category: 'Empathy', categoryJa: '協調性' }),
  Q({ id: 18, text: "嘘をつくことは、どんな理由があっても良くないと思う。", category: 'Empathy', categoryJa: '協調性' }),
  Q({ id: 19, text: "人からの頼み事を断るのが苦手だ。", category: 'Empathy', categoryJa: '協調性' }),
  Q({ id: 20, text: "競争する環境よりも、協力し合う環境の方が能力を発揮できる。", category: 'Empathy', categoryJa: '協調性' }),

  // Discipline & Order (誠実性・規律)
  Q({ id: 21, text: "部屋や机の上は常に整理整頓されている。", category: 'Discipline', categoryJa: '誠実性' }),
  Q({ id: 22, text: "計画を立ててから行動する方で、行き当たりばったりの行動は避ける。", category: 'Discipline', categoryJa: '誠実性' }),
  Q({ id: 23, text: "期限や約束の時間は必ず守る。", category: 'Discipline', categoryJa: '誠実性' }),
  Q({ id: 24, text: "一度始めたことは、どんなに困難でも最後までやり遂げる。", category: 'Discipline', categoryJa: '誠実性' }),
  Q({ id: 25, text: "細かい部分まで注意を払い、ミスがないよう徹底するタイプだ。", category: 'Discipline', categoryJa: '誠実性' }),
  Q({ id: 26, text: "ルールや規則は、社会秩序のために厳格に守るべきだと思う。", category: 'Discipline', categoryJa: '誠実性' }),
  Q({ id: 27, text: "衝動買いをすることはほとんどなく、慎重にお金を使う。", category: 'Discipline', categoryJa: '誠実性' }),
  Q({ id: 28, text: "目標達成のためなら、目先の快楽を我慢できる。", category: 'Discipline', categoryJa: '誠実性' }),
  Q({ id: 29, text: "効率性を重視し、無駄な作業は極力省きたい。", category: 'Discipline', categoryJa: '誠実性' }),
  Q({ id: 30, text: "何事も準備不足だと不安を感じる。", category: 'Discipline', categoryJa: '誠実性' }),

  // Openness & Curiosity (開放性・知的好奇心)
  Q({ id: 31, text: "抽象的な概念や哲学的な議論をするのが好きだ。", category: 'Openness', categoryJa: '開放性' }),
  Q({ id: 32, text: "伝統や慣習よりも、新しい方法や革新的なアイデアに惹かれる。", category: 'Openness', categoryJa: '開放性' }),
  Q({ id: 33, text: "美術館に行ったり、芸術作品に触れたりするのが好きだ。", category: 'Openness', categoryJa: '開放性' }),
  Q({ id: 34, text: "予測可能な日常よりも、変化に富んだ刺激的な毎日を求めている。", category: 'Openness', categoryJa: '開放性' }),
  Q({ id: 35, text: "未知の分野や新しい趣味に挑戦することにワクワクする。", category: 'Openness', categoryJa: '開放性' }),
  Q({ id: 36, text: "物事を多角的な視点から見るのが得意だ。", category: 'Openness', categoryJa: '開放性' }),
  Q({ id: 37, text: "「なぜ？」と根本的な理由を考えることがよくある。", category: 'Openness', categoryJa: '開放性' }),
  Q({ id: 38, text: "SF映画やファンタジー小説など、現実離れした世界観が好きだ。", category: 'Openness', categoryJa: '開放性' }),
  Q({ id: 39, text: "自分の価値観が絶対だとは思わず、多様な考え方を受け入れられる。", category: 'Openness', categoryJa: '開放性' }),
  Q({ id: 40, text: "クリエイティブな活動（執筆、描画、制作など）に時間を費やすのが好きだ。", category: 'Openness', categoryJa: '開放性' }),

  // Emotional Logic / Stability (情緒安定性・メンタル)
  Q({ id: 41, text: "プレッシャーのかかる状況でも、冷静に対処できる。", category: 'Emotional', categoryJa: '情緒安定性' }),
  Q({ id: 42, text: "些細なことでイライラしたり、落ち込んだりすることは少ない。", category: 'Emotional', categoryJa: '情緒安定性' }),
  Q({ id: 43, text: "将来に対して不安を感じるより、楽観的に考えることが多い。", category: 'Emotional', categoryJa: '情緒安定性' }),
  Q({ id: 44, text: "失敗しても、すぐに気持ちを切り替えて次の行動に移せる。", category: 'Emotional', categoryJa: '情緒安定性' }),
  Q({ id: 45, text: "他人からの批判を個人的な攻撃として受け取らず、冷静に分析できる。", category: 'Emotional', categoryJa: '情緒安定性' }),
  Q({ id: 46, text: "感情の起伏が激しい方ではない。", category: 'Emotional', categoryJa: '情緒安定性' }),
  Q({ id: 47, text: "リラックスする時間を意識的に確保している。", category: 'Emotional', categoryJa: '情緒安定性' }),
  Q({ id: 48, text: "自分の弱みを見せることに抵抗がない。", category: 'Emotional', categoryJa: '情緒安定性' }),
  Q({ id: 49, text: "予期せぬトラブルが起きてもパニックにならずに対応できる。", category: 'Emotional', categoryJa: '情緒安定性' }),
  Q({ id: 50, text: "自分自身に対して自信を持っており、自己肯定感が高い。", category: 'Emotional', categoryJa: '情緒安定性' }),

  // -- 追加質問 --
  Q({ id: 51, text: "自分と異なる意見を持つ相手とも、深い信頼関係を築ける。", category: 'Openness', categoryJa: '開放性' }),
  Q({ id: 52, text: "ストレスが溜まったときは、誰かに話すより一人で静かに過ごしたい。", category: 'Social', categoryJa: '外向性', reverse: true }),
  Q({ id: 53, text: "人生において安定よりも刺激や挑戦を常に求めていたい。", category: 'Openness', categoryJa: '開放性' }),
  Q({ id: 54, text: "自分の志や目的のためなら、周囲の環境が変わることも厭わない。", category: 'Discipline', categoryJa: '誠実性' }),
  Q({ id: 55, text: "広く浅い人脈よりも、深く狭い信頼関係の方が価値がある。", category: 'Social', categoryJa: '外向性', reverse: true }),
  Q({ id: 56, text: "物事を判断する基準は、社会的な常識よりも自分の信念に基づいている。", category: 'Discipline', categoryJa: '誠実性', reverse: true }),
  Q({ id: 57, text: "何か問題が起きたとき、感情に寄り添うよりも先に解決策を提示してほしい。", category: 'Empathy', categoryJa: '協調性', reverse: true }),
  Q({ id: 58, text: "自分に自信がある方だ。", category: 'Emotional', categoryJa: '情緒安定性' }),
  Q({ id: 59, text: "どんなに親しい間柄でも、踏み込ませないパーソナルスペースが必要だ。", category: 'Social', categoryJa: '外向性', reverse: true }),
];

```

---

## `src\context\DiagnosticContext.tsx`

```tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type DiagnosticState = {
  answers: Record<number, number>;
  currentStep: number;
  setAnswer: (questionId: number, score: number) => void;
  setStep: (step: number) => void;
  resetDiagnostic: () => void;
  isComplete: boolean;
};

const DiagnosticContext = createContext<DiagnosticState | undefined>(undefined);

export const DiagnosticProvider = ({ children }: { children: ReactNode }) => {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    let savedAnswersObj = {};
    let savedStepNum = 0;

    const savedAnswers = localStorage.getItem('zax-diagnostic-answers');
    const savedStep = localStorage.getItem('zax-diagnostic-step');

    if (savedAnswers) {
      try {
        savedAnswersObj = JSON.parse(savedAnswers);
      } catch (e) {
        console.error("Failed to parse saved answers", e);
      }
    }
    if (savedStep) {
      savedStepNum = parseInt(savedStep, 10);
      if (isNaN(savedStepNum)) savedStepNum = 0;
    }

    setAnswers(savedAnswersObj);
    setCurrentStep(savedStepNum);
    setIsInitialized(true);
  }, []);

  // Save state to localStorage on change
  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('zax-diagnostic-answers', JSON.stringify(answers));
    localStorage.setItem('zax-diagnostic-step', currentStep.toString());
  }, [answers, currentStep, isInitialized]);

  const setAnswer = (questionId: number, score: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: score }));
  };

  const setStep = (step: number) => {
    setCurrentStep(step);
  };

  const resetDiagnostic = () => {
    setAnswers({});
    setCurrentStep(0);
    localStorage.removeItem('zax-diagnostic-answers');
    localStorage.removeItem('zax-diagnostic-step');
  };

  const isComplete = Object.keys(answers).length >= 50; // Assuming 50 questions

  return (
    <DiagnosticContext.Provider value={{ answers, currentStep, setAnswer, setStep, resetDiagnostic, isComplete }}>
      {children}
    </DiagnosticContext.Provider>
  );
};

export const useDiagnostic = () => {
  const context = useContext(DiagnosticContext);
  if (context === undefined) {
    throw new Error('useDiagnostic must be used within a DiagnosticProvider');
  }
  return context;
};

```

---

