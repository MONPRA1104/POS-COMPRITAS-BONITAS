import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Settings, ShieldCheck, History, Store, UserCheck } from "lucide-react";
import { UserManagement } from "@/components/settings/user-management";

export const dynamic = "force-dynamic";

export default async function ConfiguracionPage() {
  const settings = await db.businessSettings.findFirst();
  const users = await db.user.findMany();
  const auditLogs = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-rose-950">⚙️ Configuración & Auditoría del Sistema</h1>
        <p className="text-xs text-slate-500">Ajustes del negocio, usuarios y registro inmutable de auditoría</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Business Settings */}
        <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-rose-600" />
            <h2 className="font-bold text-rose-950 text-base">Datos del Negocio</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="font-bold text-slate-700 block mb-1">Nombre Comercial</span>
              <p className="p-2.5 bg-rose-50/50 rounded-xl font-extrabold text-rose-950">
                {settings?.storeName || "Compritas Bonitas"}
              </p>
            </div>
            <div>
              <span className="font-bold text-slate-700 block mb-1">Moneda y Región</span>
              <p className="p-2.5 bg-slate-50 rounded-xl font-bold text-slate-800">
                MXN ($) - México (America/Mexico_City)
              </p>
            </div>
            <div>
              <span className="font-bold text-slate-700 block mb-1">Encabezado de Ticket</span>
              <p className="p-2.5 bg-slate-50 rounded-xl text-slate-600">
                {settings?.ticketHeader}
              </p>
            </div>
          </div>
        </div>

        {/* Users & Roles (Interactive Module) */}
        <UserManagement users={users} />

        {/* Audit Log Table */}
        <div className="lg:col-span-3 bg-white p-5 rounded-3xl border border-rose-100 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-rose-950 text-base">Registro de Auditoría (Audit Logs)</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-rose-50/50 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-xl">Fecha/Hora</th>
                  <th className="py-2.5 px-3">Usuario</th>
                  <th className="py-2.5 px-3">Acción</th>
                  <th className="py-2.5 px-3">Entidad</th>
                  <th className="py-2.5 px-3 rounded-r-xl">Referencia / Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-50">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-rose-50/30 transition-colors">
                    <td className="py-2.5 px-3 font-mono">{formatDate(log.createdAt)}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{log.user?.name}</td>
                    <td className="py-2.5 px-3">
                      <span className="bg-slate-100 font-bold text-[10px] px-2 py-0.5 rounded-full text-slate-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{log.entity}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700">
                      {log.reference || log.newValues || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
