# ZAX ドキュメント

このディレクトリには、ZAXプロジェクトの包括的なドキュメントが含まれています。

---

## 📚 ドキュメント一覧

| ドキュメント | 対象読者 | 内容 |
|-------------|---------|------|
| **[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)** | 全員 | プロジェクトの概要、コンセプト、哲学 |
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | エンジニア | 技術アーキテクチャ、スタック、データモデル |
| **[IMPLEMENTATION.md](./IMPLEMENTATION.md)** | 開発者 | 実装詳細、コード構造、開発ガイド |
| **[API_REFERENCE.md](./API_REFERENCE.md)** | API利用者 | 全エンドポイントの仕様 |
| **[HACKATHON.md](./HACKATHON.md)** | デモ担当 | ハッカソン提出・デモ手順 |
| **[TECHNICAL_SPEC.md](./TECHNICAL_SPEC.md)** | 技術者全般 | 完全版技術仕様書（全カバー） |
| **[DEVELOPMENT_HISTORY.md](./DEVELOPMENT_HISTORY.md)** | チーム | 開発履歴、設計判断の経緯 |

---

## 🎯 読み方ガイド

### 「ZAXって何？」を知りたい → [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)

- プロジェクトの本質
- コアコンセプト
- 主要機能
- 将来展望

### 「技術的にどう作られている？」を知りたい → [ARCHITECTURE.md](./ARCHITECTURE.md)

- システム全体構成
- 技術スタック詳細
- データベース設計（ER図）
- マッチングアルゴリズム

### 「コードをいじりたい」 → [IMPLEMENTATION.md](./IMPLEMENTATION.md)

- ディレクトリ構造
- 主要コンポーネント解説
- カスタマイズポイント
- よくあるエラーと対処

### 「APIを使いたい」 → [API_REFERENCE.md](./API_REFERENCE.md)

- 全エンドポイント
- リクエスト/レスポンス形式
- エラーハンドリング
- 使用例（JavaScript）

### 「ハッカソンでデモする」 → [HACKATHON.md](./HACKATHON.md)

- 提出チェックリスト
- 3分デモシナリオ
- Zenn記事構成案
- スクリーンショット箇所

### 「全部詳しく知りたい」 → [TECHNICAL_SPEC.md](./TECHNICAL_SPEC.md)

- 哲学と人間観
- 数式・グラフ付きアルゴリズム
- UI/UXデザインシステム
- セキュリティ・パフォーマンス
- 将来拡張（RAG、BMI）

### 「なぜこうなった？」を知りたい → [DEVELOPMENT_HISTORY.md](./DEVELOPMENT_HISTORY.md)

- 開発タイムライン
- 設計判断の理由
- 遭遇した問題と解決
- 学んだこと

---

## 🔍 クイックリンク

### よくある質問

- **Q**: マッチングアルゴリズムの数式は？  
  **A**: [ARCHITECTURE.md - マッチングアルゴリズム](./ARCHITECTURE.md#🧮-マッチングアルゴリズム詳細)

- **Q**: 診断の50問はどこに定義されている？  
  **A**: [IMPLEMENTATION.md - データ構造](./IMPLEMENTATION.md#📁-ディレクトリ構造) → `src/data/questions.ts`

- **Q**: pgvectorのHNSWインデックスって何？  
  **A**: [TECHNICAL_SPEC.md - アルゴリズム](./TECHNICAL_SPEC.md#53-pgvector-検索)

- **Q**: 補完性スコアの根拠は？  
  **A**: [PROJECT_OVERVIEW.md - 補完性スコア](./PROJECT_OVERVIEW.md#2-補完性スコアの設計思想) & [DEVELOPMENT_HISTORY.md - 設計判断](./DEVELOPMENT_HISTORY.md#判断1-なぜ補完性スコアなのか)

---

## 📖 推奨読書順序

### パターン1: 全体把握 → 実装

```
1. PROJECT_OVERVIEW.md     (15分)
2. ARCHITECTURE.md         (20分)
3. IMPLEMENTATION.md       (30分)
4. コーディング開始
```

### パターン2: ハッカソン準備

```
1. PROJECT_OVERVIEW.md     (15分)
2. HACKATHON.md            (15分)
3. デモ練習
```

### パターン3: 技術深掘り

```
1. TECHNICAL_SPEC.md       (60分)
2. ARCHITECTURE.md         (復習)
3. 実験・検証
```

---

## 🛠️ メンテナンス

### ドキュメント更新時のルール

1. **変更箇所を明記**: 各ドキュメント冒頭の `Last Updated` を更新
2. **一貫性を保つ**: 用語統一、リンク整合性
3. **履歴を残す**: `DEVELOPMENT_HISTORY.md` に追記

### 用語統一

| 用語 | 使用 | 避ける |
|------|-----|--------|
| 補完性スコア | ✅ | 相性スコア、マッチングスコア |
| pgvector | ✅ | PGVector、Pg-vector |
| Gemini Pro | ✅ | gemini-pro、Gemini pro |
| レーダーチャート | ✅ | スパイダーチャート |
| アーキタイプ | ✅ | ダミーユーザー、サンプルユーザー |

---

## 📝 ドキュメント執筆ガイドライン

### Markdown スタイル

```markdown
# H1: ドキュメントタイトル（1つのみ）
## H2: 大セクション
### H3: 中セクション

**太字**: 強調
`code`: インラインコード
```language
コードブロック
```

> 引用: 重要な注意事項
```

### コードブロック

- **言語指定**: 必ず記述（```typescript, ```sql, etc.）
- **コメント**: 複雑なロジックには日本語コメント
- **実行可能**: コピペで動くコードを心がける

### 図表

- **ASCII Art**: 簡易的な図（システム構成図など）
- **Mermaid**: フローチャート（将来導入予定）
- **テーブル**: データの比較・一覧

---

## 🔗 外部リソース

### 公式ドキュメント

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [pgvector GitHub](https://github.com/pgvector/pgvector)
- [Gemini API](https://ai.google.dev/docs)
- [Framer Motion](https://www.framer.com/motion/)

### 参考記事

- [pgvector実践ガイド](https://zenn.dev/tags/pgvector)
- [Next.js App Router入門](https://zenn.dev/topics/nextjs)
- [RAG入門](https://zenn.dev/topics/rag)

---

## 💬 フィードバック

ドキュメントの改善提案は、GitHubのIssueまたはPull Requestでお願いします。

**改善してほしい点**:
- 誤字・脱字
- 説明不足の箇所
- リンク切れ
- コード例の間違い

---

**良いドキュメントは、良いコードの始まり。**
