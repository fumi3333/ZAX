import ImpactSimulationGraph from '@/components/ImpactSimulationGraph';

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-black text-slate-900 tracking-widest sm:text-4xl">
            診断履歴
          </h1>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <ImpactSimulationGraph />
        </div>
      </div>
    </div>
  );
}
