import { getDashboardMetrics } from "@/lib/actions/reports";
import { ReportsModule } from "@/components/reports/reports-module";

export const dynamic = "force-dynamic";

export default async function ReportesPage() {
  const metrics = await getDashboardMetrics();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-rose-950">📈 Reportes Financieros y Métricas</h1>
        <p className="text-xs text-slate-500">Análisis de utilidad bruta, utilidad estimada y rotación de productos</p>
      </div>

      <ReportsModule metrics={JSON.parse(JSON.stringify(metrics))} />
    </div>
  );
}
