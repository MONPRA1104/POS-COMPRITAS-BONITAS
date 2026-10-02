"use client";

import { useState, useTransition } from "react";
import { createExpense } from "@/lib/actions/expenses";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { ReceiptText, Plus, Banknote, CreditCard, X } from "lucide-react";

export function ExpensesModule({ initialExpenses }: { initialExpenses: any[] }) {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);

  // Form
  const [concept, setConcept] = useState("");
  const [category, setCategory] = useState<
    "MERCANCIA" | "ENVIOS" | "PUBLICIDAD" | "EMPAQUES" | "TRANSPORTE" | "SERVICIOS" | "OTROS"
  >("EMPAQUES");
  const [amount, setAmount] = useState(150);
  const [paymentMethod, setPaymentMethod] = useState<"EFECTIVO" | "TARJETA" | "TRANSFERENCIA">("EFECTIVO");
  const [note, setNote] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const totalExpenseSum = expenses.reduce((acc, e) => acc + e.amount, 0);

  const handleCreateSubmit = () => {
    if (!concept) return;
    setErrorMsg(null);

    startTransition(async () => {
      const res = await createExpense({
        concept,
        category,
        amount: Number(amount),
        paymentMethod,
        note,
      });

      if (res.success) {
        setShowModal(false);
        window.location.reload();
      } else {
        setErrorMsg(res.error || "Error al guardar el gasto.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-3xl border border-rose-100 shadow-2xs">
        <div>
          <span className="text-xs text-slate-500 block">Total de Gastos Registrados</span>
          <span className="font-extrabold text-red-700 text-xl">
            {formatCurrency(totalExpenseSum)}
          </span>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-2.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>REGISTRAR GASTO</span>
        </button>
      </div>

      {/* Expenses Table */}
      <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-rose-50/50 text-slate-700 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3 rounded-l-xl">Fecha</th>
                <th className="py-2.5 px-3">Concepto</th>
                <th className="py-2.5 px-3">Categoría</th>
                <th className="py-2.5 px-3">Pago</th>
                <th className="py-2.5 px-3 rounded-r-xl text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-rose-50/30 transition-colors">
                  <td className="py-3 px-3 font-mono">{formatDateShort(exp.date)}</td>
                  <td className="py-3 px-3 font-bold text-slate-800">{exp.concept}</td>
                  <td className="py-3 px-3">
                    <span className="bg-slate-100 text-slate-800 font-bold text-[10px] px-2 py-0.5 rounded-full">
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-500">{exp.paymentMethod}</td>
                  <td className="py-3 px-3 text-right font-extrabold text-red-600 text-sm">
                    -{formatCurrency(exp.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW EXPENSE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-rose-100">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-extrabold text-lg text-rose-950">💸 Registrar Gasto</h3>
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
                <label className="font-bold text-slate-700 block mb-1">Concepto del Gasto</label>
                <input
                  type="text"
                  placeholder="Ej. Cajas de empaque satinadas..."
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Categoría</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="MERCANCIA">Mercancía</option>
                    <option value="ENVIOS">Envíos</option>
                    <option value="PUBLICIDAD">Publicidad</option>
                    <option value="EMPAQUES">Empaques</option>
                    <option value="TRANSPORTE">Transporte</option>
                    <option value="SERVICIOS">Servicios</option>
                    <option value="OTROS">Otros</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Monto ($ MXN)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-red-600 text-base"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Método de Pago</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="EFECTIVO">Efectivo (Afecta Caja Abierta)</option>
                  <option value="TARJETA">Tarjeta</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                </select>
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
                {isPending ? "Guardando..." : "Guardar Gasto"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
