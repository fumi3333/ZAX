-- マッチ通知メール送信用：暗号化されたメアドを保存するカラム追加
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "contactEmail" TEXT;
