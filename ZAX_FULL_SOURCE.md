# ZAX - Full Source Code Bundle
生成日時: 2026/2/28 17:14:27

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
30. `src\app\api\auth\guest-register\route.ts`
31. `src\app\api\diagnostic\generate-report\route.ts`
32. `src\components\AppNavigation.tsx`
33. `src\components\CorporateHeader.tsx`
34. `src\components\LandingPage.tsx`
35. `src\components\ImpactSimulationGraph.tsx`
36. `src\components\ImpactChart.tsx`
37. `src\components\EssenceInput.tsx`
38. `src\components\EvidenceAnalysis.tsx`
39. `src\components\BlindChat.tsx`
40. `src\components\VectorTransformationVisual.tsx`
41. `src\components\Footer.tsx`
42. `src\components\Providers.tsx`
43. `src\components\diagnostic\DiagnosticWizard.tsx`
44. `src\components\diagnostic\DiagnosticResultClient.tsx`
45. `src\components\diagnostic\ResultRadarChart.tsx`
46. `src\components\diagnostic\CompareRadarChart.tsx`
47. `src\components\chat\PostChatInterview.tsx`
48. `src\components\chat\ReflectionView.tsx`
49. `src\components\product\ThreeLayerModel.tsx`
50. `src\components\ui\card.tsx`
51. `src\components\ui\button.tsx`
52. `src\lib\gemini.ts`
53. `src\lib\gemini-log.ts`
54. `src\lib\db\client.ts`
55. `src\lib\crypto.ts`
56. `src\lib\utils.ts`
57. `src\lib\rec\engine.ts`
58. `src\lib\actions\manual-auth.ts`
59. `src\data\questions.ts`
60. `src\context\DiagnosticContext.tsx`

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
  nickname  String?  // 表示用名
  createdAt DateTime @default(now())
  
  // Relations
  vectors    EssenceVector[]
  feedbacks  Feedback[]
  diagnostics DiagnosticResult[]

  @@map("users")
}

model EssenceVector {
  id             String   @id @default(uuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // 6次元のエッセンスベクトル (検索・表示用)
  vector         Unsupported("vector(6)") 
  
  // 768次元のセマンティック埋め込み (深い分析・履歴検索用)
  embedding      Unsupported("vector(768)")? 
  
  // JSON文字列表現 (フロントエンド表示用バックアップ)
  vectorJson     String   

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
  user      User     @relation(fields: [userId], references: [id])
  answers   String   // JSON
  synthesis String   
  vector    String   // JSON
  createdAt DateTime @default(now())

  @@map("diagnostic_results")
}

model GeminiLog {
  id        String   @id @default(uuid())
  type      String   // "synthesis", "matching", "error" etc.
  prompt    String   @db.Text
  response  String   @db.Text
  metadata  String?  // JSON string
  createdAt DateTime @default(now())

  @@map("gemini_logs")
}

```

---

## `src\middleware.ts`

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Check for existing session
  const sessionCookie = request.cookies.get('zax-session')
  
  if (!sessionCookie) {
    // Create new session ID
    const newSessionId = uuidv4()
    
    // Set cookie
    response.cookies.set('zax-session', newSessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

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
  description: "表面的な属性ではなく、価値観と性格特性で繋がる、新しいマッチングプラットフォーム。",
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

import CorporateHeader from "@/components/CorporateHeader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="only light" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased bg-slate-50`}
        suppressHydrationWarning
      >
        <CorporateHeader />
        {children}
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

html {
  color-scheme: only light; /* ブラウザの強制カラー変更を拒否 */
  background-color: #ffffff; 
  filter: none !important;
}

body {
  font-family: var(--font-inter), "Noto Sans JP", "Helvetica Neue", Arial, sans-serif;
  overflow-x: hidden;
  letter-spacing: -0.02em;
  color-scheme: only light;
  background-color: #ffffff;
  color: #0f172a;
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
import { Globe, Building2, Sparkles, Lightbulb, BarChart3, Database } from "lucide-react";
import EvidenceAnalysis from "@/components/EvidenceAnalysis";
import ImpactChart from "@/components/ImpactChart";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-40 selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
            {/* 背景のアンビエント効果 */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-blue-100/50 rounded-full blur-[120px] mix-blend-multiply" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-purple-100/50 rounded-full blur-[100px] mix-blend-multiply" />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
            </div>

            {/* 縦スクロールレイアウト */}
            <div className="relative z-10 max-w-[1200px] mx-auto px-4 md:px-8 flex flex-col gap-8 md:gap-12" style={{ paddingTop: '160px' }}>

                {/* ───────────────────────────────────────────── */}
                {/* [A] HERO — タイトルセクション */}
                {/* ───────────────────────────────────────────── */}
                <motion.section 
                    className="w-full min-h-[60vh] flex flex-col items-center justify-center text-center"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="text-xs font-mono font-bold tracking-[0.3em] text-indigo-500 mb-8 uppercase">Vision</div>
                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-none tracking-tighter text-slate-900">
                        Restoring<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                            Human Resonance
                        </span>
                    </h1>
                </motion.section>

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
                            <div key={i} className="bg-slate-50 border border-slate-100 p-8 md:p-10 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-blue-50 hover:border-blue-200 transition-colors duration-300">
                                <item.icon className="w-8 h-8 text-blue-600 mb-4" />
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
                    className="w-full min-h-[50vh] bg-white border border-slate-100 rounded-[32px] p-12 md:p-16 relative overflow-hidden group shadow-lg shadow-slate-200/50 flex flex-col justify-center"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10 max-w-2xl">
                        <div className="text-8xl md:text-9xl font-black text-slate-100 mb-4">01</div>
                        <h3 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8">構造的な機会損失</h3>
                        <p className="text-slate-600 text-lg md:text-xl leading-relaxed">
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
                    className="w-full min-h-[50vh] bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-[32px] p-12 md:p-16 relative overflow-hidden flex flex-col justify-center shadow-xl"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.6 }}
                >
                    {/* 背景デコレーション */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-400/10 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/4" />
                    
                    <div className="relative z-10 max-w-2xl">
                        <div className="text-8xl md:text-9xl font-black text-white/10 mb-4">02</div>
                        <h3 className="text-4xl md:text-5xl font-bold text-white mb-8">潜在意識へのアクセス</h3>
                        <p className="text-white/80 text-lg md:text-xl leading-relaxed">
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
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6 text-blue-600">
                            <Database size={24} />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                            客観的事実としての<br className="md:hidden" />「幸福と経済」
                        </h2>
                        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                            World Happiness Report 2019のデータを用いた実証分析。
                            GDPと幸福度の相関(<span className="font-mono font-bold text-blue-600">R² &gt; 0.6</span>)をテコに、新しい経済循環を生み出します。
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
                                <span className="text-blue-400 mt-0.5">▸</span>
                                World Happiness Report 2019
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-blue-400 mt-0.5">▸</span>
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
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";
import Link from "next/link";
import ImpactChart from "@/components/ImpactChart";

export default function PhilosophyPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-40 overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
            {/* Ambient Background - Light & Organic */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-blue-100/50 rounded-full blur-[180px] mix-blend-multiply" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-purple-100/50 rounded-full blur-[150px] mix-blend-multiply" />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
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
                            <li><strong className="text-slate-900">・長期目線での最適化：</strong> 一過性の盛り上がりではなく、人生単位で互いを高め合える「共鳴」を演算します。</li>
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
                            <li><strong className="text-slate-900">・イノベーションの加速：</strong> 魂のレベルで共鳴する個体が繋がることで、これまでにない創造的な火花が散ります。</li>
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
            記録・最適化する、<span className="font-semibold text-slate-900">動的マッチングOS</span>です。
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
                  <td className="px-6 py-4 text-slate-500 hidden md:table-cell">マッチングの基礎となる基準点</td>
                </tr>
                <tr className="border-b border-slate-50">
                  <td className="px-6 py-4 font-semibold text-slate-900">Interaction Log</td>
                  <td className="px-6 py-4 text-slate-600">接続時間、反応率、対話の深度</td>
                  <td className="px-6 py-4 text-slate-500 hidden md:table-cell">共鳴の強さを測定する</td>
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
            ZAXの最大の特徴は、単なる「マッチング」で終わらず、その後の
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
            <h2 className="text-2xl font-bold">3. マッチング・ロジックのフロー</h2>
          </div>
          <p className="text-slate-600 mb-8 max-w-2xl">
            システムは以下のサイクルを自動で回し続け、コミュニティ全体の共鳴密度を高めます。
          </p>
          <div className="space-y-4">
            {[
              { num: "01", title: "高精度な推論（Reasoning）", desc: "入力された断片的なデータから、推論型AIを用いてユーザーの潜在的な「共鳴点」を特定します。" },
              { num: "02", title: "未来予測シミュレーション", desc: "候補者同士をマッチングさせた場合、互いにどのような変容をもたらすかを予測し、期待値の高い組み合わせを選出します。" },
              { num: "03", title: "レゾナンス・エンジンの実行", desc: "算出された共鳴係数に基づいて接続を提案します。" },
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
              R<sub>score</sub>：期間 t における共鳴と変容の累積値
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
                { title: "履歴ベースのベクトル解析", desc: "YouTubeの視聴履歴から「今の関心と価値観」をリアルタイム推定。自分でも気づかなかった自分を知る。" },
                { title: "AI自己理解壁打ち", desc: "RAGを用いて過去の自分と対話。悩み事に対し、過去の成功体験からAIが助言。" },
                { title: "ベクトル・マッチング", desc: "潜在的な「価値観の近さ」で学生同士を繋ぎ、本当に気の合う友達に出会える確率を向上。" },
                { title: "シミュレーション・グラフ", desc: "入学時から現在までの思考ベクトルの軌跡を可視化。大学生活での変化・成長が一目でわかる。" },
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
                    リアルタイムに更新される動的なプロフィールで共鳴する相手を見つけます。
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
                    より精度の高い共鳴相手が見つかるようになります。
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
                     あるペアの対話から得られた「共鳴パターン」は、
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
                <li><strong>ブラウザ履歴（Brave）</strong>: ユーザーが自ら実行した場合に限り、ローカルにインストールされたBraveブラウザのYouTube視聴履歴を読み取ります。</li>
                <li><strong>解析データ</strong>: 視聴履歴は一時的にAI（Gemini）によって解析され、性格特性ベクトルとして数値化されます。元の履歴リスト自体は永続保存されず、解析後のベクトルとサマリーのみが保存されます。</li>
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
import { redirect } from 'next/navigation';

export default function DiagnosticPage() {
  redirect('/history');
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
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PlayCircle, Loader2 } from 'lucide-react';

export default function HistoryPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/history/analyze', { method: 'POST' });
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Redirect to the same diagnostic result page structure
        const resultData = { id: data.id, synthesis: data.synthesis, answers: data.answers };
        sessionStorage.setItem(`diagnostic_result_${data.id}`, JSON.stringify(resultData));
        router.push(`/diagnostic/result/${data.id}`);
      } else {
        setError(data.error || '解析に失敗しました。Braveブラウザの履歴が存在するか確認してください。');
      }
    } catch (err) {
      console.error(err);
      setError('通信エラーが発生しました。時間を置いて再試行してください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            YOUR HISTORY
          </h1>
          <p className="text-slate-500 text-lg">
            あなたの Brave ブラウザの YouTube 視聴履歴から、<br className="hidden sm:block" />
            深層の興味関心と性格特性をAIが分析します。
          </p>
        </div>

        <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-xl border border-slate-200 space-y-8 relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">ブラウザ履歴解析の開始</h2>
            <p className="text-slate-600">
              ※ PC版 Brave ブラウザの閲覧履歴（SQLiteデータベース）を直接読み込みます。別のブラウザを開いている状態でも実行可能です。
            </p>
            
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100">
                {error}
              </div>
            )}

            <Button 
                onClick={handleAnalyze} 
                disabled={loading}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-8 py-6 rounded-2xl text-lg font-bold shadow-lg transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  あなたの履歴を解析中...
                </>
              ) : (
                <>
                  <PlayCircle className="w-6 h-6 mr-3" />
                  無料で履歴解析を開始
                </>
              )}
            </Button>
          </div>
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
          <Link href="/history" className="inline-block bg-white text-red-600 font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors border border-red-200">
            履歴解析を受ける
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
import { requireAuth } from '@/lib/auth-check';
import InputClient from './InputClient';

export default async function InputPage() {
  await requireAuth();

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

import EssenceInput, { EssenceInputData } from '@/components/EssenceInput';
import VectorTransformationVisual from '@/components/VectorTransformationVisual';
import { useRouter } from 'next/navigation';
export default function InputClient() {
  const router = useRouter();

  const handleComplete = async (data: EssenceInputData) => {
      console.log("Input Complete:", data);
      
      // TODO: Save analysis result when backend is ready
      
      // Redirect to Chat
      router.push('/chat');
  };

  return (
    <div className="w-full max-w-4xl space-y-8">
        <header className="text-center">
             <h1 className="text-3xl font-bold text-slate-900 mb-2">Resonance Input</h1>
             <p className="text-slate-500">Discover your core vector.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
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
import { questions } from '@/data/questions';
import { model, embeddingModel } from '@/lib/gemini'; // Import shared instances
import { cookies } from 'next/headers';

export const maxDuration = 60; // タイムアウトを60秒に延長

export async function POST(req: Request) {
  try {
    const { answers, freetext } = await req.json();

    if (!answers || Object.keys(answers).length === 0) {
      return NextResponse.json({ success: false, error: 'No answers provided' }, { status: 400 });
    }

    // 1. Authenticate User (or create guest session)
    const cookieStore = await cookies();
    let sessionId = cookieStore.get('zax-session')?.value;

    if (!sessionId) {
      sessionId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      cookieStore.set('zax-session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365,
      });
    }

    let userId = sessionId;
    let user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
        const email = `guest_${sessionId}@musashino-u.ac.jp`;
        user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
             try {
                user = await prisma.user.create({ data: { email, password: "guest-password" } });
             } catch (e) {
                 const firstUser = await prisma.user.findFirst();
                 if (firstUser) user = firstUser;
                 else throw new Error("Could not create or find user");
             }
        }
    }
    if (user) userId = user.id;

    // 2. Construct Analysis Prompt
    let profileText = "以下の性格診断（1-7尺度）の回答と自由記述に基づき、深い分析を行ってください。\n\n";
    
    if (freetext) {
        profileText += `## 本人の自由記述（悩み、理想、価値観）\n"${freetext}"\n\n`;
    }

    const sortedAnswerIds = Object.keys(answers).map(Number).sort((a,b) => a-b);
    const categoryScores: Record<string, {sum: number, count: number}> = {};
    
    for (const id of sortedAnswerIds) {
      const q = questions.find(q => q.id === id);
      const score = answers[id];
      if (q) {
        if (!categoryScores[q.categoryJa]) {
            categoryScores[q.categoryJa] = { sum: 0, count: 0 };
        }
        categoryScores[q.categoryJa].sum += score;
        categoryScores[q.categoryJa].count += 1;
      }
    }

    profileText += "## 診断スコア傾向\n";
    for (const [cat, data] of Object.entries(categoryScores)) {
        profileText += `- ${cat}: 平均 ${(data.sum / data.count).toFixed(1)}/7.0\n`;
    }

    profileText += "\n指示: この人物の強み、弱み、コミュニケーションスタイル、適した環境について、プロの心理分析官として詳細なレポートを作成してください。回答には自由記述の内容も深く反映させてください。出力に「AI」という語は含めないでください。";
    
    // 3. Call Gemini for Synthesis (Skip for guest to encourage registration)
    let synthesis = "登録後にAI詳細分析レポートが生成されます。";
    const isGuest = user?.email.startsWith("guest_");

    if (!isGuest) {
        try {
            const result = await model.generateContent(profileText);
            const response = await result.response;
            synthesis = response.text() || synthesis;
        } catch (e) {
            console.warn("Gemini API Error (Synthesis):", e);
            synthesis = "分析エラーが発生しました。時間を置いて再試行してください。";
        }
    }

    // 4. 6次元ベクトル (レーダーチャート用)
    const categoryOrder = ['Social', 'Empathy', 'Discipline', 'Openness', 'Emotional'] as const;
    const jaMap: Record<string, string> = { 'Social': '外向性', 'Empathy': '協調性', 'Discipline': '誠実性', 'Openness': '開放性', 'Emotional': '情緒安定性' };
    const rawByCat = categoryOrder.map(c => {
        const d = categoryScores[jaMap[c]];
        const avg = d && d.count > 0 ? d.sum / d.count : 4;
        return Math.round(((avg - 1) / 6) * 100);
    });
    const [social, empathy, discipline, openness, emotional] = rawByCat;
    const vector6d = [discipline, openness, empathy, discipline, openness, Math.round((emotional + social) / 2)];

    // 4.5. 768次元ベクトル (セマンティック検索用)
    let embedding768: number[] | undefined = undefined;
    try {
        const embedText = `Synthesis: ${synthesis}\nFreetext: ${freetext || "N/A"}`;
        const embeddingResult = await embeddingModel.embedContent(embedText);
        embedding768 = embeddingResult.embedding.values.slice(0, 768);
    } catch (e) {
        console.warn("Gemini API Error (Embedding):", e);
    }

    // 5. Save to Database
    const diagnosticResult = await prisma.diagnosticResult.create({
      data: {
        userId: userId,
        answers: JSON.stringify(answers),
        synthesis: synthesis,
        vector: JSON.stringify(vector6d),
      },
    });

    await vectorStore.saveEmbedding(
        userId,
        vector6d,
        "性格診断結果と自由記述に基づく分析",
        1.0,
        embedding768 // 768次元を追加
    );

    return NextResponse.json({ 
        success: true, 
        id: diagnosticResult.id,
        synthesis: synthesis,
        answers: answers,
    });

  } catch (error: any) {
    console.error('Diagnostic Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
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
      include: { user: true }
    });
    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const answers = JSON.parse(result.answers) as Record<string, number>;
    return NextResponse.json({
      id: result.id,
      userId: result.userId,
      isGuest: result.user.email.startsWith("guest_"),
      synthesis: result.synthesis,
      answers,
      vector: result.vector ? JSON.parse(result.vector) : null,
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
    const { vector, topN = 5, synthesis } = body;

    if (!vector || !Array.isArray(vector) || vector.length !== 6) {
      return NextResponse.json(
        { error: "Invalid vector: must be a 6-dim array" },
        { status: 400 }
      );
    }

    const matches = await findTopMatches(vector, topN, synthesis);

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
import { encrypt } from "@/lib/crypto";
import { cookies } from "next/headers";

export const runtime = "nodejs";

// Input Validation Schema
const AnalyzeRequestSchema = z.object({
    inputs: z.array(z.string().min(1, "Input cannot be empty")).min(1, "At least one input is required"),
    biases: z.array(z.string()).optional(),
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

        const { inputs, biases } = validation.data;

        // 2. AI Analysis
        const numericBiases = biases?.map((b) => Number(b));
        const result = await analyzeEssence(inputs, numericBiases);

        // [DB] Persist the analysis result
        const cookieStore = await cookies();

        const sessionId = cookieStore.get('zax-session')?.value;
        const userId = sessionId || "guest_" + new Date().getTime();
        
        // 3. Data Encryption (Encrypt sensitive reasoning before saving)
        const encryptedReasoning = encrypt(result.reasoning);

        // Save with encrypted reasoning
        await vectorStore.saveEmbedding(
            userId,
            result.vector,
            encryptedReasoning,
            result.resonance_score || 0,
            result.embedding
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
            const userId = "guest_demo_user"; // Fixed for MVP demo
            await prisma.feedback.create({
                data: {
                    content: feedback,
                    deltaVector: JSON.stringify(deltaResult.delta_vector),
                    growthScore: deltaResult.growth_score,
                    user: {
                        connectOrCreate: {
                            where: { id: userId },
                            create: { id: userId, email: "guest@example.com" }
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

export async function POST(request: Request) {
    try {
        const { interviewText } = await request.json();
        if (!interviewText || typeof interviewText !== "string") {
            return NextResponse.json({ error: "interviewText required" }, { status: 400 });
        }
        const summary = await generateReflectionSummary(interviewText);
        return NextResponse.json({ summary });
    } catch (error) {
        console.error("Reflection API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
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

## `src\app\api\auth\guest-register\route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('zax-session')?.value;

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'セッションが見つかりません' }, { status: 401 });
    }

    const { email, password, nickname } = await req.json();

    if (!email || !password || !nickname) {
      return NextResponse.json({ success: false, error: '必須項目が不足しています' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'パスワードは6文字以上で入力してください' }, { status: 400 });
    }

    // Domain check
    if (!email.endsWith('@stu.musashino-u.ac.jp') && !email.endsWith('@musashino-u.ac.jp')) {
      return NextResponse.json({ success: false, error: '武蔵野大学のメールアドレスのみ登録可能です' }, { status: 400 });
    }

    // Check if email already used by a REAL user
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && !existing.email.startsWith('guest_')) {
       return NextResponse.json({ success: false, error: 'このメールアドレスは既に登録されています' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the guest user record to a real user
    await prisma.user.update({
      where: { id: sessionId },
      data: {
        email,
        password: hashedPassword,
        nickname
      }
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Guest Register Error:', error);
    return NextResponse.json({ success: false, error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}

```

---

## `src\app\api\diagnostic\generate-report\route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { model } from '@/lib/gemini';
import { cookies } from 'next/headers';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('zax-session')?.value;

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { resultId } = await req.json();
    if (!resultId) {
      return NextResponse.json({ success: false, error: 'Result ID is required' }, { status: 400 });
    }

    const diagnosticResult = await prisma.diagnosticResult.findUnique({
      where: { id: resultId },
      include: { user: true }
    });

    if (!diagnosticResult) {
      return NextResponse.json({ success: false, error: 'Result not found' }, { status: 404 });
    }

    // Security check: Make sure user is not a guest anymore
    if (diagnosticResult.user.email.startsWith('guest_')) {
      return NextResponse.json({ success: false, error: 'Registration required to generate full report' }, { status: 403 });
    }

    const vector6d = JSON.parse(diagnosticResult.vector);

    const prompt = `
あなたはプロの深層心理アナリストです。
対象者の性格特性が以下の6次元の数値（0-100）で算出されました。

論理性: ${vector6d[0]}
直感力: ${vector6d[1]}
共感性: ${vector6d[2]}
意志力: ${vector6d[3]}
創造性: ${vector6d[4]}
柔軟性: ${vector6d[5]}

【指示】
この数値データを元に、対象者の深層心理、行動特性、コミュニケーションの傾向、潜在的な強みと課題、そして未来に向けたアドバイスを網羅した、非常に詳細なレポートを作成してください。
*   文字数は **約3000文字** 程度になるように、深堀りして記述してください。
*   出力はプレーンテキストで行い、段落分けを活用してください。
*   **絶対条件**: アスタリスク（*）やハッシュタグ（#）などのMarkdown記号は **一切使用しないでください**。
*   「AI」という単語は含めず、一人の人間（専門家）として語りかけるような、丁寧で温かみのあるトーン（日本語）で記述してください。
*   法的に問題になるような表現、極端な断定、医療的な診断などは避け、前向きな成長を促す内容にしてください。
`;

    const result = await model.generateContent(prompt);
    let fullReport = await result.response.text();
    fullReport = fullReport.replace(/[*#]/g, '').trim(); // Fallback sanitation

    // Update the DB with the long synthesis
    await prisma.diagnosticResult.update({
      where: { id: resultId },
      data: { synthesis: fullReport }
    });

    return NextResponse.json({ success: true, synthesis: fullReport });

  } catch (error: any) {
    console.error('Report Generation Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
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

const navLinks = [
  { label: "ABOUT US", href: "/about" },
  { label: "VISION", href: "/philosophy" },
  { label: "PRODUCT", href: "/technology" },
  { label: "YOUR HISTORY", href: "/history" },
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
              </div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + navLinks.length * 0.06, duration: 0.3 }}
                className="mt-12"
              >
                <Link
                  href="/history"
                  onClick={() => setIsMenuOpen(false)}
                  className="inline-flex items-center justify-center px-8 py-4 bg-slate-900 text-white text-base font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-sm hover:shadow-md"
                >
                  無料で履歴解析を開始
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
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="w-full bg-slate-50 text-slate-900 font-sans">
      {/* ─── HERO ─── */}
      <section className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[700px] h-[700px] bg-blue-100/40 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-5%] left-[-5%] w-[500px] h-[500px] bg-violet-100/30 rounded-full blur-[100px]" />
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
            あなたのブラウザの履歴から、価値観とつながり方を可視化します。
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Link
              href="/history"
              className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-all shadow-sm hover:shadow-md"
            >
              無料で履歴解析を開始
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
    </main>
  );
}

```

---

## `src\components\ImpactSimulationGraph.tsx`

```tsx
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function ImpactSimulationGraph() {
    // Simulated prediction data
    const points = [
        { year: 2024, baseline: 100, optimized: 100 },
        { year: 2025, baseline: 101.5, optimized: 102.8 },
        { year: 2026, baseline: 102.8, optimized: 106.5 },
        { year: 2027, baseline: 104.1, optimized: 112.4 },
        { year: 2028, baseline: 105.3, optimized: 119.8 },
        { year: 2029, baseline: 106.4, optimized: 128.5 },
        { year: 2030, baseline: 107.5, optimized: 139.2 },
    ];

    const width = 600;
    const height = 300;
    const padding = 40;

    // Scale helpers
    const getX = (index: number) => padding + (index / (points.length - 1)) * (width - 2 * padding);
    const getY = (value: number) => height - padding - ((value - 90) / (150 - 90)) * (height - 2 * padding); // Scale 90-150 range

    const baselinePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(p.baseline)}`).join(" ");
    const optimizedPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(p.optimized)}`).join(" ");

    return (
        <div className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm relative overflow-hidden group">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-zax-accent animate-pulse" />
                        Economic Ripple Prediction
                    </h3>
                    <p className="text-xs text-zax-muted font-mono mt-1">
                        Model: LightGBM v4.2 (Verified) / Horizon: 2030
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-zax-accent">+29.4%</div>
                    <div className="text-[10px] text-zax-muted uppercase tracking-wider">Projected GDP Impact</div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Graph Area */}
                <div className="flex-1 relative">
                    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
                        {/* Grid Lines */}
                        {[0, 1, 2, 3, 4].map(i => (
                            <line
                                key={i}
                                x1={padding}
                                y1={padding + (i * (height - 2 * padding)) / 4}
                                x2={width - padding}
                                y2={padding + (i * (height - 2 * padding)) / 4}
                                stroke="rgba(255,255,255,0.05)"
                                strokeWidth="1"
                            />
                        ))}

                        {/* Baseline Line */}
                        <motion.path
                            d={baselinePath}
                            fill="none"
                            stroke="#444"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                            initial={{ pathLength: 0 }}
                            whileInView={{ pathLength: 1 }}
                            transition={{ duration: 2, ease: "easeInOut" }}
                        />

                        {/* Optimized Line (ZAX) */}
                        <motion.path
                            d={optimizedPath}
                            fill="none"
                            stroke="#00F0FF"
                            strokeWidth="3"
                            initial={{ pathLength: 0 }}
                            whileInView={{ pathLength: 1 }}
                            transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
                            style={{ filter: "drop-shadow(0 0 8px rgba(0, 240, 255, 0.5))" }}
                        />

                        {/* Area under optimized (Gradient) */}
                        <defs>
                            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="rgba(0, 240, 255, 0.2)" />
                                <stop offset="100%" stopColor="rgba(0, 240, 255, 0)" />
                            </linearGradient>
                        </defs>
                        <motion.path
                            d={`${optimizedPath} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`}
                            fill="url(#areaGradient)"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 1.5 }}
                        />

                        {/* Points & Labels */}
                        {points.map((p, i) => (
                            <g key={i}>
                                {/* X Axis Labels */}
                                <text x={getX(i)} y={height - 10} textAnchor="middle" fill="#666" fontSize="10" fontFamily="monospace">
                                    {p.year}
                                </text>
                                {/* Dots on Optimized */}
                                <motion.circle
                                    cx={getX(i)}
                                    cy={getY(p.optimized)}
                                    r="3"
                                    fill="#00F0FF"
                                    initial={{ scale: 0 }}
                                    whileInView={{ scale: 1 }}
                                    transition={{ delay: 0.5 + (i * 0.1) }}
                                />
                            </g>
                        ))}
                    </svg>

                    {/* Legend */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-0.5 bg-zax-accent" />
                            <span className="text-[10px] text-white">ZAX Scenerio</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-0.5 bg-gray-600 border-t border-dashed border-gray-400" />
                            <span className="text-[10px] text-gray-500">Baseline</span>
                        </div>
                    </div>
                </div>

                {/* Feature Importance Sidebar */}
                <div className="w-full md:w-48 flex flex-col justify-center space-y-4 border-l border-white/10 md:pl-6">
                    <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">
                        Feature Importance
                    </div>
                    {[
                        { label: "Mental Health", value: 0.92, color: "bg-zax-accent" },
                        { label: "Labor Mobility", value: 0.78, color: "bg-purple-500" },
                        { label: "Creativity", value: 0.65, color: "bg-blue-500" },
                        { label: "Consumption", value: 0.45, color: "bg-gray-500" },
                    ].map((feature, i) => (
                        <div key={i} className="group/bar">
                            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                                <span>{feature.label}</span>
                                <span className="font-mono">{feature.value}</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${feature.value * 100}%` }}
                                    transition={{ duration: 1, delay: 0.5 + (i * 0.2) }}
                                    className={`h-full ${feature.color} shadow-[0_0_10px_currentColor] opacity-80 group-hover/bar:opacity-100 transition-opacity`}
                                />
                            </div>
                        </div>
                    ))}

                    <div className="mt-4 pt-4 border-t border-white/5">
                        <div className="text-[9px] text-zax-muted leading-relaxed">
                            *Parameters optimized via Gradient Boosting Decision Tree (GBDT). showing high correlation between well-being & productivity.
                        </div>
                    </div>
                </div>
            </div>
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
        { id: "romance", label: "ROMANCE", title: "魂の共鳴", desc: "魂が共鳴する深いパートナーシップを築く", emoji: "💫", color: "#EC4899" },
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
            <div className="border-l-4 border-l-cyan-400 bg-slate-900/50 p-6 border-y border-r border-slate-800 backdrop-blur-md">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight uppercase mb-2">Evidence Analysis</h2>
                        <p className="text-sm text-slate-400 max-w-2xl">
                            Why GDP alone fails to predict happiness (R²=0.64) vs. How ZAX fills the void (R²=0.94).
                        </p>
                    </div>
                    <div className="text-right hidden md:block">
                        <div className="text-xs font-mono text-cyan-400 mb-1">DATA_SOURCE</div>
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

```tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Send, Zap, Coffee } from "lucide-react";

interface BlindChatProps {
    partnerName?: string;
    onEndChat: () => void;
}

export default function BlindChat({ partnerName, onEndChat }: BlindChatProps) {
    const [messages, setMessages] = useState<{ id: number; text: string; sender: "me" | "them" }[]>([
        { id: 1, text: "はじめまして。", sender: "them" },
    ]);
    const [inputText, setInputText] = useState("");
    const [resonance, setResonance] = useState(50);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Simulate resonance fluctuation
    useEffect(() => {
        const interval = setInterval(() => {
            setResonance(prev => Math.min(100, Math.max(0, prev + (Math.random() - 0.4) * 5)));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleSend = () => {
        if (!inputText.trim()) return;

        const newMsg = { id: Date.now(), text: inputText, sender: "me" as const };
        setMessages(prev => [...prev, newMsg]);
        setInputText("");

        // Simulate reply with random responses to feel "alive"
        setTimeout(() => {
            const responses = [
                "なるほど、その視点は面白いですね。",
                "確かに。でも、逆にこういう見方もできませんか？",
                "すごく共感します。僕も同じことを考えていました。",
                "それは深いですね...もう少し詳しく教えてもらえますか？",
                "ふむ、あなたの価値観が少し見えてきた気がします。",
                "意外です。そういう一面もお持ちなんですね。",
                "そう言われると、確かにそうかもしれません。",
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: randomResponse,
                sender: "them"
            }]);
            setResonance(prev => Math.min(100, prev + 15)); // Boost resonance on reply
        }, 1500);
    };

    return (
        <div className="w-full h-[80vh] flex flex-col bg-white/70 backdrop-blur-xl rounded-[32px] overflow-hidden border border-white/40 relative shadow-xl shadow-slate-200/50">
            {/* Header with Resonance Metter */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/50 backdrop-blur-md z-20">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-50 flex items-center justify-center relative">
                        <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                        <div className="absolute inset-0 rounded-full border border-blue-200 opacity-50" />
                    </div>
                    <div>
                        <div className="text-[10px] text-slate-400 tracking-widest uppercase mb-0.5 font-bold">相手</div>
                        <div className="text-base font-bold text-slate-800 tracking-tight">{partnerName || '共鳴する相手'}</div>
                    </div>
                </div>
                
                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 text-blue-600 text-xs font-mono mb-1 tracking-wider font-bold">
                            <Zap size={12} fill="currentColor" />
                            共鳴度: {Math.round(resonance)}%
                        </div>
                        <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                animate={{ width: `${resonance}%` }}
                            />
                        </div>
                    </div>
                    
                    <button
                        onClick={onEndChat}
                        className="text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors border-l border-slate-200 pl-6 py-1 font-bold"
                    >
                        終了
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide bg-slate-50/50" ref={scrollRef}>
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
                    >
                        <div className={`max-w-[80%] p-5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.sender === "me"
                                ? "bg-white border border-blue-100 text-slate-700 rounded-br-none shadow-blue-100/50"
                                : "bg-white border border-slate-100 text-slate-600 rounded-bl-none"
                            }`}>
                            {msg.text}
                        </div>
                    </motion.div>
                ))}

                {resonance > 80 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center gap-3 my-4"
                    >
                        <span className="px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-bold tracking-wider shadow-sm">
                            共鳴度高
                        </span>
                        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-full transition-colors">
                            <Coffee className="w-4 h-4" />
                            会う約束をする
                        </button>
                    </motion.div>
                )}
            </div>

            {/* Floating Input Area (The "Floor") */}
            <div className="p-8 bg-gradient-to-t from-white via-white/80 to-transparent z-20">
                <div className="relative flex items-center gap-3 bg-white border border-slate-200 rounded-full px-2 py-2 shadow-2xl shadow-slate-200/50 ring-4 ring-slate-50 group focus-within:ring-blue-50 transition-all">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="メッセージを入力..."
                        className="flex-1 bg-transparent border-none px-6 text-slate-800 placeholder-slate-400 focus:outline-none text-sm font-medium tracking-wide"
                    />
                    <motion.button
                        whileHover={{ scale: 1.05, backgroundColor: "rgba(37, 99, 235, 1)" }} // Blue-600
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSend}
                        className="p-3 bg-slate-900 rounded-full text-white shadow-lg shadow-slate-200 transition-all"
                    >
                        <Send size={18} />
                    </motion.button>
                </div>
            </div>
        </div>
    );
}

```

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

_ファイルが見つかりませんでした: ENOENT: no such file or directory, open 'c:\ZAX\src\components\diagnostic\DiagnosticWizard.tsx'_

---

## `src\components\diagnostic\DiagnosticResultClient.tsx`

```tsx
"use client";

import { useEffect, useState } from "react";
import { questions } from "@/data/questions";
import { DIMENSION_LABELS } from "@/lib/rec/engine";
import ResultRadarChart from "./ResultRadarChart";
import MatchResults from "./MatchResults";
import Link from "next/link";
import { ArrowRight, Sparkles, Loader2, BookOpen, ExternalLink } from "lucide-react";

interface ResultData {
  id: string;
  isGuest: boolean;
  synthesis: string;
  answers: Record<string, number>;
  vector?: number[] | string;
}

interface DiagnosticResultClientProps {
  resultId: string;
}

export default function DiagnosticResultClient({ resultId }: DiagnosticResultClientProps) {
  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Registration State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // Report Generation State
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const key = `diagnostic_result_${resultId}`;
    const cached = sessionStorage.getItem(key);
    // When updating from guest to real, we might need fresh data from server, 
    // so we always fetch to be safe if not generating right now.
    fetch(`/api/diagnostic/result/${resultId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Not found"))))
      .then((json) => setData(json))
      .catch(() => {
          if (cached) {
            setData(JSON.parse(cached));
          } else {
            setError("結果の取得に失敗しました。もう一度診断をお試しください。");
          }
      })
      .finally(() => setLoading(false));
  }, [resultId]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setIsRegistering(true);

    try {
      // 1. Convert guest to real user
      const regRes = await fetch("/api/auth/guest-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, nickname }),
      });
      const regData = await regRes.json();

      if (!regData.success) {
        setRegError(regData.error || "登録に失敗しました。");
        setIsRegistering(false);
        return;
      }

      // 2. Registration Success, immediately start generating long report
      setIsRegistering(false);
      setIsGenerating(true);

      const genRes = await fetch("/api/diagnostic/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resultId: data?.id }),
      });
      const genData = await genRes.json();

      if (genData.success && data) {
         // Update UI
         setData({
             ...data,
             isGuest: false,
             synthesis: genData.synthesis
         });
         // Update cache
         sessionStorage.setItem(`diagnostic_result_${data.id}`, JSON.stringify({
            ...data,
            isGuest: false,
            synthesis: genData.synthesis
         }));
      } else {
         setRegError("レポートの生成に失敗しました。ページをリロードしてください。");
      }
    } catch (err) {
      setRegError("通信エラーが発生しました。");
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading && !isGenerating) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-semibold">結果を読み込み中...</p>
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
            href="/history"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800"
          >
            履歴から再解析する
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Determine vector
  let userVector6d: number[] = [50, 50, 50, 50, 50, 50];
  if (data.vector && Array.isArray(data.vector)) {
    userVector6d = data.vector;
  } else if (data.vector && typeof data.vector === 'string') {
    try {
        userVector6d = JSON.parse(data.vector);
    } catch {
        console.warn("Failed to parse vector string");
    }
  }

  const chartData = DIMENSION_LABELS.map((label, i) => ({
    subject: label,
    A: userVector6d[i] ?? 50,
    fullMark: 100,
  }));

  const synthesisParagraphs = (data.synthesis || "")
    .split("\n")
    .filter((p: string) => p.trim() !== "");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <div className="h-16" />

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-16">
        <section className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            分析結果
          </h1>
        </section>

        {/* 1. Radar Chart Section */}
        <section className="bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-xl shadow-slate-200/30 border border-slate-200/60">
          <h2 className="text-2xl font-bold mb-8 text-center">特性レーダーチャート</h2>
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

        {/* 2. Registration Wall for Guests */}
        {data.isGuest && !isGenerating && (
          <section className="bg-slate-900 text-white rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden border border-slate-800">
             <div className="max-w-md mx-auto relative z-10 text-center space-y-6">
                <div className="inline-block p-4 rounded-full bg-slate-800 mb-2">
                  <BookOpen className="w-12 h-12 text-indigo-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">深層心理レポート</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  ここから先は、あなたの価値観と行動特性を深く掘り下げる約3,000文字の「深層パーソナリティレポート」をご用意しています。閲覧および保存には無料のアカウント登録が必要です。
                </p>

                <form onSubmit={handleRegister} className="mt-8 space-y-4 text-left">
                  <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 space-y-4">
                     {regError && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-xs p-3 rounded-lg font-bold">
                           {regError}
                        </div>
                     )}
                     <div>
                       <label className="block text-xs font-bold text-slate-400 mb-1">ニックネーム (学内表示用)</label>
                       <input 
                          type="text" 
                          required
                          value={nickname}
                          onChange={e => setNickname(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                          placeholder="ZAX 太郎"
                       />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-slate-400 mb-1">大学メールアドレス</label>
                       <input 
                          type="email" 
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                          placeholder="name@musashino-u.ac.jp"
                       />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-slate-400 mb-1">パスワード</label>
                       <input 
                          type="password" 
                          required
                          minLength={6}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                          placeholder="6文字以上"
                       />
                     </div>
                     <button 
                        type="submit" 
                        disabled={isRegistering}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-colors disabled:opacity-50 mt-4"
                     >
                        {isRegistering ? (
                          <><Loader2 className="w-5 h-5 animate-spin" />登録処理中...</>
                        ) : (
                          <>無料で登録してレポートを見る<ArrowRight className="w-5 h-5" /></>
                        )}
                     </button>
                  </div>
                </form>
             </div>
             {/* Decor */}
             <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/20 blur-3xl rounded-full pointer-events-none" />
          </section>
        )}

        {/* 3. Generating Report State */}
        {isGenerating && (
          <section className="bg-slate-900 text-white rounded-2xl p-12 md:p-20 shadow-2xl text-center space-y-8 border border-slate-800">
             <div className="inline-block p-6 rounded-full bg-indigo-900/30 border border-indigo-500/20 mb-4 relative">
                <Loader2 className="w-16 h-16 text-indigo-400 animate-spin absolute inset-0 m-auto" />
                <Sparkles className="w-8 h-8 text-indigo-300 opacity-50 absolute -top-2 -right-2 animate-pulse" />
             </div>
             <h3 className="text-2xl font-bold text-white">深層心理レポートを生成中...</h3>
             <div className="max-w-md mx-auto text-slate-400 text-sm space-y-2 font-medium">
               <p>あなたの履歴ベクトルデータから、約3,000文字に及ぶ詳細な専門的心理分析レポートを執筆しています。</p>
               <p className="opacity-70 text-xs">※データの複雑さにより数十秒かかる場合があります。この画面のままお待ちください。</p>
             </div>
          </section>
        )}

        {/* 4. Full Report Display (For Logged In / Newly Registered Users) */}
        {!data.isGuest && !isGenerating && (
          <section className="bg-white text-slate-900 rounded-2xl p-8 md:p-12 shadow-xl border border-slate-200">
            <h2 className="text-3xl font-black mb-8 flex items-center gap-3 text-slate-900 border-b border-slate-100 pb-4">
              <BookOpen className="w-8 h-8 text-indigo-600" />
              深層パーソナリティレポート
            </h2>
            
            <div className="space-y-6 text-base md:text-lg leading-loose text-slate-700 font-medium">
              {synthesisParagraphs.map((para: string, i: number) => (
                <p key={i} className="text-left">{para}</p>
              ))}
            </div>

            {/* ZAXcampus CTA - At the bottom of the long report */}
            <div className="mt-16 pt-12 border-t border-slate-100 text-center space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-2xl shadow-lg mb-4 transform rotate-3 hover:rotate-6 transition-transform">
                   <span className="font-black text-2xl">Z</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900">さらなる出会いと挑戦へ</h3>
                <p className="text-slate-500 max-w-lg mx-auto font-medium">
                  ZAXcampusに登録して、学内の新しいプロジェクトや価値観の合う仲間を探しに行きましょう。
                </p>
                <a 
                   href="https://zax-campus.com" // Placeholder external link
                   target="_blank"
                   rel="noopener noreferrer"
                   className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl font-bold text-lg hover:from-black hover:to-black transition-all shadow-xl hover:-translate-y-1 mx-auto"
                >
                   ZAXcampusを始める
                   <ExternalLink className="w-5 h-5 text-indigo-300" />
                </a>
            </div>
          </section>
        )}

        {/* 5. Match Results Section (Optional, keeping it below if they want to chat in the current app, but users flow ends at ZAXcampus) */}
        {!data.isGuest && !isGenerating && (
           <MatchResults userVector={userVector6d} synthesis={data.synthesis} isGuest={data.isGuest} />
        )}

        <section className="text-center pt-8">
          <Link
            href="/history"
            className="text-slate-400 text-sm font-bold hover:text-indigo-500 transition-colors uppercase tracking-widest"
          >
            やり直す
          </Link>
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
          <PolarGrid stroke="#f1f5f9" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#0f172a', fontSize: 12, fontWeight: 800 }}
          />
          <PolarRadiusAxis angle={30} domain={[0, data[0]?.fullMark ?? 100]} tick={false} axisLine={false} />
          <Radar
            name="Personality"
            dataKey="A"
            stroke="#6366f1"
            fill="#818cf8"
            fillOpacity={0.7}
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
          <PolarGrid stroke="#f1f5f9" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#0f172a", fontSize: 10, fontWeight: 800 }}
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="あなた"
            dataKey="me"
            stroke="#000000"
            fill="#000000"
            fillOpacity={0.3}
            strokeWidth={3}
          />
          <Radar
            name="相手"
            dataKey="partner"
            stroke="#94a3b8"
            fill="#94a3b8"
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, fontWeight: 800, color: "#0f172a" }}
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
import { motion } from "framer-motion";
import { Send } from "lucide-react";

interface PostChatInterviewProps {
  partnerName: string;
  onSubmit: (answers: {
    aboutPartner: string;
    howChanged: string;
    grew: string;
    togetherFeel: string;
  }) => void;
  onSkip: () => void;
}

export default function PostChatInterview({
  partnerName,
  onSubmit,
  onSkip,
}: PostChatInterviewProps) {
  const [aboutPartner, setAboutPartner] = useState("");
  const [howChanged, setHowChanged] = useState("");
  const [grew, setGrew] = useState("");
  const [togetherFeel, setTogetherFeel] = useState("");

  const handleSubmit = () => {
    onSubmit({ aboutPartner, howChanged, grew, togetherFeel });
  };

  const filled =
    aboutPartner.trim() ||
    howChanged.trim() ||
    grew.trim() ||
    togetherFeel.trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/60 p-6"
    >
      <h3 className="text-lg font-bold text-slate-900 mb-1">
        {partnerName}さんとの振り返り
      </h3>
      <p className="text-xs text-slate-500 mb-6">短くでOKです</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            相手はどうでしたか？
          </label>
          <input
            type="text"
            value={aboutPartner}
            onChange={(e) => setAboutPartner(e.target.value)}
            placeholder="例: 話しやすかった"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            自分はどう変わった？
          </label>
          <input
            type="text"
            value={howChanged}
            onChange={(e) => setHowChanged(e.target.value)}
            placeholder="例: 新しい視点が得られた"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            成長を実感できた？
          </label>
          <input
            type="text"
            value={grew}
            onChange={(e) => setGrew(e.target.value)}
            placeholder="例: 少し"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            一緒にいてどうだった？
          </label>
          <input
            type="text"
            value={togetherFeel}
            onChange={(e) => setTogetherFeel(e.target.value)}
            placeholder="例: 居心地が良かった"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={onSkip}
          className="flex-1 py-2.5 text-sm text-slate-500 hover:text-slate-700 font-medium"
        >
          スキップ
        </button>
        <button
          onClick={handleSubmit}
          disabled={!filled}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Send className="w-4 h-4" />
          送信
        </button>
      </div>
    </motion.div>
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

interface ReflectionViewProps {
    answers: { aboutPartner: string; howChanged: string; grew: string; togetherFeel: string };
    summary: string;
    partnerName: string;
}

export default function ReflectionView({ answers, summary, partnerName }: ReflectionViewProps) {
    const items = [
        { q: "相手はどうでしたか？", a: answers.aboutPartner || "—" },
        { q: "自分はどう変わった？", a: answers.howChanged || "—" },
        { q: "成長を実感できた？", a: answers.grew || "—" },
        { q: "一緒にいてどうだった？", a: answers.togetherFeel || "—" },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/60 p-6"
        >
            <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <h3 className="text-lg font-bold text-slate-900">あなたの変化</h3>
            </div>

            <div className="p-4 bg-indigo-50 rounded-xl mb-6">
                <p className="text-sm text-indigo-900 font-medium leading-relaxed">{summary}</p>
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

            <Link
                href="/"
                className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors"
            >
                <Home className="w-4 h-4" />
                ホームへ
            </Link>
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
          className="absolute inset-0 bg-emerald-500/20 border border-emerald-400/50 rounded-lg backdrop-blur-sm"
          animate={{ 
            boxShadow: ["0 0 10px rgba(16, 185, 129, 0.2)", "0 0 20px rgba(16, 185, 129, 0.6)", "0 0 10px rgba(16, 185, 129, 0.2)"],
            borderColor: ["rgba(52, 211, 153, 0.5)", "rgba(52, 211, 153, 1)", "rgba(52, 211, 153, 0.5)"]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-emerald-300 font-bold font-mono tracking-widest text-sm">LAYER 3: Δ</span>
        </div>
        {/* Floating Particles */}
        {[...Array(5)].map((_, i) => (
            <motion.div
                key={i}
                className="absolute w-1 h-1 bg-emerald-400 rounded-full"
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
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-indigo-600/10 border-x border-t border-blue-500/30 rounded-t-xl" />
        <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-blue-200/70 font-bold font-mono tracking-widest text-sm">LAYER 2: MERGE</span>
        </div>
        {/* Connecting Lines */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-blue-500/20" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-blue-500/20" />
      </div>

      {/* Layer 1: Core (Solid) */}
      <div className="relative w-64 h-32 z-10 glass-panel border border-indigo-500/30 bg-slate-900/80 rounded-xl shadow-2xl flex items-center justify-center">
        <div className="absolute inset-0 bg-indigo-900/20 rounded-xl" />
        <div className="text-center">
            <div className="text-indigo-400 font-black text-xl tracking-widest mb-1">CORE</div>
            <div className="text-[10px] text-indigo-300/50 font-mono">IMMUTABLE LOGIC</div>
        </div>
        {/* Grid Pattern */}
        <div 
            className="absolute inset-0 opacity-10" 
            style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '10px 10px' }} 
        />
      </div>

      {/* Central Axis */}
      <div className="absolute top-10 bottom-10 w-px bg-gradient-to-b from-emerald-500/0 via-indigo-500/50 to-indigo-500/0 z-0" />

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

const API_KEY = process.env.GOOGLE_API_KEY || "";

export const genAI = new GoogleGenerativeAI(API_KEY);
export const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
export const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

export interface AnalysisResult {
    vector: number[]; // 6-dim radar chart stats (0-100) -> V_display
    embedding?: number[]; // 768-dim raw embedding -> V_essence (Hidden)
    reasoning: string;
    resonance_score: number;
}

export async function analyzeEssence(inputs: string[], biases: number[] = [50, 50, 50], purpose: string = "general"): Promise<AnalysisResult> {
    if (!API_KEY) {
        console.warn("GOOGLE_API_KEY not found. Using mock data.");
        return {
            vector: [80, 60, 90, 45, 70, 85],
            reasoning: "APIキーが設定されていないため、擬似データを表示しています。あなたの入力は非常に詩的で、論理性よりも直感を重視する傾向が見られます。",
            resonance_score: 88,
        };
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

        return {
            ...parsed,
            embedding: embeddingResult.embedding.values.slice(0, 768) // Attach 768-Dim Vector for DB
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

/** RAG風: ユーザー分析＋相手プロフィールから相性の理由を生成 */
export async function generateMatchReasoning(
    userSynthesis: string,
    partnerName: string,
    partnerBio: string,
    partnerTags: string[],
    similarityPercent: number,
    growthScore: number
): Promise<string> {
    if (!API_KEY) return `${partnerName}さんは${partnerBio} 共鳴度${similarityPercent}%、成長ポテンシャル${growthScore}%です。`;
    const prompt = `
あなたはマッチングアドバイザーです。以下の情報をもとに、なぜこの2人が相性が良いか、50文字以内の日本語で簡潔に説明してください。

【ユーザーの性格分析】
${userSynthesis.slice(0, 500)}

【相性の良い相手】
名前: ${partnerName}
プロフィール: ${partnerBio}
タグ: ${partnerTags.join(", ")}

【数値】
共鳴度: ${similarityPercent}%
成長ポテンシャル: ${growthScore}%

50文字以内で、具体的で温かい推薦理由を1文で出力してください。JSONは不要、テキストのみ。
`;
    try {
        const result = await model.generateContent(prompt);
        return (await result.response).text().trim().slice(0, 120) || `${partnerName}さんとの相性が良いです。`;
    } catch (e) {
        console.warn("Gemini match reasoning error:", e);
        return `${partnerName}さんは${partnerBio} 共鳴度${similarityPercent}%。`;
    }
}

export interface DeltaResult {
    delta_vector: number[];
    new_vector: number[];
    growth_score: number;
}

export async function calculateDeltaVector(feedback: string, currentVector: number[] = [50, 50, 50, 50, 50, 50], tags: string[] = []): Promise<DeltaResult> {
    if (!API_KEY) {
        return {
            delta_vector: [5, -2, 10, 0, 5, 5],
            new_vector: currentVector.map((v, i) => Math.min(100, Math.max(0, v + (i % 2 === 0 ? 5 : -2)))),
            growth_score: 15
        };
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
        return (await result.response).text().trim().slice(0, 80) || "あなたの振り返りが記録されました。";
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
    // 実行時に存在確認を行い、ビルドエラーを回避
    const p = prisma as any;
    if (!p?.geminiLog) return;
    
    await p.geminiLog.create({
      data: {
        type,
        prompt: prompt.slice(0, 50000),
        response: response.slice(0, 50000),
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (error) {
    // ログ保存の失敗はメイン処理に影響させない
    console.warn("Gemini logging failed:", error);
  }
}

```

---

## `src\lib\db\client.ts`

```typescript
// ZAX Database Client — Prisma + pgvector
// Docker (ankane/pgvector) 起動中は実DB接続、未起動時はモックにフォールバック

let prisma: any;
let vectorStore: any;

// DATABASE_URL が無い場合はモックのみ使用（Vercel等で未設定時）
const useRealDb = !!(
    process.env.DATABASE_URL &&
    !process.env.DATABASE_URL.includes("localhost:5432/dummy")
);

if (!useRealDb) {
    if (!process.env.DATABASE_URL) {
        process.env.DATABASE_URL = "postgresql://localhost:5432/dummy";
    }
}

try {
    if (!useRealDb) throw new Error("Using mock DB");
    const { PrismaClient } = require("@prisma/client");
    const globalForPrisma = global as unknown as { prisma: any };
    prisma = globalForPrisma.prisma || new PrismaClient({ log: ["warn", "error"] });
    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

    // Real Vector Store (pgvector)
    vectorStore = {
        async saveEmbedding(
            userId: string,
            vector: number[],
            reasoning: string,
            resonanceScore: number,
            embedding?: number[]
        ) {
            const vectorString = `[${vector.join(",")}]`;
            const embeddingString = embedding ? `[${embedding.join(",")}]` : null;

            if (embeddingString) {
                await prisma.$executeRaw`
                    INSERT INTO "essence_vectors" ("id", "userId", "vector", "embedding", "vectorJson", "reasoning", "resonanceScore", "createdAt")
                    VALUES (gen_random_uuid(), ${userId}, ${vectorString}::vector, ${embeddingString}::vector, ${vectorString}, ${reasoning}, ${resonanceScore}, NOW())
                `;
            } else {
                await prisma.$executeRaw`
                    INSERT INTO "essence_vectors" ("id", "userId", "vector", "vectorJson", "reasoning", "resonanceScore", "createdAt")
                    VALUES (gen_random_uuid(), ${userId}, ${vectorString}::vector, ${vectorString}, ${reasoning}, ${resonanceScore}, NOW())
                `;
            }
        },
        async searchSimilar(targetVector: number[], limit: number = 5) {
            const vectorString = `[${targetVector.join(",")}]`;
            return await prisma.$queryRaw`
                SELECT ev.id, ev."userId", ev."vectorJson", ev.reasoning, ev."resonanceScore",
                       (ev.vector <=> ${vectorString}::vector) as distance
                FROM "essence_vectors" ev
                ORDER BY distance ASC
                LIMIT ${limit}
            `;
        },
    };

    // DB接続テスト (非同期 — 失敗時はログのみ)
    prisma
        .$queryRaw`SELECT 1`
        .then(() => console.log("✅ PostgreSQL + pgvector 接続成功"))
        .catch((err: any) => console.warn("⚠️ DB接続失敗 (モックにフォールバックはしません):", err.message));
} catch (e: any) {
    console.warn(
        "⚠️ Prisma Client が見つかりません。インメモリ・モックを使用します。",
        e.message
    );

    // In-Memory Mock Store (Prisma未生成時 or ビルド時のフォールバック)
    const mockUsers: any[] = [];
    const mockVectors: any[] = [];
    const mockDiagnostics: any[] = [];

    prisma = {
        user: {
            findUnique: async ({ where }: any) =>
                mockUsers.find(
                    (u) => u.email === where.email || u.id === where.id
                ) || null,
            create: async ({ data }: any) => {
                const newUser = { id: `mock_${Date.now()}`, ...data };
                mockUsers.push(newUser);
                return newUser;
            },
            findFirst: async () => mockUsers[0] || null,
        },
        diagnosticResult: {
            create: async ({ data }: any) => {
                const result = {
                    id: `mock_diag_${Date.now()}`,
                    ...data,
                    createdAt: new Date(),
                };
                mockDiagnostics.push(result);
                return result;
            },
            findUnique: async ({ where }: any) =>
                mockDiagnostics.find((d) => d.id === where.id) || null,
        },
        essenceVector: {
            create: async () => {},
        },
        $executeRaw: async (...args: any[]) =>
            console.log("Mock $executeRaw"),
        $queryRaw: async () => [],
    };

    vectorStore = {
        async saveEmbedding(
            userId: string,
            vector: number[],
            reasoning: string,
            resonanceScore: number,
            embedding?: number[]
        ) {
            console.log("Mock saveEmbedding:", userId, `[${vector.length}dim]`, embedding ? `[${embedding.length}dim]` : "");
            mockVectors.push({ userId, vector, reasoning, resonanceScore, embedding });
        },
        async searchSimilar(targetVector: number[], limit: number = 5) {
            // モックでも最低限のコサイン類似度検索を実行
            if (mockVectors.length === 0) return [];

            const dot = (a: number[], b: number[]) =>
                a.reduce((s, v, i) => s + v * (b[i] || 0), 0);
            const mag = (a: number[]) =>
                Math.sqrt(a.reduce((s, v) => s + v * v, 0));
            const cosine = (a: number[], b: number[]) => {
                const ma = mag(a);
                const mb = mag(b);
                return ma && mb ? dot(a, b) / (ma * mb) : 0;
            };

            return mockVectors
                .map((mv) => ({
                    id: `mock_vec_${mv.userId}`,
                    userId: mv.userId,
                    vectorJson: JSON.stringify(mv.vector),
                    reasoning: mv.reasoning,
                    resonanceScore: mv.resonanceScore,
                    distance: 1 - cosine(targetVector, mv.vector),
                }))
                .sort((a, b) => a.distance - b.distance)
                .slice(0, limit);
        },
    };
}

export { prisma, vectorStore };

```

---

## `src\lib\crypto.ts`

```typescript
import crypto from 'crypto';

// Use a secure key from environment variables or fallback to a hardcoded one for dev (WARNING: Change this in production!)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'zax_dev_key_32chars_placeholder!'; 

if (process.env.NODE_ENV === 'production' && !process.env.ENCRYPTION_KEY) {
    console.warn("WARNING: ENCRYPTION_KEY is not defined. Using fallback for build.");
}

if (ENCRYPTION_KEY.length !== 32) {
    // console.warn("WARNING: ENCRYPTION_KEY should be 32 characters for AES-256.");
    // We allow it to pass here but the hash below ensures we get a 32-byte key anyway.
}
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Encrypts a text string using AES-256-CBC
 */
export function encrypt(text: string): string {
    // Ensure the key is 32 bytes (256 bits)
    // If the provided key is short, we pad it or hash it. Here we assume it's roughly correct or just hash it to be safe.
    const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest('base64').substr(0, 32);
    
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
    const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest('base64').substr(0, 32);
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString();
}

/**
 * セッションIDをHMAC-SHA256で署名し、改ざん防止する
 * フォーマット: "userId.signature"
 */
export function signSession(userId: string): string {
    const hmac = crypto.createHmac('sha256', ENCRYPTION_KEY);
    hmac.update(userId);
    return `${userId}.${hmac.digest('hex')}`;
}

/**
 * 署名付きセッションIDを検証し、元のuserIdを返す
 * 署名が無効な場合はnullを返す
 */
export function verifySession(signedSession: string | undefined | null): string | null {
    if (!signedSession) return null;
    const parts = signedSession.split('.');

    if (parts.length !== 2) return null;

    const [userId, signature] = parts;
    const hmac = crypto.createHmac('sha256', ENCRYPTION_KEY);
    hmac.update(userId);

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

// 補完性スコア: 類似度0.5をピークとするベルカーブ
export function calculateComplementarityScore(userVec: number[], targetVec: number[]): number {
  const sim = cosineSimilarity(userVec, targetVec);
  const optimalDistance = 0.5;
  const growthPotential = Math.exp(-Math.pow(sim - optimalDistance, 2) / 0.1);
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
    `あなたの${weakDim}の高さが、相手の${strongDim}と補完関係にあります。共鳴度${simPercent}%は、成長を促す理想的な距離です。`,
    `${strongDim}が際立つ相手です。あなたにない視点を提供し、${weakDim}の強みで支え合える関係が期待できます。`,
    `ベクトル分析の結果、${strongDim}領域で+${Math.round(maxGap)}の差異を検出。互いの盲点を補い合う、成長ポテンシャル${growthScore}%の組み合わせです。`,
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}

// ─── Top N マッチング検索 ───
export async function findTopMatches(
  userVector: number[],
  topN: number = 5,
  userSynthesis?: string
): Promise<MatchResult[]> {

  // 1. DB検索を試みる
  try {
    const dbCandidates = await vectorStore.searchSimilar(userVector, 20);

    if (dbCandidates.length > 0) {
      const results: MatchResult[] = [];
      for (const candidate of dbCandidates) {
        let candidateVector: number[] = [];
        try {
          candidateVector = JSON.parse(candidate.vectorJson || candidate.vector);
        } catch { continue; }

        const sim = cosineSimilarity(userVector, candidateVector);
        const score = calculateComplementarityScore(userVector, candidateVector);

        let reasoning = generateReasoning(userVector, candidateVector, sim);
        if (userSynthesis) {
          try {
            reasoning = await generateMatchReasoning(
              userSynthesis,
              "共鳴する魂",
              candidate.reasoning || "ベクトル空間上で共鳴する存在。",
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
            name: "共鳴するパートナー",
            vector: candidateVector,
            bio: candidate.reasoning || "価値観の近い学生ユーザーです。",
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
    console.warn("DB Match failed", e);
  }

  // もしマッチ相手が1人もいなければ空配列を返す
  return [];
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

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function manualLogin(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // 1. バリデーション
    const validated = schema.safeParse({ email, password });
    if (!validated.success) {
        return { message: "無効な入力データです。" };
    }

    // 2. ユーザー検索
    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        return { message: "メールアドレスまたはパスワードが間違っています。" };
    }

    // 3. パスワード照合 (ハッシュ比較)
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
        return { message: "メールアドレスまたはパスワードが間違っています。" };
    }

    // 4. セッション発行 (HTTP-only Cookie)
    // 注意: 本番環境ではJWTやLucia Auth等のライブラリ推奨だが、ここでは簡易実装
    (await cookies()).set('zax-session', user.id, { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7 // 1週間
    });

    redirect('/');
}

export async function manualRegister(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const validated = schema.safeParse({ email, password });
    if (!validated.success) {
        return { message: "パスワードは6文字以上で入力してください。" };
    }

    // ドメイン制限 (武蔵野大学)
    if (!email.endsWith('@stu.musashino-u.ac.jp') && !email.endsWith('@musashino-u.ac.jp')) {
        return { message: "武蔵野大学のメールアドレスのみ登録可能です。" };
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        return { message: "このメールアドレスは既に登録されています。" };
    }

    // パスワードハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
        data: {
            email,
            password: hashedPassword
        }
    });

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
  reverse?: boolean;
};

export const questions: Question[] = [
  // Social Interaction (外向性・コミュニケーション)
  { id: 1, text: "初対面の人と会話を始めるのは得意な方だ。", category: 'Social', categoryJa: '外向性' },
  { id: 2, text: "週末は家で一人で過ごすよりも、友人と出かけたりイベントに参加したい。", category: 'Social', categoryJa: '外向性' },
  { id: 3, text: "グループの中では、聞き役よりも話し役になることが多い。", category: 'Social', categoryJa: '外向性' },
  { id: 4, text: "注目を浴びることに抵抗がない、むしろ好きだ。", category: 'Social', categoryJa: '外向性' },
  { id: 5, text: "自分の感情や考えを、すぐに言葉にして表現する方だ。", category: 'Social', categoryJa: '外向性' },
  { id: 6, text: "パーティーや交流会など、人が多い場所に行くとエネルギーをもらえる。", category: 'Social', categoryJa: '外向性' },
  { id: 7, text: "電話よりもテキストメッセージでのやり取りを好む。", category: 'Social', categoryJa: '外向性' }, // Note: Reverse score logic will be handled in analysis if needed, but for vectorization raw score + text is fine.
  { id: 8, text: "誰かと一緒にいるとき、沈黙が続くと気まずいと感じる。", category: 'Social', categoryJa: '外向性' },
  { id: 9, text: "浅く広い付き合いよりも、狭く深い付き合いを好む。", category: 'Social', categoryJa: '外向性' },
  { id: 10, text: "他人の意見に流されず、自分の主張をはっきりと伝えることができる。", category: 'Social', categoryJa: '外向性' },

  // Empathy & Harmony (協調性・共感性)
  { id: 11, text: "他人の感情の変化に敏感で、すぐ気がつく方だ。", category: 'Empathy', categoryJa: '協調性' },
  { id: 12, text: "困っている人がいると、自分のことを後回しにしてでも助けたくなる。", category: 'Empathy', categoryJa: '協調性' },
  { id: 13, text: "議論で勝つことよりも、相手との調和を保つことの方が重要だと思う。", category: 'Empathy', categoryJa: '協調性' },
  { id: 14, text: "人を批判するよりも、良いところを見つけて褒めるようにしている。", category: 'Empathy', categoryJa: '協調性' },
  { id: 15, text: "自分の利益よりも、チームやコミュニティ全体の利益を優先する。", category: 'Empathy', categoryJa: '協調性' },
  { id: 16, text: "映画や小説の登場人物に感情移入して泣いてしまうことがある。", category: 'Empathy', categoryJa: '協調性' },
  { id: 17, text: "他人の失敗に対して寛容であり、すぐに許すことができる。", category: 'Empathy', categoryJa: '協調性' },
  { id: 18, text: "嘘をつくことは、どんな理由があっても良くないと思う。", category: 'Empathy', categoryJa: '協調性' },
  { id: 19, text: "人からの頼み事を断るのが苦手だ。", category: 'Empathy', categoryJa: '協調性' },
  { id: 20, text: "競争する環境よりも、協力し合う環境の方が能力を発揮できる。", category: 'Empathy', categoryJa: '協調性' },

  // Discipline & Order (誠実性・規律)
  { id: 21, text: "部屋や机の上は常に整理整頓されている。", category: 'Discipline', categoryJa: '誠実性' },
  { id: 22, text: "計画を立ててから行動する方で、行き当たりばったりの行動は避ける。", category: 'Discipline', categoryJa: '誠実性' },
  { id: 23, text: "期限や約束の時間は必ず守る。", category: 'Discipline', categoryJa: '誠実性' },
  { id: 24, text: "一度始めたことは、どんなに困難でも最後までやり遂げる。", category: 'Discipline', categoryJa: '誠実性' },
  { id: 25, text: "細かい部分まで注意を払い、ミスがないよう徹底するタイプだ。", category: 'Discipline', categoryJa: '誠実性' },
  { id: 26, text: "ルールや規則は、社会秩序のために厳格に守るべきだと思う。", category: 'Discipline', categoryJa: '誠実性' },
  { id: 27, text: "衝動買いをすることはほとんどなく、慎重にお金を使う。", category: 'Discipline', categoryJa: '誠実性' },
  { id: 28, text: "目標達成のためなら、目先の快楽を我慢できる。", category: 'Discipline', categoryJa: '誠実性' },
  { id: 29, text: "効率性を重視し、無駄な作業は極力省きたい。", category: 'Discipline', categoryJa: '誠実性' },
  { id: 30, text: "何事も準備不足だと不安を感じる。", category: 'Discipline', categoryJa: '誠実性' },

  // Openness & Curiosity (開放性・知的好奇心)
  { id: 31, text: "抽象的な概念や哲学的な議論をするのが好きだ。", category: 'Openness', categoryJa: '開放性' },
  { id: 32, text: "伝統や慣習よりも、新しい方法や革新的なアイデアに惹かれる。", category: 'Openness', categoryJa: '開放性' },
  { id: 33, text: "美術館に行ったり、芸術作品に触れたりするのが好きだ。", category: 'Openness', categoryJa: '開放性' },
  { id: 34, text: "予測可能な日常よりも、変化に富んだ刺激的な毎日を求めている。", category: 'Openness', categoryJa: '開放性' },
  { id: 35, text: "未知の分野や新しい趣味に挑戦することにワクワクする。", category: 'Openness', categoryJa: '開放性' },
  { id: 36, text: "物事を多角的な視点から見るのが得意だ。", category: 'Openness', categoryJa: '開放性' },
  { id: 37, text: "「なぜ？」と根本的な理由を考えることがよくある。", category: 'Openness', categoryJa: '開放性' },
  { id: 38, text: "SF映画やファンタジー小説など、現実離れした世界観が好きだ。", category: 'Openness', categoryJa: '開放性' },
  { id: 39, text: "自分の価値観が絶対だとは思わず、多様な考え方を受け入れられる。", category: 'Openness', categoryJa: '開放性' },
  { id: 40, text: "クリエイティブな活動（執筆、描画、制作など）に時間を費やすのが好きだ。", category: 'Openness', categoryJa: '開放性' },

  // Emotional Logic / Stability (情緒安定性・メンタル)
  { id: 41, text: "プレッシャーのかかる状況でも、冷静に対処できる。", category: 'Emotional', categoryJa: '情緒安定性' },
  { id: 42, text: "些細なことでイライラしたり、落ち込んだりすることは少ない。", category: 'Emotional', categoryJa: '情緒安定性' },
  { id: 43, text: "将来に対して不安を感じるより、楽観的に考えることが多い。", category: 'Emotional', categoryJa: '情緒安定性' },
  { id: 44, text: "失敗しても、すぐに気持ちを切り替えて次の行動に移せる。", category: 'Emotional', categoryJa: '情緒安定性' },
  { id: 45, text: "他人からの批判を個人的な攻撃として受け取らず、冷静に分析できる。", category: 'Emotional', categoryJa: '情緒安定性' },
  { id: 46, text: "感情の起伏が激しい方ではない。", category: 'Emotional', categoryJa: '情緒安定性' },
  { id: 47, text: "リラックスする時間を意識的に確保している。", category: 'Emotional', categoryJa: '情緒安定性' },
  { id: 48, text: "自分の弱みを見せることに抵抗がない。", category: 'Emotional', categoryJa: '情緒安定性' },
  { id: 49, text: "予期せぬトラブルが起きてもパニックにならずに対応できる。", category: 'Emotional', categoryJa: '情緒安定性' },
  { id: 50, text: "自分自身に対して自信を持っており、自己肯定感が高い。", category: 'Emotional', categoryJa: '情緒安定性' },

  // -- 追加質問 --
  { id: 51, text: "自分と異なる意見を持つ相手とも、深い信頼関係を築ける。", category: 'Openness', categoryJa: '開放性' },
  { id: 52, text: "ストレスが溜まったときは、誰かに話すより一人で静かに過ごしたい。", category: 'Social', categoryJa: '外向性', reverse: true },
  { id: 53, text: "人生において安定よりも刺激や挑戦を常に求めていたい。", category: 'Openness', categoryJa: '開放性' },
  { id: 54, text: "自分の志や目的のためなら、周囲の環境が変わることも厭わない。", category: 'Discipline', categoryJa: '誠実性' },
  { id: 55, text: "広く浅い人脈よりも、深く狭い信頼関係の方が価値がある。", category: 'Social', categoryJa: '外向性', reverse: true },
  { id: 56, text: "物事を判断する基準は、社会的な常識よりも自分の信念に基づいている。", category: 'Discipline', categoryJa: '誠実性', reverse: true },
  { id: 57, text: "何か問題が起きたとき、感情に寄り添うよりも先に解決策を提示してほしい。", category: 'Empathy', categoryJa: '協調性', reverse: true },
  { id: 58, text: "自分に自信がある方だ。", category: 'Emotional', categoryJa: '情緒安定性' },
  { id: 59, text: "どんなに親しい間柄でも、踏み込ませないパーソナルスペースが必要だ。", category: 'Social', categoryJa: '外向性', reverse: true },
];

/** 1-7スケールで逆転項目の場合は 8 - score を返す */
export function effectiveScore(question: Question, rawScore: number): number {
  if (question.reverse) return 8 - rawScore;
  return rawScore;
}

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

