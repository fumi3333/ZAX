-- すべてのテーブルでRLS（行レベルセキュリティ）を有効化
-- Prismaは postgres ロール経由でアクセスするためRLSをバイパスする
-- anon キー経由のPostgREST直叩きを遮断する目的

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "diagnostic_results" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "diagnostic_answers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "essence_vectors" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "feedbacks" ENABLE ROW LEVEL SECURITY;
