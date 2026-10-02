"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createCustomer } from "@/lib/actions/customers";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { Users, UserPlus, Search, Phone, MapPin, ShoppingBag, ArrowUpRight, X } from "lucide-react";

export function CustomersModule({ initialCustomers }: { initialCustomers: any[] }) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("Ciudad de México");
  const [postalCode, setPostalCode] = useState("");
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search)) ||
      (c.whatsapp && c.whatsapp.includes(search))
  );

  const handleCreateSubmit = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await createCustomer({
        name,
        phone,
        whatsapp,
        email,
        address,
        neighborhood,
        city,
        postalCode,
        notes,
      });

      if (res.success) {
        setShowModal(false);
        window.location.reload();
      } else {
        setErrorMsg(res.error || "Error al crear cliente.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-3xl border border-rose-100 shadow-2xs">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-2.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md"
        >
          <UserPlus className="w-4 h-4" />
          <span>NUEVO CLIENTE</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((c) => {
          const avgTicket =
            c.totalPurchasesCount > 0 ? c.totalSpent / c.totalPurchasesCount : 0;

          return (
            <div
              key={c.id}
              className={`bg-white p-5 rounded-3xl border shadow-2xs flex flex-col justify-between transition-all hover:shadow-md ${
                c.isGeneral ? "border-amber-200 bg-amber-50/30" : "border-rose-100"
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-extrabold text-slate-900 text-sm">{c.name}</h3>
                  {c.isGeneral ? (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Mostrador
                    </span>
                  ) : (
                    <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Registrada
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-xs text-slate-500 mb-4">
                  {c.phone && (
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-rose-400" />
                      <span>{c.phone}</span>
                    </p>
                  )}
                  {c.address && (
                    <p className="flex items-center gap-1.5 text-[11px] line-clamp-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>
                        {c.address}, {c.neighborhood}
                      </span>
                    </p>
                  )}
                </div>

                {/* Purchase stats */}
                <div className="grid grid-cols-3 gap-2 p-2.5 bg-rose-50/50 rounded-2xl border border-rose-100 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Compras</span>
                    <span className="font-extrabold text-slate-900">
                      {c.totalPurchasesCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total</span>
                    <span className="font-extrabold text-rose-700">
                      {formatCurrency(c.totalSpent)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Promedio</span>
                    <span className="font-bold text-slate-700">
                      {formatCurrency(avgTicket)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-rose-50 flex justify-between items-center text-xs">
                <span className="text-[10px] text-slate-400">
                  Última compra: {formatDateShort(c.lastPurchaseAt)}
                </span>
                <Link
                  href={`/clientes/${c.id}`}
                  className="font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  <span>Historial</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* NEW CUSTOMER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-rose-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-extrabold text-lg text-rose-950">👤 Registrar Nuevo Cliente</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="bg-red-50 text-red-700 text-xs p-2.5 rounded-xl border border-red-200 mb-3">
                {errorMsg}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre Completo</label>
                <input
                  type="text"
                  placeholder="Ej. Mariana López..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Teléfono</label>
                  <input
                    type="text"
                    placeholder="5512345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">WhatsApp</label>
                  <input
                    type="text"
                    placeholder="5512345678"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Dirección de Envío</label>
                <input
                  type="text"
                  placeholder="Calle y Número..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Colonia</label>
                  <input
                    type="text"
                    placeholder="Colonia..."
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Código Postal</label>
                  <input
                    type="text"
                    placeholder="CP 03100"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-5">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateSubmit}
                disabled={isPending}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md"
              >
                {isPending ? "Guardando..." : "Guardar Cliente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
