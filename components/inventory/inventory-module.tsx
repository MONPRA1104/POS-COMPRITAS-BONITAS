"use client";

import { useState, useTransition } from "react";
import { adjustStock } from "@/lib/actions/inventory";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Package,
  Plus,
  Minus,
  Sliders,
  History,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Search,
} from "lucide-react";

export function InventoryModule({
  products,
  movements,
}: {
  products: any[];
  movements: any[];
}) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"STOCK" | "HISTORY">("STOCK");
  const [search, setSearch] = useState("");

  // Adjustment Modal
  const [adjustModalItem, setAdjustModalItem] = useState<{
    productId: string;
    variantId?: string;
    name: string;
    sku: string;
    currentStock: number;
  } | null>(null);

  const [adjustType, setAdjustType] = useState<
    "ENTRADA" | "AJUSTE_POSITIVO" | "AJUSTE_NEGATIVO" | "PRODUCTO_DANADO" | "DEVOLUCION"
  >("ENTRADA");
  const [adjustQty, setAdjustQty] = useState(1);
  const [adjustReason, setAdjustReason] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Flattened inventory items (products + variants)
  const inventoryItems: any[] = [];
  let totalInventoryValue = 0;

  for (const p of products) {
    if (p.hasVariants && p.variants.length > 0) {
      for (const v of p.variants) {
        const itemVal = v.stock * v.price;
        totalInventoryValue += itemVal;
        inventoryItems.push({
          id: `var-${v.id}`,
          productId: p.id,
          variantId: v.id,
          name: p.name,
          variantDetails: `Talla ${v.size || "-"} / Color ${v.color || "-"}`,
          sku: v.sku,
          stock: v.stock,
          minStock: v.minStock,
          cost: v.cost,
          price: v.price,
          totalValue: itemVal,
          status: v.stock === 0 ? "AGOTADO" : v.stock <= v.minStock ? "STOCK_BAJO" : "DISPONIBLE",
        });
      }
    } else {
      const itemVal = p.stock * p.price;
      totalInventoryValue += itemVal;
      inventoryItems.push({
        id: `prod-${p.id}`,
        productId: p.id,
        name: p.name,
        variantDetails: null,
        sku: p.sku,
        stock: p.stock,
        minStock: p.minStock,
        cost: p.cost,
        price: p.price,
        totalValue: itemVal,
        status: p.stock === 0 ? "AGOTADO" : p.stock <= p.minStock ? "STOCK_BAJO" : "DISPONIBLE",
      });
    }
  }

  const filteredItems = inventoryItems.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirmAdjustment = () => {
    if (!adjustModalItem) return;
    setErrorMsg(null);

    startTransition(async () => {
      const res = await adjustStock({
        productId: adjustModalItem.productId,
        variantId: adjustModalItem.variantId,
        type: adjustType,
        quantity: Number(adjustQty),
        reason: adjustReason,
      });

      if (res.success) {
        setAdjustModalItem(null);
        window.location.reload();
      } else {
        setErrorMsg(res.error || "Error al ajustar inventario.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-2xs">
          <span className="text-xs text-slate-500 block">Valor Total del Inventario</span>
          <p className="text-xl font-extrabold text-rose-950 mt-1">
            {formatCurrency(totalInventoryValue)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-2xs">
          <span className="text-xs text-slate-500 block">Ítems Registrados</span>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{inventoryItems.length} SKUs</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-2xs">
          <span className="text-xs text-slate-500 block">Alertas de Stock</span>
          <p className="text-xl font-extrabold text-amber-600 mt-1">
            {inventoryItems.filter((i) => i.status !== "DISPONIBLE").length} requieren atención
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-rose-100 pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("STOCK")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "STOCK"
                ? "bg-rose-600 text-white shadow-2xs"
                : "bg-white text-slate-600 border hover:bg-rose-50"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Existencias por SKU</span>
          </button>
          <button
            onClick={() => setActiveTab("HISTORY")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "HISTORY"
                ? "bg-rose-600 text-white shadow-2xs"
                : "bg-white text-slate-600 border hover:bg-rose-50"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Historial de Movimientos</span>
          </button>
        </div>

        {activeTab === "STOCK" && (
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar SKU o nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>
        )}
      </div>

      {/* TAB 1: STOCK VIEW */}
      {activeTab === "STOCK" && (
        <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-rose-50/50 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-xl">Producto / Variante</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Estado</th>
                  <th className="py-2.5 px-3 text-center">Stock / Mín</th>
                  <th className="py-2.5 px-3 text-right">Costo</th>
                  <th className="py-2.5 px-3 text-right">Precio</th>
                  <th className="py-2.5 px-3 text-right">Valor Total</th>
                  <th className="py-2.5 px-3 rounded-r-xl text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-50">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-rose-50/30 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-800">{item.name}</p>
                      {item.variantDetails && (
                        <span className="text-[10px] text-rose-600 font-medium">
                          {item.variantDetails}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500">{item.sku}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === "AGOTADO"
                            ? "bg-red-100 text-red-700"
                            : item.status === "STOCK_BAJO"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {item.status === "AGOTADO"
                          ? "🔴 AGOTADO"
                          : item.status === "STOCK_BAJO"
                          ? "🟡 STOCK BAJO"
                          : "🟢 DISPONIBLE"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-extrabold text-slate-900 text-sm">{item.stock}</span>
                      <span className="text-slate-400 text-[10px] block">Mín: {item.minStock}</span>
                    </td>
                    <td className="py-3 px-3 text-right">{formatCurrency(item.cost)}</td>
                    <td className="py-3 px-3 text-right font-bold text-rose-700">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-800">
                      {formatCurrency(item.totalValue)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() =>
                          setAdjustModalItem({
                            productId: item.productId,
                            variantId: item.variantId,
                            name: `${item.name} ${item.variantDetails || ""}`,
                            sku: item.sku,
                            currentStock: item.stock,
                          })
                        }
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1 rounded-xl text-[10px] font-bold border border-rose-200 transition-colors"
                      >
                        ⚡ Ajustar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: HISTORY MOVEMENTS VIEW */}
      {activeTab === "HISTORY" && (
        <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-xs">
          <h3 className="font-bold text-rose-950 text-base mb-3">📋 Historial de Movimientos</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-rose-50/50 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-xl">Fecha/Hora</th>
                  <th className="py-2.5 px-3">Producto / Variante</th>
                  <th className="py-2.5 px-3">Tipo</th>
                  <th className="py-2.5 px-3 text-center">Cantidad</th>
                  <th className="py-2.5 px-3">Motivo</th>
                  <th className="py-2.5 px-3 rounded-r-xl">Usuario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-50">
                {movements.map((m: any) => (
                  <tr key={m.id} className="hover:bg-rose-50/30 transition-colors">
                    <td className="py-3 px-3 font-mono">{formatDate(m.createdAt)}</td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-800">{m.product?.name}</p>
                      {m.variant && (
                        <span className="text-[10px] text-rose-600">
                          Talla {m.variant.size} / Color {m.variant.color}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-bold">
                      <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-full text-[10px]">
                        {m.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-sm">{m.quantity}</td>
                    <td className="py-3 px-3 text-slate-700">{m.reason || "-"}</td>
                    <td className="py-3 px-3 font-medium text-slate-500">{m.user?.name || "Sistema"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADJUSTMENT MODAL */}
      {adjustModalItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-rose-100">
            <h3 className="font-extrabold text-lg text-rose-950 mb-1">⚡ Ajustar Stock</h3>
            <p className="text-xs text-slate-500 mb-3">{adjustModalItem.name}</p>
            <span className="text-xs bg-rose-50 text-rose-800 font-bold px-2.5 py-1 rounded-lg inline-block mb-4">
              Stock Actual: {adjustModalItem.currentStock} unidades
            </span>

            {errorMsg && (
              <div className="bg-red-50 text-red-700 text-xs p-2.5 rounded-xl border border-red-200 mb-3">
                {errorMsg}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tipo de Ajuste</label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="ENTRADA">📦 + Entrada (Compra a proveedor / Reposición)</option>
                  <option value="AJUSTE_POSITIVO">➕ + Ajuste Positivo (Conteo físico)</option>
                  <option value="AJUSTE_NEGATIVO">➖ - Ajuste Negativo (Perdida / Conteo)</option>
                  <option value="PRODUCTO_DANADO">💔 - Producto Dañado / Mermado</option>
                  <option value="DEVOLUCION">🔄 + Devolución de Cliente</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Cantidad</label>
                <input
                  type="number"
                  min="1"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-rose-950 text-base"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Motivo (Obligatorio)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Recepción de pedido #405 / Daño en empaque..."
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-5">
              <button
                type="button"
                onClick={() => setAdjustModalItem(null)}
                className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmAdjustment}
                disabled={isPending}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md"
              >
                {isPending ? "Guardando..." : "Aplicar Ajuste"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
