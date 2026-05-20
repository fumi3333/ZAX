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
              <h2 className="text-lg font-bold mb-3 border-l-4 border-black pl-3">1. 収集する情報</h2>
              <p>ZAX（以下「本サービス」）は、以下の情報を収集します。</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>メールアドレス</strong>: 入力された瞬間にSHA-256でハッシュ化され、元のアドレスは保存されません。管理者も閲覧不可です。</li>
                <li><strong>診断回答データ</strong>: 60問への回答（1〜7のスコア）。AIによる分析・マッチング・サービス改善のために保存されます。</li>
                <li><strong>所属キャンパス</strong>: 任意入力。マッチング精度向上のために使用します。</li>
                <li><strong>自由記述テキスト</strong>: 任意入力。AI分析の精度向上に使用し、個人特定には利用しません。</li>
                <li><strong>セッションID</strong>: ブラウザのCookieに保存される匿名識別子。診断履歴の管理に使用します。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3 border-l-4 border-black pl-3">2. データの利用目的</h2>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>診断履歴の管理・表示</li>
                <li>価値観ベクトルに基づくマッチング候補の生成</li>
                <li>AI（Google Gemini API）による性格分析レポートの生成</li>
                <li>サービス改善のための統計分析（個人を特定しない形式）</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3 border-l-4 border-black pl-3">3. AIの利用について</h2>
              <p>
                本サービスはGoogle Gemini APIを使用します。APIに送信されるデータは診断スコアと自由記述のみで、メールアドレス等の個人情報は含まれません。
                Googleのデータ処理方針については<a href="https://policies.google.com/privacy" className="underline" target="_blank" rel="noopener noreferrer">Google プライバシーポリシー</a>をご参照ください。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3 border-l-4 border-black pl-3">4. 第三者への提供</h2>
              <p>法令に基づく要請がある場合を除き、ユーザーの同意なく個人データを第三者に提供しません。</p>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3 border-l-4 border-black pl-3">5. データの保存期間と削除</h2>
              <p>
                診断データはサービス提供に必要な期間保存します。削除を希望される場合は下記連絡先までご連絡ください。確認後、速やかに対応します。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3 border-l-4 border-black pl-3">6. お問い合わせ</h2>
              <p>個人情報に関するご質問・削除依頼は以下までご連絡ください。</p>
              <p className="mt-2 font-bold">Email: hrf.mtd@gmail.com</p>
            </section>

            <section className="pt-8 border-t border-slate-100 italic text-slate-400">
              <p>最終更新日: 2026年5月20日</p>
              <p>ZAX 運営（武蔵野大学 経済学部）</p>
            </section>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
