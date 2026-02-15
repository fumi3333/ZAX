# Cloud Run へのデプロイ（Google Cloud）

第4回 Agentic AI Hackathon 等、Google Cloud へのデプロイが必要な場合の手順です。

## 前提

- Google Cloud プロジェクトがあること（個人プロジェクト推奨）
- [gcloud CLI](https://cloud.google.com/sdk/docs/install) がインストール済み
- `gcloud init` と `gcloud auth login` 済み

## 1. プロジェクト設定

```bash
# プロジェクトIDを指定
export PROJECT_ID=your-gcp-project-id
gcloud config set project $PROJECT_ID

# 必要なAPIを有効化
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
```

## 2. 環境変数の準備

Cloud Run に渡す環境変数（[Cloud Run コンソール](https://console.cloud.google.com/run) の「変数とシークレット」で設定可能）:

| 変数名 | 説明 |
|--------|------|
| `DATABASE_URL` | PostgreSQL 接続文字列（モック時は `postgresql://localhost:5432/dummy` でビルドのみ可能） |
| `GOOGLE_API_KEY` | Gemini API 用（Google AI Studio で取得） |

## 3. デプロイ

### 方法A: ソースからデプロイ（推奨）

```bash
gcloud run deploy zax \
  --source . \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --set-env-vars "DATABASE_URL=postgresql://localhost:5432/dummy" \
  --set-env-vars "GOOGLE_API_KEY=YOUR_GEMINI_API_KEY"
```

※ `GOOGLE_API_KEY` は Secret Manager を使うと安全です:
```bash
# シークレット作成後
gcloud run deploy zax --source . --region asia-northeast1 \
  --allow-unauthenticated \
  --set-env-vars "DATABASE_URL=postgresql://localhost:5432/dummy" \
  --set-secrets "GOOGLE_API_KEY=google-api-key:latest"
```

### 方法B: Dockerfile からビルド

```bash
# イメージをビルドしてプッシュ
gcloud builds submit --tag gcr.io/$PROJECT_ID/zax

# Cloud Run にデプロイ
gcloud run deploy zax \
  --image gcr.io/$PROJECT_ID/zax \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --set-env-vars "DATABASE_URL=postgresql://localhost:5432/dummy" \
  --set-env-vars "GOOGLE_API_KEY=YOUR_GEMINI_API_KEY"
```

## 4. デプロイ後

- 表示された URL（例: `https://zax-xxx-an.a.run.app`）にアクセス
- 診断 → 結果 → マッチング → チャット → 振り返りの流れを確認

## トラブルシュート

- **ビルド失敗**: [Cloud Build ログ](https://console.cloud.google.com/cloud-build/builds)で詳細を確認
- **Prisma エラー**: `DATABASE_URL` がビルド・実行時に設定されているか確認
- **Gemini が動かない**: `GOOGLE_API_KEY` が正しく設定されているか確認（個人プロジェクト推奨）
