import { db } from "@/lib/db";
import { getOrders } from "@/lib/actions/orders";
import { OrdersModule } from "@/components/orders/orders-module";

export const dynamic = "force-dynamic";

export default async function PedidosPage() {
  const orders = await getOrders();
  const customers = await db.customer.findMany({ orderBy: { name: "asc" } });
  const products = await db.product.findMany({ where: { active: true }, orderBy: { name: "asc" } });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-rose-950">🧾 Gestión de Pedidos & Envíos</h1>
        <p className="text-xs text-slate-500">Pedidos de WhatsApp, guías de envío y entregas en tienda</p>
      </div>

      <OrdersModule
        orders={JSON.parse(JSON.stringify(orders))}
        customers={JSON.parse(JSON.stringify(customers))}
        products={JSON.parse(JSON.stringify(products))}
      />
    </div>
  );
}
