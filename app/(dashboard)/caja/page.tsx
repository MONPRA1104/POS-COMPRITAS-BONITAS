import { getCurrentCashRegister } from "@/lib/actions/cash";
import { CashModule } from "@/components/cash/cash-module";

export const dynamic = "force-dynamic";

export default async function CajaPage() {
  const currentRegister = await getCurrentCashRegister();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-rose-950">💵 Control de Caja y Arqueo</h1>
        <p className="text-xs text-slate-500">Gestión de aperturas, cierres y movimientos de efectivo</p>
      </div>

      <CashModule initialCashRegister={JSON.parse(JSON.stringify(currentRegister))} />
    </div>
  );
}
