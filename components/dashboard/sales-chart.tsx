"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

export function SalesChart({ data }: { data: { date: string; ventas: number }[] }) {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#D85C77" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#D85C77" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FDE8ED" />
          <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
          <YAxis
            stroke="#94A3B8"
            fontSize={11}
            tickLine={false}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip
            formatter={(value: any) => [formatCurrency(value), "Ventas"]}
            contentStyle={{
              backgroundColor: "#FFFFFF",
              borderColor: "#FDE8ED",
              borderRadius: "12px",
              fontSize: "12px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
            }}
          />
          <Area
            type="monotone"
            dataKey="ventas"
            stroke="#D85C77"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorVentas)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
