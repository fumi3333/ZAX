import DiagnosticResultClient from "@/components/diagnostic/DiagnosticResultClient";

export default async function DiagnosticResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DiagnosticResultClient resultId={id} />;
}
