import { db } from "@/lib/db";
import { getInventoryMovements } from "@/lib/actions/inventory";
import { InventoryModule } from "@/components/inventory/inventory-module";

export const dynamic = "force-dynamic";

export default async function InventarioPage() {
  const [products, movements] = await Promise.all([
    db.product.findMany({
      where: { active: true },
      include: {
        category: true,
        variants: { where: { active: true } },
      },
      orderBy: { name: "asc" },
    }),
    getInventoryMovements()
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-rose-950">📦 Control de Inventario y Movimientos</h1>
        <p className="text-xs text-slate-500">Gestión de existencias, stock mínimo y auditoría</p>
      </div>

      <InventoryModule
        products={JSON.parse(JSON.stringify(products))}
        movements={JSON.parse(JSON.stringify(movements))}
      />
    </div>
  );
}
