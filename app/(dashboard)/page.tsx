import Link from "next/link";
import { getDashboardMetrics } from "@/lib/actions/reports";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  XCircle,
  Receipt,
  PlusCircle,
  Wallet,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { QuickSaleButton } from "@/components/dashboard/quick-sale-button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();

  if (!metrics) {
    return (
      <div className="p-8 text-center text-slate-500">
        Cargando datos del sistema...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md inline-block mb-2">
              ✨ Compritas Bonitas Boutique
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Bienvenida al Panel de Control
            </h1>
            <p className="text-rose-100 text-xs md:text-sm mt-1">
              Resumen en tiempo real de tu tienda, inventario y caja.
            </p>
          </div>

          <div className="flex gap-2">
            <QuickSaleButton />
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* METRIC CARDS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Ventas Hoy */}
        <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Ventas de Hoy</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-rose-950">
            {formatCurrency(metrics.salesTodayTotal)}
          </p>
          <span className="text-[10px] text-slate-400 font-medium">
            {metrics.todaySalesCount} ventas registradas hoy
          </span>
        </div>

        {/* Ventas del Mes */}
        <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Ventas del Mes</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-rose-950">
            {formatCurrency(metrics.salesMonthTotal)}
          </p>
          <span className="text-[10px] text-slate-400 font-medium">
            {metrics.totalSalesCount} transacciones este mes
          </span>
        </div>

        {/* Ganancia Estimada */}
        <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Ganancia Estimada</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-emerald-700">
            {formatCurrency(metrics.estimatedProfit)}
          </p>
          <span className="text-[10px] text-slate-400 font-medium">
            Utilidad Bruta - Gastos
          </span>
        </div>

        {/* Ticket Promedio */}
        <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Ticket Promedio</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-rose-950">
            {formatCurrency(metrics.averageTicket)}
          </p>
          <span className="text-[10px] text-slate-400 font-medium">
            {metrics.totalProductsSold} prendas vendidas
          </span>
        </div>

        {/* Stock Bajo Alert */}
        <Link
          href="/inventario"
          className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200 shadow-2xs hover:bg-amber-50 transition-colors"
        >
          <div className="flex items-center justify-between text-amber-800 text-xs mb-2 font-bold">
            <span>Stock Bajo</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-extrabold text-amber-900">
            {metrics.lowStockCount} ítems
          </p>
          <span className="text-[10px] text-amber-700 font-medium">
            ⚠️ Requieren reabastecimiento
          </span>
        </Link>

        {/* Agotados Alert */}
        <Link
          href="/inventario"
          className="bg-red-50/50 p-4 rounded-2xl border border-red-200 shadow-2xs hover:bg-red-50 transition-colors"
        >
          <div className="flex items-center justify-between text-red-800 text-xs mb-2 font-bold">
            <span>Agotados</span>
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-xl font-extrabold text-red-900">
            {metrics.outOfStockCount} productos
          </p>
          <span className="text-[10px] text-red-700 font-medium">
            ❌ Sin existencias actualmente
          </span>
        </Link>

        {/* Pedidos Pendientes */}
        <Link
          href="/pedidos"
          className="bg-purple-50/50 p-4 rounded-2xl border border-purple-200 shadow-2xs hover:bg-purple-50 transition-colors"
        >
          <div className="flex items-center justify-between text-purple-800 text-xs mb-2 font-bold">
            <span>Pedidos Pendientes</span>
            <Receipt className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-xl font-extrabold text-purple-900">
            {metrics.pendingOrdersCount} pedidos
          </p>
          <span className="text-[10px] text-purple-700 font-medium">
            📱 Pedidos por WhatsApp
          </span>
        </Link>

        {/* Estado de Caja */}
        <Link
          href="/caja"
          className={`p-4 rounded-2xl border shadow-2xs transition-colors ${
            metrics.openRegister
              ? "bg-emerald-50/60 border-emerald-200 hover:bg-emerald-50"
              : "bg-rose-50/60 border-rose-200 hover:bg-rose-50"
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-2 font-bold">
            <span className={metrics.openRegister ? "text-emerald-800" : "text-rose-800"}>
              Estado de Caja
            </span>
            <Wallet className={`w-4 h-4 ${metrics.openRegister ? "text-emerald-600" : "text-rose-600"}`} />
          </div>
          <p className={`text-base font-extrabold ${metrics.openRegister ? "text-emerald-900" : "text-rose-900"}`}>
            {metrics.openRegister
              ? `Abierta: ${formatCurrency(metrics.openRegister.expectedCash)}`
              : "Caja Cerrada"}
          </p>
          <span className="text-[10px] text-slate-500 font-medium">
            {metrics.openRegister ? "🟢 Arqueo activo" : "🔴 Abrir para cobros en efectivo"}
          </span>
        </Link>
      </div>

      {/* SALES CHART & TOP SELLING PRODUCTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7 Days Sales Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-rose-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-rose-950 text-base">📈 Ventas de los últimos 7 días</h2>
              <p className="text-xs text-slate-500">Ingresos diarios acumulados</p>
            </div>
          </div>
          <SalesChart data={metrics.last7DaysChartData} />
        </div>

        {/* Top Selling Products */}
        <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-rose-950 text-base mb-3">🔥 Productos más vendidos</h2>
            <div className="space-y-3">
              {metrics.topSellingProducts.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No hay datos suficientes aún.</p>
              ) : (
                metrics.topSellingProducts.map((p, idx) => (
                  <div
                    key={p.sku}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50/40 border border-rose-100/60 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-rose-200 text-rose-800 font-bold text-[10px] flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-800 leading-tight">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{p.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-rose-700 block">{p.qty} unids.</span>
                      <span className="text-[10px] text-slate-500">{formatCurrency(p.total)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            href="/reportes"
            className="mt-4 text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center justify-center gap-1 py-2 bg-rose-50 rounded-xl"
          >
            <span>Ver Reporte Completo</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* RECENT SALES TABLE */}
      <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-rose-950 text-base">🧾 Últimas Ventas Registradas</h2>
            <p className="text-xs text-slate-500">Historial reciente de transacciones</p>
          </div>
          <Link
            href="/ventas"
            className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
          >
            <span>Ver todas las ventas</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-rose-50/50 text-slate-700 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3 rounded-l-xl">Folio</th>
                <th className="py-2.5 px-3">Fecha</th>
                <th className="py-2.5 px-3">Cliente</th>
                <th className="py-2.5 px-3">Pago</th>
                <th className="py-2.5 px-3">Total</th>
                <th className="py-2.5 px-3 rounded-r-xl">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50">
              {metrics.recentSales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    Aún no hay ventas registradas.
                  </td>
                </tr>
              ) : (
                metrics.recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-rose-50/30 transition-colors">
                    <td className="py-3 px-3 font-bold text-rose-950 font-mono">
                      {sale.saleNumber}
                    </td>
                    <td className="py-3 px-3">{formatDateShort(sale.createdAt)}</td>
                    <td className="py-3 px-3 font-medium text-slate-800">
                      {sale.customer?.name || "CLIENTE MOSTRADOR"}
                    </td>
                    <td className="py-3 px-3">
                      <span className="bg-slate-100 text-slate-700 font-bold text-[10px] px-2 py-0.5 rounded-full">
                        {sale.payments[0]?.paymentMethod || "Efectivo"}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-rose-700">
                      {formatCurrency(sale.total)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          sale.status === "CANCELLED"
                            ? "bg-red-100 text-red-700"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {sale.status === "CANCELLED" ? "CANCELADA" : "COMPLETADA"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
