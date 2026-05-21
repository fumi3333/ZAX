# 2026-05-21 モジュール化リファクタリングログ

## 背景

マッチング機能を6月11日に追加するにあたり、`DiagnosticResultClient.tsx` が
結果表示・メール登録・マッチ登録・状態管理をすべて1ファイルで担っており、
拡張のたびに影響範囲が広がる（密結合）問題を解消するため、
**疎結合（Loose Coupling）** を目的としたモジュール化を実施。

---

## 作成したファイル

### `src/features/diagnostic/types.ts`
- `ResultData` / `StructuredReport` インターフェース
- `DIMENSION_LABELS` / `OMIKUJI_SECTIONS` 定数
- 診断機能全体で共有する型の単一ソース

### `src/features/diagnostic/utils/parseReport.ts`
- `sanitizeText()` — 記号除去テキストクリーンアップ
- `parseReport()` — JSON/プレーンテキスト両対応の分析結果パーサー
- 旧 `DiagnosticResultClient.tsx` から抽出

### `src/features/diagnostic/hooks/useDiagnosticResult.ts`
- 診断結果のフェッチロジックをカプセル化
- sessionStorageへのフォールバック込み
- 戻り値: `{ data, setData, loading, error }`

### `src/features/match/types.ts`
- `MatchType` / `CampusName` / `MatchRegistrationState` 型定義

### `src/features/match/hooks/useMatchRegistration.ts`
- キャンパスマッチ・通常マッチ両方の登録ロジック
- バリデーション・エラーハンドリングを内包
- 戻り値: `{ campusRegistered, generalRegistered, isRegistering, campusError, registerCampus, registerGeneral }`

### `src/features/match/components/MatchRegistrationForm.tsx`
- キャンパスマッチ・通常マッチの登録UIを独立コンポーネント化
- Props: `{ resultId, email }`
- 内部で `useMatchRegistration` を使用

---

## 変更したファイル

### `src/components/diagnostic/DiagnosticResultClient.tsx`
- 557行 → 約170行に削減
- 依存: `useDiagnosticResult` / `parseReport` / `MatchRegistrationForm`
- 責務: レーダーチャート表示・メール登録ゲート・おみくじ表示の統合のみ

---

## 新しいディレクトリ構造

```
src/
├── features/
│   ├── diagnostic/
│   │   ├── types.ts             # 型・定数
│   │   ├── utils/
│   │   │   └── parseReport.ts   # テキスト処理
│   │   └── hooks/
│   │       └── useDiagnosticResult.ts  # データ取得
│   └── match/
│       ├── types.ts             # 型定義
│       ├── hooks/
│       │   └── useMatchRegistration.ts # 登録ロジック
│       └── components/
│           └── MatchRegistrationForm.tsx # 登録UI
├── components/
│   └── diagnostic/              # 既存（表示専用コンポーネント）
└── lib/                         # 既存（DB・crypto等ユーティリティ）
```

---

## 効果

| 変更前 | 変更後 |
|--------|--------|
| マッチ機能を変えると DiagnosticResultClient 全体を触る | `features/match/` だけ触ればOK |
| 型・定数がコンポーネント内に埋め込まれていた | `types.ts` が単一ソース |
| ロジックとUIが混在 | hook（ロジック）とcomponent（UI）が分離 |
| DiagnosticResultClient が557行 | 約170行に削減 |

---

## 次のステップ（マッチ機能拡張時）

- `src/features/match/` 内にマッチ候補表示・チャット開始ロジックを追加
- `DiagnosticResultClient` は変更不要
