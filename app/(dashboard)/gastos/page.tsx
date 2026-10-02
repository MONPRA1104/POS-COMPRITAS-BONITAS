import { getExpenses } from "@/lib/actions/expenses";
import { ExpensesModule } from "@/components/expenses/expenses-module";

export const dynamic = "force-dynamic";

export default async function GastosPage() {
  const expenses = await getExpenses();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-rose-950">💸 Registro de Gastos</h1>
        <p className="text-xs text-slate-500">Control de egresos, empaques, mercancía y publicidad</p>
      </div>

      <ExpensesModule initialExpenses={JSON.parse(JSON.stringify(expenses))} />
    </div>
  );
}
