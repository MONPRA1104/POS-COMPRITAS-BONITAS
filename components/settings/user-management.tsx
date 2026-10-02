"use client";

import { useState } from "react";
import { UserCheck, KeyRound, PlusCircle, AlertTriangle, ShieldCheck, Settings2, Check, X } from "lucide-react";
import { createUser, updateUserPassword, updateUserPermissions } from "@/lib/actions/users";

export function UserManagement({ users }: { users: any[] }) {
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingPasswordId, setEditingPasswordId] = useState<string | null>(null);
  const [editingPermissionsId, setEditingPermissionsId] = useState<string | null>(null);
  
  const [isPending, setIsPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // ... (existing handlers)

  async function handleAddUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const formData = new FormData(e.currentTarget);
    const result = await createUser(formData);

    if (result.error) {
      setErrorMsg(result.error);
    } else {
      setSuccessMsg("Usuario creado exitosamente.");
      setShowAddUser(false);
    }
    setIsPending(false);
  }

  async function handleUpdatePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateUserPassword(formData);

    if (result.error) {
      setErrorMsg(result.error);
    } else {
      setSuccessMsg("Contraseña actualizada exitosamente.");
      setEditingPasswordId(null);
    }
    setIsPending(false);
  }

  async function handleTogglePermission(userId: string, currentPermissions: any, field: string) {
    if (isPending) return;
    setIsPending(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const newPermissions = { ...currentPermissions, [field]: !currentPermissions[field] };
    const result = await updateUserPermissions(userId, newPermissions);

    if (result.error) {
      setErrorMsg(result.error);
    } else {
      setSuccessMsg("Permiso actualizado correctamente.");
    }
    setIsPending(false);
  }

  return (
    <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-xs space-y-4 lg:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-rose-600" />
          <h2 className="font-bold text-rose-950 text-base">Usuarios & Accesos</h2>
        </div>
        <button
          onClick={() => setShowAddUser(!showAddUser)}
          className="whitespace-nowrap shrink-0 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg flex items-center gap-1"
        >
          <PlusCircle className="w-4 h-4 shrink-0" /> Nuevo Empleado
        </button>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {errorMsg}
        </div>
      )}
      
      {successMsg && (
        <div className="bg-emerald-50 text-emerald-700 text-xs p-3 rounded-xl border border-emerald-200 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0" /> {successMsg}
        </div>
      )}

      {showAddUser && (
        <form onSubmit={handleAddUser} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
          <h3 className="text-xs font-bold text-slate-800">Agregar Nuevo Usuario</h3>
          <input name="name" required placeholder="Nombre completo" className="w-full text-xs p-2.5 rounded-lg border focus:ring-2 focus:ring-rose-400" />
          <input name="email" type="email" required placeholder="Correo electrónico" className="w-full text-xs p-2.5 rounded-lg border focus:ring-2 focus:ring-rose-400" />
          <input name="password" type="password" required placeholder="Contraseña temporal" className="w-full text-xs p-2.5 rounded-lg border focus:ring-2 focus:ring-rose-400" />
          <select name="role" className="w-full text-xs p-2.5 rounded-lg border font-bold">
            <option value="VENDEDOR">Vendedor (Solo caja y ventas)</option>
            <option value="ADMIN">Administrador (Acceso total)</option>
          </select>
          <div className="flex gap-2">
            <button type="submit" disabled={isPending} className="flex-1 bg-rose-600 text-white font-bold py-2 rounded-lg text-xs hover:bg-rose-700">Guardar</button>
            <button type="button" onClick={() => setShowAddUser(false)} className="flex-1 bg-slate-200 text-slate-700 font-bold py-2 rounded-lg text-xs">Cancelar</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 items-start">
        {users.map((u) => (
          <div key={u.id} className="p-3 rounded-2xl bg-rose-50/40 border border-rose-100 flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-slate-800">{u.name}</p>
                <p className="text-[10px] text-slate-400 font-mono">{u.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${u.role === "ADMIN" ? "bg-purple-100 text-purple-900" : "bg-emerald-100 text-emerald-900"}`}>
                  {u.role}
                </span>
                
                <button
                  onClick={() => {
                    setEditingPermissionsId(editingPermissionsId === u.id ? null : u.id);
                    setEditingPasswordId(null);
                  }}
                  className="p-1.5 rounded-lg bg-white border shadow-sm text-slate-500 hover:text-rose-600 transition-colors"
                  title="Configurar Permisos"
                >
                  <Settings2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    setEditingPasswordId(editingPasswordId === u.id ? null : u.id);
                    setEditingPermissionsId(null);
                  }}
                  className="p-1.5 rounded-lg bg-white border shadow-sm text-slate-500 hover:text-rose-600 transition-colors"
                  title="Cambiar contraseña"
                >
                  <KeyRound className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Change Password Inline Form */}
            {editingPasswordId === u.id && (
              <form onSubmit={handleUpdatePassword} className="flex items-center gap-2 border-t border-rose-100 pt-3">
                <input type="hidden" name="userId" value={u.id} />
                <input name="newPassword" type="password" required placeholder="Nueva contraseña..." className="flex-1 text-xs p-2 rounded-lg border focus:ring-2 focus:ring-rose-400" />
                <button type="submit" disabled={isPending} className="bg-slate-800 text-white text-[10px] font-bold px-3 py-2 rounded-lg hover:bg-slate-900">
                  Actualizar
                </button>
              </form>
            )}

            {/* Permissions Panel */}
            {editingPermissionsId === u.id && (
              <div className="border-t border-rose-100 pt-3 mt-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { key: "canAccessPOS", label: "Caja & Ventas" },
                  { key: "canAccessInventory", label: "Inventario & Productos" },
                  { key: "canAccessCustomers", label: "Clientes" },
                  { key: "canAccessExpenses", label: "Gastos" },
                  { key: "canAccessReports", label: "Reportes" },
                  { key: "canAccessSettings", label: "Configuración" },
                ].map((perm) => (
                  <button
                    key={perm.key}
                    disabled={isPending}
                    onClick={() => handleTogglePermission(u.id, u, perm.key)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-[10px] font-bold border transition-colors ${
                      u[perm.key] 
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                        : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    <span>{perm.label}</span>
                    {u[perm.key] ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                  </button>
                ))}
              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  );
}
