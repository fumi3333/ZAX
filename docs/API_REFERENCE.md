# ZAX API リファレンス

すべてのAPIエンドポイントの仕様を記載します。

---

## 認証

現在、セッション（Cookie）ベースの簡易認証を使用。

**Cookie名**: `zax-session`  
**形式**: UUID（サーバー側で検証）

---

## エンドポイント一覧

| メソッド | パス | 説明 |
|---------|------|------|
| `POST` | `/api/diagnostic/submit` | 診断回答を送信 → AI分析 |
| `POST` | `/api/match` | ユーザーベクトルでマッチング検索 |
| `POST` | `/api/analyze` | テキスト入力 → 6次元ベクトル生成 |
| `POST` | `/api/feedback` | フィードバック保存（将来実装） |

---

## POST `/api/diagnostic/submit`

50問の診断回答を送信し、AI分析を実行します。

### リクエスト

```http
POST /api/diagnostic/submit
Content-Type: application/json
Cookie: zax-session=<uuid>

{
  "answers": {
    "1": 7,
    "2": 5,
    "3": 6,
    ...
    "50": 4
  }
}
```

**パラメータ**:

| フィールド | 型 | 必須 | 説明 |
|-----------|---|-----|------|
| answers | Object | ✅ | 質問ID → 回答値(1-7)のマップ |

### レスポンス（成功）

```json
{
  "success": true,
  "id": "uuid-of-diagnostic-result",
  "synthesis": "あなたは論理性と共感性のバランスが良く..."
}
```

### レスポンス（エラー）

```json
{
  "success": false,
  "error": "No answers provided"
}
```

**ステータスコード**:
- `200`: 成功
- `400`: リクエスト不正
- `401`: 未認証
- `500`: サーバーエラー

### 処理フロー

```
1. Cookie からユーザーID取得
2. 回答データのバリデーション
3. カテゴリ別スコア集計
4. Gemini Pro でテキスト分析
5. text-embedding-004 でベクトル化
6. DB保存（diagnostic_results + essence_vectors）
7. 結果IDを返却
```

---

## POST `/api/match`

ユーザーベクトルを受け取り、相性の良い候補を検索します。

### リクエスト

```http
POST /api/match
Content-Type: application/json

{
  "vector": [80, 60, 90, 45, 70, 85],
  "topN": 5
}
```

**パラメータ**:

| フィールド | 型 | 必須 | 説明 |
|-----------|---|-----|------|
| vector | number[] | ✅ | 6次元ベクトル（0-100） |
| topN | number | ❌ | 返却候補数（デフォルト: 5） |

### レスポンス

```json
{
  "success": true,
  "matches": [
    {
      "matchUser": {
        "id": "A-021",
        "name": "三浦 優奈",
        "vector": [30, 70, 95, 35, 55, 88],
        "bio": "人の痛みを自分のことのように感じる共感力。",
        "tags": ["Empathy", "Compassion"]
      },
      "similarity": 0.52,
      "growthScore": 88,
      "reasoning": "あなたの論理性の高さが、相手の共感性と補完関係にあります。共鳴度52%は、成長を促す理想的な距離です。"
    },
    {
      "matchUser": { ... },
      "similarity": 0.48,
      "growthScore": 85,
      "reasoning": "..."
    }
  ]
}
```

**matchUser**:

| フィールド | 型 | 説明 |
|-----------|---|------|
| id | string | ユーザーID |
| name | string | 名前 |
| vector | number[] | 6次元ベクトル |
| bio | string | プロフィール |
| tags | string[] | タグ（Logic, Empathy等） |

**マッチ情報**:

| フィールド | 型 | 説明 |
|-----------|---|------|
| similarity | number | コサイン類似度（-1〜1） |
| growthScore | number | 補完性スコア（0-100） |
| reasoning | string | AI推薦理由（日本語） |

### 処理フロー

```
1. vector のバリデーション（6次元チェック）
2. vectorStore.searchSimilar() で pgvector 検索
3. 各候補のコサイン類似度を計算
4. 補完性スコアを計算
5. スコア降順でソート
6. 上位 topN 件を返却
```

---

## POST `/api/analyze`

任意のテキストを6次元ベクトルに変換します（汎用分析API）。

### リクエスト

```http
POST /api/analyze
Content-Type: application/json

{
  "inputs": [
    "私は論理的に考えることが好きです",
    "感情よりも事実を重視します",
    "新しいアイデアを考えるのが楽しい"
  ],
  "biases": [70, 80, 60],
  "purpose": "general"
}
```

**パラメータ**:

| フィールド | 型 | 必須 | 説明 |
|-----------|---|-----|------|
| inputs | string[] | ✅ | 分析対象のテキスト（3つ） |
| biases | number[] | ❌ | 自己申告バイアス（0-100） |
| purpose | string | ❌ | 用途（general, romance, friendship） |

### レスポンス

```json
{
  "vector": [85, 40, 55, 70, 65, 50],
  "reasoning": "あなたは論理性が高く、構造的思考を好む傾向があります。",
  "resonance_score": 88
}
```

---

## POST `/api/feedback`（将来実装）

マッチング後のフィードバックを保存します。

### リクエスト（予定）

```http
POST /api/feedback
Content-Type: application/json
Cookie: zax-session=<uuid>

{
  "partnerId": "A-021",
  "scores": {
    "enjoyment": 8,
    "fulfillment": 9,
    "growthFeel": 8,
    "meetAgain": 9
  },
  "feedbackText": "とても共感的で、心が軽くなりました。"
}
```

### レスポンス（予定）

```json
{
  "success": true,
  "interactionId": "uuid-of-interaction"
}
```

---

## エラーハンドリング

### 共通エラーレスポンス

```json
{
  "success": false,
  "error": "Error message here"
}
```

### ステータスコード

| コード | 意味 | 例 |
|--------|------|---|
| `200` | 成功 | — |
| `400` | リクエスト不正 | Invalid vector format |
| `401` | 認証エラー | Unauthorized |
| `404` | 見つからない | Result not found |
| `500` | サーバーエラー | DB connection failed |

---

## API使用例（JavaScript）

### 診断送信

```javascript
const answers = { 1: 7, 2: 5, ... };

const res = await fetch('/api/diagnostic/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ answers }),
});

const data = await res.json();
console.log('診断ID:', data.id);
```

### マッチング検索

```javascript
const myVector = [80, 60, 90, 45, 70, 85];

const res = await fetch('/api/match', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ vector: myVector, topN: 3 }),
});

const data = await res.json();
console.log('マッチング候補:', data.matches);
```

---

## Rate Limiting（将来実装予定）

```
Gemini API: 60 requests/min
診断送信: 1回/分/ユーザー
マッチング検索: 10回/分/ユーザー
```

---

次のドキュメント: [ハッカソンデモ手順](./HACKATHON.md)
