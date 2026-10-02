"use client";

import { formatCurrency } from "@/lib/utils";
import { TrendingUp, DollarSign, PieChart, Users, ShoppingBag, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { SalesChart } from "@/components/dashboard/sales-chart";

export function ReportsModule({ metrics }: { metrics: any }) {
  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-2xs">
          <span className="text-xs text-slate-500 font-bold block mb-1">Ventas Totales (Mes)</span>
          <p className="text-2xl font-extrabold text-rose-950">
            {formatCurrency(metrics.salesMonthTotal)}
          </p>
          <span className="text-[10px] text-slate-400">
            {metrics.totalSalesCount} transacciones registradas
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-2xs">
          <span className="text-xs text-slate-500 font-bold block mb-1">Utilidad Bruta</span>
          <p className="text-2xl font-extrabold text-blue-700">
            {formatCurrency(metrics.grossProfit)}
          </p>
          <span className="text-[10px] text-slate-400">
            Ventas - Costo Histórico de Productos
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-2xs">
          <span className="text-xs text-slate-500 font-bold block mb-1">Gastos Operativos</span>
          <p className="text-2xl font-extrabold text-red-600">
            -{formatCurrency(metrics.totalExpenses)}
          </p>
          <span className="text-[10px] text-slate-400">
            Mercancía, empaques y envíos
          </span>
        </div>

        <div className="bg-gradient-to-tr from-emerald-500 to-teal-600 p-5 rounded-3xl text-white shadow-md">
          <span className="text-xs font-bold block mb-1 text-emerald-100">
            Utilidad Estimada Neta
          </span>
          <p className="text-2xl font-extrabold">
            {formatCurrency(metrics.estimatedProfit)}
          </p>
          <span className="text-[10px] text-emerald-100">
            Utilidad Bruta - Gastos Operativos
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-xs">
        <h2 className="font-bold text-rose-950 text-base mb-4">
          📈 Evolución Diaria de Ventas (Últimos 7 días)
        </h2>
        <SalesChart data={metrics.last7DaysChartData} />
      </div>

      {/* Top Selling & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-xs">
          <h3 className="font-bold text-rose-950 text-base mb-3">🔥 Productos con Mayor Rotación</h3>
          <div className="space-y-2">
            {metrics.topSellingProducts.map((item: any, idx: number) => (
              <div
                key={item.sku}
                className="p-3 rounded-2xl bg-rose-50/40 border border-rose-100 flex justify-between items-center text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-bold text-xs flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <div>
                    <p className="font-bold text-slate-800">{item.name}</p>
                    <span className="text-[10px] text-slate-400 font-mono">{item.sku}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-rose-700 block">{item.qty} unidades</span>
                  <span className="text-[10px] text-slate-500">{formatCurrency(item.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-xs">
          <h3 className="font-bold text-rose-950 text-base mb-3">⚠️ Alertas de Inventario Crítico</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {metrics.lowStockItems.map((item: any) => (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border flex justify-between items-center text-xs ${
                  item.status === "AGOTADO"
                    ? "bg-red-50 border-red-200 text-red-900"
                    : "bg-amber-50 border-amber-200 text-amber-900"
                }`}
              >
                <div>
                  <p className="font-bold">{item.name}</p>
                  <span className="text-[10px] font-mono">{item.sku}</span>
                </div>
                <div className="text-right font-bold">
                  <span>{item.status === "AGOTADO" ? "🔴 AGOTADO" : `⚠️ Stock: ${item.stock}`}</span>
                  <span className="text-[10px] block text-slate-500">Mín: {item.minStock}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
