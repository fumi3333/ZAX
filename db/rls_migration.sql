-- =============================================================================
-- ZAX: Row Level Security (RLS) Migration
-- 目的: Supabaseセキュリティ勧告の修正
--   - rls_disabled_in_public: 全テーブルにRLSを有効化
--   - sensitive_columns_exposed: usersテーブルの機密カラムを保護
-- 実行場所: Supabase Dashboard > SQL Editor
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. users テーブル
--    email, password は機密カラム → 認証済みユーザーが自分のデータのみ参照可
-- -----------------------------------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 自分のレコードのみ参照可
CREATE POLICY "users_select_own"
  ON users FOR SELECT
  USING (auth.uid()::text = id);

-- 自分のレコードのみ更新可
CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  USING (auth.uid()::text = id);

-- 新規登録はservice_roleのみ（APIルート経由のみ許可）
-- ※ INSERT は Next.js のサーバーサイドAPIルートから Prisma 経由で行うため
--    anon/authenticated からの直接INSERTは禁止
CREATE POLICY "users_insert_service_only"
  ON users FOR INSERT
  WITH CHECK (false); -- anon/authenticated からは直接INSERT不可

-- 削除はservice_roleのみ
CREATE POLICY "users_delete_service_only"
  ON users FOR DELETE
  USING (false); -- 直接削除不可

-- -----------------------------------------------------------------------------
-- 2. essence_vectors テーブル
-- -----------------------------------------------------------------------------
ALTER TABLE essence_vectors ENABLE ROW LEVEL SECURITY;

-- 自分のベクトルのみ参照可
CREATE POLICY "essence_vectors_select_own"
  ON essence_vectors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = essence_vectors.user_id
        AND auth.uid()::text = users.id
    )
  );

-- INSERT/UPDATE/DELETE はサービス経由のみ（直接不可）
CREATE POLICY "essence_vectors_write_service_only"
  ON essence_vectors FOR ALL
  USING (false)
  WITH CHECK (false);

-- -----------------------------------------------------------------------------
-- 3. feedbacks テーブル
-- -----------------------------------------------------------------------------
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feedbacks_select_own"
  ON feedbacks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = feedbacks.user_id
        AND auth.uid()::text = users.id
    )
  );

CREATE POLICY "feedbacks_write_service_only"
  ON feedbacks FOR ALL
  USING (false)
  WITH CHECK (false);

-- -----------------------------------------------------------------------------
-- 4. interactions テーブル
-- -----------------------------------------------------------------------------
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

-- 自分が参加したインタラクションのみ参照可
CREATE POLICY "interactions_select_own"
  ON interactions FOR SELECT
  USING (
    auth.uid()::text = "userAId"
    OR auth.uid()::text = "userBId"
  );

CREATE POLICY "interactions_write_service_only"
  ON interactions FOR ALL
  USING (false)
  WITH CHECK (false);

-- -----------------------------------------------------------------------------
-- 5. diagnostic_results テーブル
-- -----------------------------------------------------------------------------
ALTER TABLE diagnostic_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "diagnostic_results_select_own"
  ON diagnostic_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = diagnostic_results.user_id
        AND auth.uid()::text = users.id
    )
  );

CREATE POLICY "diagnostic_results_write_service_only"
  ON diagnostic_results FOR ALL
  USING (false)
  WITH CHECK (false);

-- -----------------------------------------------------------------------------
-- 6. gemini_logs テーブル
--    内部ログ → 誰も直接アクセス不可（サービス経由のみ）
-- -----------------------------------------------------------------------------
ALTER TABLE gemini_logs ENABLE ROW LEVEL SECURITY;

-- anon/authenticated からは完全に非公開
CREATE POLICY "gemini_logs_no_access"
  ON gemini_logs FOR ALL
  USING (false)
  WITH CHECK (false);

-- -----------------------------------------------------------------------------
-- 確認クエリ（実行後にコメントアウトを外して確認）
-- -----------------------------------------------------------------------------
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;
