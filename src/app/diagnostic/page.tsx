import DiagnosticWizard from '@/components/diagnostic/DiagnosticWizard';

export const metadata = {
  title: '性格・価値観診断 | ZAX',
  description: 'AIがあなたの性格と価値観を分析し、最適なマッチングを実現します。',
};

export default function DiagnosticPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            ZAX 性格・価値観診断
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            59の質問から、あなたの価値観を可視化します。<br/>
            直感で回答してください。
          </p>
        </div>

        <DiagnosticWizard />
      </div>
    </div>
  );
}
