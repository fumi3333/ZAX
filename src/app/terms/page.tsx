"use client";

import { motion } from "framer-motion";

export default function TermsOfServicePage() {
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
            Terms of Service
          </h1>
          
          <div className="space-y-8 text-sm leading-relaxed">
            <section>
              <h2 className="text-lg font-bold mb-3 border-l-4 border-black pl-3">1. 本サービスの目的</h2>
              <p>
                ZAXは、武蔵野大学の学生を対象とした、認知科学に基づく自己理解と価値観ベースのコミュニティ形成を支援する学術・体験型プロジェクトです。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3 border-l-4 border-black pl-3">2. 利用資格</h2>
              <p>
                本サービスは、以下の条件を満たす方のみ利用可能です。
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>18歳以上の大学生であること。</li>
                <li>武蔵野大学のメールアドレスを保持していること。</li>
                <li>本規約およびプライバシーポリシーに同意すること。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3 border-l-4 border-black pl-3">3. 禁止事項</h2>
              <p>本サービスを利用するにあたり、以下の行為を禁止します。</p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li><strong>過度な異性交際を目的とした利用</strong>: 本サービスは出会い系サイトではありません。学術的、学友的な関わり以外を主目的とした利用は固く禁じます。</li>
                <li><strong>他者への嫌がらせ・ハラスメント</strong>: 提案された相手や多人数に対する誹謗中傷、不適切な連絡。</li>
                <li><strong>虚偽の情報入力</strong>: 他者の学籍番号やメールアドレスを無断で使用する行為。</li>
                <li><strong>システムへの攻撃</strong>: 本サービスの運営を妨げるような不正アクセスや改ざん。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3 border-l-4 border-black pl-3">4. コミュニケーションと安全性</h2>
              <p>
                本サービスは価値観の近いユーザーを提案する機能を提供しますが、実際の交流は各ユーザーの責任において行ってください。本サービス内での直接的な無差別チャット機能は提供しておらず、安全性を考慮した設計となっています。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3 border-l-4 border-black pl-3">5. 免責事項</h2>
              <p>
                本サービスにおけるAIの分析結果はあくまで参考材料であり、その正確性や妥当性を保証するものではありません。また、本サービスを通じて生じたユーザー間のトラブルについて、運営側は一切の責任を負いません。
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
