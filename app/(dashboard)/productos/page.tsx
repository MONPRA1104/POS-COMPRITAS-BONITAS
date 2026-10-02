import { db } from "@/lib/db";
import { ProductsModule } from "@/components/products/products-module";

export const dynamic = "force-dynamic";

export default async function ProductosPage() {
  const products = await db.product.findMany({
    where: { active: true },
    include: {
      category: true,
      variants: { where: { active: true } },
    },
    orderBy: { name: "asc" },
  });

  const categories = await db.category.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-rose-950">🧺 Catálogo de Productos y Variantes</h1>
        <p className="text-xs text-slate-500">Administra tus prendas, tallas, colores y precios</p>
      </div>

      <ProductsModule
        products={JSON.parse(JSON.stringify(products))}
        categories={JSON.parse(JSON.stringify(categories))}
      />
    </div>
  );
}
