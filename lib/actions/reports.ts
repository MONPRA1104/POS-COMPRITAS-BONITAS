"use server";

import { db } from "@/lib/db";

export async function getDashboardMetrics() {
  try {
    const now = new Date();
    
    // Start of today
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // Start of month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 1. Sales Today
    const todaySales = await db.sale.findMany({
      where: {
        status: "COMPLETED",
        createdAt: { gte: startOfToday, lte: endOfToday },
      },
      include: { items: true },
    });

    const salesTodayTotal = todaySales.reduce((acc, s) => acc + s.total, 0);

    // 2. Sales Month
    const monthSales = await db.sale.findMany({
      where: {
        status: "COMPLETED",
        createdAt: { gte: startOfMonth },
      },
      include: { items: true },
    });

    const salesMonthTotal = monthSales.reduce((acc, s) => acc + s.total, 0);
    const totalSalesCount = monthSales.length;

    // 3. Average Ticket (Month)
    const averageTicket = totalSalesCount > 0 ? salesMonthTotal / totalSalesCount : 0;

    // 4. Products Sold (Month)
    const totalProductsSold = monthSales.reduce((acc, s) => {
      return acc + s.items.reduce((sum, item) => sum + item.quantity, 0);
    }, 0);

    // 5. Historical Gross Profit (Month)
    const totalHistoricalCost = monthSales.reduce((acc, s) => acc + s.historicalCostSum, 0);
    const grossProfit = salesMonthTotal - totalHistoricalCost;

    // 6. Expenses (Month)
    const monthExpenses = await db.expense.findMany({
      where: { date: { gte: startOfMonth } },
    });
    const totalExpenses = monthExpenses.reduce((acc, e) => acc + e.amount, 0);

    // 7. Estimated Profit (Utilidad Estimada) = Gross Profit - Expenses
    const estimatedProfit = grossProfit - totalExpenses;

    // 8. Low Stock & Out of Stock Alerts
    const allProducts = await db.product.findMany({
      where: { active: true },
      include: { variants: { where: { active: true } } },
    });

    let lowStockCount = 0;
    let outOfStockCount = 0;
    const lowStockItems: any[] = [];

    for (const p of allProducts) {
      if (p.hasVariants && p.variants.length > 0) {
        for (const v of p.variants) {
          if (v.stock === 0) {
            outOfStockCount++;
            lowStockItems.push({
              id: v.id,
              name: `${p.name} (${v.size || ""} ${v.color || ""})`,
              sku: v.sku,
              stock: v.stock,
              minStock: v.minStock,
              status: "AGOTADO",
            });
          } else if (v.stock <= v.minStock) {
            lowStockCount++;
            lowStockItems.push({
              id: v.id,
              name: `${p.name} (${v.size || ""} ${v.color || ""})`,
              sku: v.sku,
              stock: v.stock,
              minStock: v.minStock,
              status: "STOCK_BAJO",
            });
          }
        }
      } else {
        if (p.stock === 0) {
          outOfStockCount++;
          lowStockItems.push({
            id: p.id,
            name: p.name,
            sku: p.sku,
            stock: p.stock,
            minStock: p.minStock,
            status: "AGOTADO",
          });
        } else if (p.stock <= p.minStock) {
          lowStockCount++;
          lowStockItems.push({
            id: p.id,
            name: p.name,
            sku: p.sku,
            stock: p.stock,
            minStock: p.minStock,
            status: "STOCK_BAJO",
          });
        }
      }
    }

    // 9. Pending Orders (WA)
    const pendingOrdersCount = await db.order.count({
      where: {
        status: { in: ["NUEVO", "CONFIRMADO", "PREPARANDO", "LISTO_PARA_RECOGER"] },
      },
    });

    // 10. Last 7 Days Sales Chart Data
    const last7DaysChartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

      const daySales = await db.sale.findMany({
        where: {
          status: "COMPLETED",
          createdAt: { gte: dayStart, lte: dayEnd },
        },
      });

      const dayTotal = daySales.reduce((acc, s) => acc + s.total, 0);

      const dayName = d.toLocaleDateString("es-MX", { weekday: "short", day: "numeric" });
      last7DaysChartData.push({
        date: dayName,
        ventas: dayTotal,
      });
    }

    // 11. Top Selling Products
    const recentSaleItems = await db.saleItem.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
    });

    const productSalesMap: Record<string, { name: string; sku: string; qty: number; total: number }> = {};
    for (const item of recentSaleItems) {
      if (!productSalesMap[item.productName]) {
        productSalesMap[item.productName] = {
          name: item.productName,
          sku: item.sku,
          qty: 0,
          total: 0,
        };
      }
      productSalesMap[item.productName].qty += item.quantity;
      productSalesMap[item.productName].total += item.subtotal;
    }

    const topSellingProducts = Object.values(productSalesMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    // 12. Recent Sales
    const recentSales = await db.sale.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { customer: true, payments: true },
    });

    // 13. Active Cash Register status
    const openRegister = await db.cashRegister.findFirst({
      where: { status: "OPEN" },
      include: { openedByUser: true },
    });

    return {
      salesTodayTotal,
      todaySalesCount: todaySales.length,
      salesMonthTotal,
      totalSalesCount,
      averageTicket,
      totalProductsSold,
      grossProfit,
      totalExpenses,
      estimatedProfit,
      lowStockCount,
      outOfStockCount,
      lowStockItems,
      pendingOrdersCount,
      last7DaysChartData,
      topSellingProducts,
      recentSales,
      openRegister,
    };
  } catch (err) {
    console.error("Error fetching dashboard metrics:", err);
    return null;
  }
}
