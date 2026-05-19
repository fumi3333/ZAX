# 2026-05-19 ローンチ対応ログ

## 概要

Vercel へのプロダクションデプロイに向けてビルド警告を解消した。

---

## 変更内容

### 1. `src/app/layout.tsx` — metadataBase 追加

**変更前:**
```ts
export const metadata: Metadata = {
  title: "ZAX | Value-Based Connection",
  ...
```

**変更後:**
```ts
export const metadata: Metadata = {
  metadataBase: new URL("https://zax.fumiproject.dev"),
  title: "ZAX | Value-Based Connection",
  ...
```

**理由:**  
`metadataBase` が未設定だと Next.js が OGP 画像 URL を `http://localhost:3000` で解決してしまい、SNS シェア時に画像が表示されない。

---

### 2. `src/middleware.ts` → `src/proxy.ts` — Next.js 16 対応

**変更前:** `src/middleware.ts` に `export function middleware(...)`

**変更後:** `src/proxy.ts` に `export function proxy(...)` としてリネーム

**理由:**  
Next.js 16 から `middleware` ファイル規約が deprecated になり、`proxy` へ移行が必要。  
ビルド時に `⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.` の警告が出ていた。  
両ファイルが共存するとビルドエラーになるため `middleware.ts` は削除。

---

## ビルド結果

```
✓ Compiled successfully in 6.4s
✓ Generating static pages using 15 workers (27/27)
```

警告・エラーなし。

---

## コミット

`f25be7e` — launch: fix build warnings blocking production deploy

## PR

https://github.com/fumi3333/ZAX/pull/new/claude/sweet-sanderson-503fa8
