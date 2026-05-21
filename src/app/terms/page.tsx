export const metadata = {
  title: '利用規約 | ZAX',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="max-w-2xl mx-auto px-6 py-20 space-y-12">

        <div className="space-y-2">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400">Terms of Use</span>
          <h1 className="text-3xl font-black">利用規約</h1>
          <p className="text-xs text-slate-400">最終更新日：2026年5月21日</p>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          本規約は、ZAX（以下「本サービス」）の利用条件を定めるものです。
          本サービスを利用した時点で、本規約に同意したものとみなします。
        </p>

        <Section title="1. サービスの概要">
          <p>
            本サービスは、価値観診断とAI分析によって自己理解を深め、補完的な他者との出会いを提供するプラットフォームです。
            武蔵野大学（東京都西東京市・江東区）を主な対象としていますが、診断機能はどなたでも利用できます。
          </p>
        </Section>

        <Section title="2. キャンパスマッチについて">
          <p>
            キャンパスマッチ機能は、武蔵野大学の在学生（学部生・大学院生）を対象とした限定機能です。
            参加には大学発行のメールアドレスが必要です。在学生以外の方はご利用いただけません。
          </p>
        </Section>

        <Section title="3. 診断データの利用">
          <p>診断の回答・AI分析結果・ベクトルデータは、以下の目的で使用します。</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>マッチング精度の向上</li>
            <li>本サービスの研究・開発・改善</li>
            <li>統計的な分析（個人を特定しない形で集計）</li>
          </ul>
          <p className="mt-2">
            詳細は<a href="/privacy" className="underline hover:text-slate-600">プライバシーポリシー</a>をご確認ください。
          </p>
        </Section>

        <Section title="4. 禁止事項">
          <ul className="list-disc list-inside space-y-1">
            <li>他人のメールアドレスを使った登録・なりすまし</li>
            <li>本サービスへの不正アクセス・過度な負荷をかける行為</li>
            <li>虚偽の情報を登録する行為</li>
            <li>その他、法令または公序良俗に反する行為</li>
          </ul>
        </Section>

        <Section title="5. 免責事項">
          <p>
            本サービスは現状のまま提供されます。診断結果・マッチング結果について特定の成果を保証するものではありません。
            本サービスの利用によって生じた損害について、運営者は責任を負いません。
          </p>
        </Section>

        <Section title="6. サービスの変更・終了">
          <p>
            運営者は予告なくサービスの内容を変更、または提供を終了する場合があります。
          </p>
        </Section>

        <Section title="7. 規約の変更">
          <p>
            本規約は必要に応じて更新します。更新後も本サービスを継続して利用した場合、変更後の規約に同意したものとみなします。
          </p>
        </Section>

        <Section title="8. お問い合わせ">
          <p>
            本規約に関するお問い合わせは{' '}
            <a href="mailto:hrf.mtd@gmail.com" className="underline hover:text-slate-600">hrf.mtd@gmail.com</a> までご連絡ください。
          </p>
        </Section>

      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">{title}</h2>
      <div className="text-sm text-slate-600 leading-relaxed space-y-2">
        {children}
      </div>
    </section>
  );
}
