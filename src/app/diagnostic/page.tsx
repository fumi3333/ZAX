import DiagnosticWizard from '@/components/diagnostic/DiagnosticWizard';

export const metadata = {
  title: '性格・価値観診断 | ZAX',
  description: 'AIがあなたの性格と価値観を分析し、最適なマッチングを実現します。',
};

export default function DiagnosticPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl">
        <DiagnosticWizard />
      </div>
    </div>
  );
}
