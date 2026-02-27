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
