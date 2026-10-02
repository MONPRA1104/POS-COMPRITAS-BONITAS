import { db } from "@/lib/db";
import { CustomersModule } from "@/components/customers/customers-module";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const customers = await db.customer.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-rose-950">👥 Directorio de Clientes</h1>
        <p className="text-xs text-slate-500">Gestión de contactos, direcciones e historial de compras</p>
      </div>

      <CustomersModule initialCustomers={JSON.parse(JSON.stringify(customers))} />
    </div>
  );
}
