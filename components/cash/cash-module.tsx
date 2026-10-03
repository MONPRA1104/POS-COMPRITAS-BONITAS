"use client";

import { useState, useTransition } from "react";
import {
  openCashRegister,
  closeCashRegister,
  addCashMovement,
} from "@/lib/actions/cash";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Lock,
  Unlock,
  AlertTriangle,
  PlusCircle,
  Banknote,
  ReceiptText,
  CheckCircle2,
} from "lucide-react";

export function CashModule({ initialCashRegister }: { initialCashRegister: any | null }) {
  const [cashRegister, setCashRegister] = useState(initialCashRegister);
  const [isPending, startTransition] = useTransition();

  // Modals state
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);

  // Forms state
  const [initialFund, setInitialFund] = useState<number | "">(0);
  const [openNotes, setOpenNotes] = useState("");

  const [countedCash, setCountedCash] = useState<number | "">(0);
  const [closeNotes, setCloseNotes] = useState("");

  const [movementType, setMovementType] = useState<"GASTO" | "RETIRO" | "INGRESO_MANUAL">("INGRESO_MANUAL");
  const [movementAmount, setMovementAmount] = useState<number | "">(0);
  const [movementNote, setMovementNote] = useState("");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleOpenCash = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await openCashRegister(Number(initialFund), openNotes);
      if (res.success && res.data) {
        setCashRegister(res.data);
        setShowOpenModal(false);
      } else {
        setErrorMsg(res.error || "Error al abrir la caja.");
      }
    });
  };

  const handleCloseCash = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await closeCashRegister(Number(countedCash), closeNotes);
      if (res.success && res.data) {
        setCashRegister(null);
        setShowCloseModal(false);
      } else {
        setErrorMsg(res.error || "Error al cerrar la caja.");
      }
    });
  };

  const handleAddMovement = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await addCashMovement({
        type: movementType,
        amount: Number(movementAmount),
        paymentMethod: "EFECTIVO",
        note: movementNote,
      });
      if (res.success) {
        window.location.reload();
      } else {
        setErrorMsg(res.error || "Error al registrar movimiento.");
      }
    });
  };

  const expectedCash = cashRegister ? cashRegister.expectedCash : 0;
  const computedDifference = Number(countedCash) - expectedCash;

  return (
    <div className="space-y-6">
      {/* Banner status */}
      <div
        className={`p-6 rounded-3xl border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          cashRegister
            ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200"
            : "bg-gradient-to-r from-rose-50 to-amber-50 border-rose-200"
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md ${
              cashRegister ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
            }`}
          >
            {cashRegister ? <Unlock className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  cashRegister
                    ? "bg-emerald-200/60 text-emerald-900"
                    : "bg-rose-200/60 text-rose-900"
                }`}
              >
                {cashRegister ? "🟢 CAJA ABIERTA" : "🔴 CAJA CERRADA"}
              </span>
              {cashRegister && (
                <span className="text-xs text-slate-500 font-mono">
                  Abierta: {formatDate(cashRegister.openedAt)}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
              {cashRegister ? formatCurrency(cashRegister.expectedCash) : "Sin Operaciones Activas"}
            </h2>
            <p className="text-xs text-slate-500">
              {cashRegister
                ? "Efectivo Físico Esperado en Cajón"
                : "Abre la caja para comenzar a registrar operaciones en efectivo."}
            </p>
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          {cashRegister ? (
            <>
              <button
                onClick={() => setShowMovementModal(true)}
                className="flex-1 md:flex-none bg-white hover:bg-slate-50 text-slate-800 font-bold px-4 py-2.5 rounded-2xl border border-slate-200 shadow-2xs text-xs flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>Movimiento de Caja</span>
              </button>
              <button
                onClick={() => {
                  setCountedCash(cashRegister.expectedCash);
                  setShowCloseModal(true);
                }}
                className="flex-1 md:flex-none bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-2.5 rounded-2xl shadow-md text-xs flex items-center justify-center gap-1.5"
              >
                <Lock className="w-4 h-4" />
                <span>CIERRE DE CAJA</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowOpenModal(true)}
              className="w-full md:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold px-6 py-3 rounded-2xl shadow-md text-sm flex items-center justify-center gap-2"
            >
              <Unlock className="w-5 h-5" />
              <span>ABRIR CAJA NUEVA</span>
            </button>
          )}
        </div>
      </div>

      {/* Movements Table if open */}
      {cashRegister && (
        <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-xs">
          <h3 className="font-bold text-rose-950 text-base mb-3">
            💸 Movimientos de la Sesión Actual
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-rose-50/50 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-xl">Fecha/Hora</th>
                  <th className="py-2.5 px-3">Tipo</th>
                  <th className="py-2.5 px-3">Concepto / Motivo</th>
                  <th className="py-2.5 px-3">Método</th>
                  <th className="py-2.5 px-3 rounded-r-xl text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-50">
                {cashRegister.cashMovements?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No hay movimientos en esta sesión aún.
                    </td>
                  </tr>
                ) : (
                  cashRegister.cashMovements?.map((m: any) => {
                    const isPositive = ["INGRESO_MANUAL", "VENTA"].includes(m.type);

                    return (
                      <tr key={m.id} className="hover:bg-rose-50/30 transition-colors">
                        <td className="py-3 px-3">{formatDate(m.createdAt)}</td>
                        <td className="py-3 px-3 font-bold">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] ${
                              isPositive
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {m.type}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-800 font-medium">{m.note || "-"}</td>
                        <td className="py-3 px-3 text-slate-500">{m.paymentMethod}</td>
                        <td
                          className={`py-3 px-3 font-bold text-right ${
                            isPositive ? "text-emerald-700" : "text-red-600"
                          }`}
                        >
                          {isPositive ? "+" : "-"}
                          {formatCurrency(m.amount)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABRIR CAJA MODAL */}
      {showOpenModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-rose-100">
            <h3 className="font-extrabold text-lg text-rose-950 mb-1">🔓 Abrir Caja Matutina</h3>
            <p className="text-xs text-slate-500 mb-4">
              Ingresa el fondo inicial disponible en efectivo.
            </p>

            {errorMsg && (
              <div className="bg-red-50 text-red-700 text-xs p-2.5 rounded-xl border border-red-200 mb-3">
                {errorMsg}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  💵 Fondo Inicial (Efectivo MXN)
                </label>
                <input
                  type="number"
                  step="10"
                  value={initialFund}
                  onChange={(e) => setInitialFund(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-rose-950 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Notas u Observaciones
                </label>
                <input
                  type="text"
                  placeholder="Ej. Cambio de billetes de $50 y $20..."
                  value={openNotes}
                  onChange={(e) => setOpenNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-5">
              <button
                type="button"
                onClick={() => setShowOpenModal(false)}
                className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleOpenCash}
                disabled={isPending}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md"
              >
                {isPending ? "Abriendo..." : "Confirmar Apertura"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CIERRE DE CAJA MODAL */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-rose-100">
            <h3 className="font-extrabold text-lg text-rose-950 mb-1">🔒 Arqueo y Cierre de Caja</h3>
            <p className="text-xs text-slate-500 mb-4">
              Ingresa el efectivo contado físicamente en el cajón.
            </p>

            {errorMsg && (
              <div className="bg-red-50 text-red-700 text-xs p-2.5 rounded-xl border border-red-200 mb-3">
                {errorMsg}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="bg-rose-50 p-3 rounded-2xl border border-rose-100 flex justify-between items-center">
                <span className="font-bold text-slate-700">Efectivo Esperado:</span>
                <span className="font-extrabold text-rose-950 text-base">
                  {formatCurrency(expectedCash)}
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  💵 Efectivo Contado (Físico)
                </label>
                <input
                  type="number"
                  step="1"
                  value={countedCash}
                  onChange={(e) => setCountedCash(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-rose-950 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              {/* Difference Indicator */}
              <div
                className={`p-3 rounded-2xl border font-bold flex justify-between items-center ${
                  Math.abs(computedDifference) < 0.01
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : computedDifference < 0
                    ? "bg-red-50 border-red-200 text-red-800"
                    : "bg-amber-50 border-amber-200 text-amber-900"
                }`}
              >
                <span>Diferencia de Arqueo:</span>
                <span className="text-sm">
                  {Math.abs(computedDifference) < 0.01
                    ? "🟢 Cuadrada ($0.00)"
                    : computedDifference < 0
                    ? `⚠️ Faltante: ${formatCurrency(computedDifference)}`
                    : `🟢 Sobrante: +${formatCurrency(computedDifference)}`}
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Motivo / Observaciones {Math.abs(computedDifference) >= 0.01 ? "(Obligatorio por diferencia)" : ""}
                </label>
                <input
                  type="text"
                  placeholder="Escribe el motivo del cierre..."
                  value={closeNotes}
                  onChange={(e) => setCloseNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-5">
              <button
                type="button"
                onClick={() => setShowCloseModal(false)}
                className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCloseCash}
                disabled={isPending}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md"
              >
                {isPending ? "Guardando..." : "Confirmar Cierre"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOVIMIENTO MANUAL MODAL */}
      {showMovementModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-rose-100">
            <h3 className="font-extrabold text-lg text-rose-950 mb-1">💸 Movimiento de Caja</h3>
            <p className="text-xs text-slate-500 mb-4">
              Registra un gasto, retiro de efectivo o ingreso manual.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tipo de Movimiento</label>
                <select
                  value={movementType}
                  onChange={(e) => setMovementType(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="INGRESO_MANUAL">📥 Ingreso Manual (Entrada $)</option>
                  <option value="GASTO">💸 Gasto (Salida $)</option>
                  <option value="RETIRO">🏦 Retiro de Parcial de Caja (Salida $)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Monto ($ MXN)</label>
                <input
                  type="number"
                  step="5"
                  value={movementAmount}
                  onChange={(e) => setMovementAmount(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-rose-950"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Concepto / Nota</label>
                <input
                  type="text"
                  placeholder="Ej. Pago de envío express / Retiro a cuenta..."
                  value={movementNote}
                  onChange={(e) => setMovementNote(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-5">
              <button
                type="button"
                onClick={() => setShowMovementModal(false)}
                className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddMovement}
                disabled={isPending}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md"
              >
                {isPending ? "Guardando..." : "Registrar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
