import { db } from "@/lib/db";
import { POSInterface } from "@/components/pos/pos-interface";

export const dynamic = "force-dynamic";

export default async function NuevaVentaPage() {
  const [products, categories, customers, openCashRegister] = await Promise.all([
    db.product.findMany({
      where: { active: true },
      include: {
        category: true,
        variants: { where: { active: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    db.category.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
    db.customer.findMany({
      orderBy: { isGeneral: "desc" },
    }),
    db.cashRegister.findFirst({
      where: { status: "OPEN" },
    })
  ]);

  return (
    <div className="absolute inset-0 lg:inset-2 flex flex-col min-h-0 overflow-hidden space-y-4">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold text-rose-950">🛒 Nueva Venta POS</h1>
          <p className="text-xs text-slate-500">Cobro rápido en caja & mostrador</p>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        <POSInterface
          initialProducts={JSON.parse(JSON.stringify(products))}
          categories={JSON.parse(JSON.stringify(categories))}
          customers={JSON.parse(JSON.stringify(customers))}
          isOpenCashRegister={!!openCashRegister}
        />
      </div>
    </div>
  );
}
