"use client";

import { useState, useTransition } from "react";
import { createOrder, updateOrderStatus } from "@/lib/actions/orders";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { Receipt, Plus, Truck, MapPin, CheckCircle2, Clock, XCircle, ChevronRight, X } from "lucide-react";

export function OrdersModule({
  orders,
  customers,
  products,
}: {
  orders: any[];
  customers: any[];
  products: any[];
}) {
  const [isPending, startTransition] = useTransition();
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state
  const [customerId, setCustomerId] = useState(customers[0]?.id || "");
  const [deliveryType, setDeliveryType] = useState<"PICKUP" | "SHIPPING" | "PERSONAL">("SHIPPING");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [shippingCost, setShippingCost] = useState(80);
  const [courierCompany, setCourierCompany] = useState("Estafeta");
  const [trackingNumber, setTrackingNumber] = useState("");

  const [orderItems, setOrderItems] = useState<
    { productId: string; variantId?: string; quantity: number; unitPrice: number }[]
  >([]);

  const filteredOrders = orders.filter((o) => filterStatus === "ALL" || o.status === filterStatus);

  const handleStatusChange = (orderId: string, newStatus: any) => {
    startTransition(async () => {
      await updateOrderStatus(orderId, newStatus);
      window.location.reload();
    });
  };

  const handleAddOrderItem = (prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return;
    setOrderItems((prev) => [
      ...prev,
      {
        productId: prod.id,
        quantity: 1,
        unitPrice: prod.price,
      },
    ]);
  };

  const handleCreateOrderSubmit = () => {
    if (orderItems.length === 0) {
      alert("Agrega al menos 1 producto al pedido.");
      return;
    }

    startTransition(async () => {
      const res = await createOrder({
        customerId,
        deliveryType,
        recipientName,
        recipientPhone,
        shippingAddress,
        neighborhood,
        shippingCost: Number(shippingCost),
        courierCompany,
        trackingNumber,
        items: orderItems,
      });

      if (res.success) {
        setShowCreateModal(false);
        window.location.reload();
      } else {
        alert(res.error || "Error al registrar el pedido.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-3xl border border-rose-100 shadow-2xs">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {["ALL", "NUEVO", "CONFIRMADO", "PREPARANDO", "LISTO_PARA_RECOGER", "ENVIADO", "ENTREGADO"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  filterStatus === status
                    ? "bg-purple-600 text-white shadow-2xs"
                    : "bg-slate-50 text-slate-600 hover:bg-rose-50"
                }`}
              >
                {status === "ALL" ? "Todos" : status}
              </button>
            )
          )}
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-2.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>NUEVO PEDIDO WHATSAPP</span>
        </button>
      </div>

      {/* Orders List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredOrders.map((o) => (
          <div
            key={o.id}
            className="bg-white p-5 rounded-3xl border border-rose-100 shadow-2xs flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-mono font-extrabold text-rose-950 text-sm block">
                    {o.orderNumber}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Ref WA: {o.whatsappRef || "-"}
                  </span>
                </div>

                {/* Status Dropdown */}
                <select
                  value={o.status}
                  onChange={(e) => handleStatusChange(o.id, e.target.value)}
                  className="p-1.5 bg-purple-50 text-purple-900 border border-purple-200 rounded-xl font-bold text-xs"
                >
                  <option value="NUEVO">NUEVO</option>
                  <option value="CONFIRMADO">CONFIRMADO</option>
                  <option value="PREPARANDO">PREPARANDO</option>
                  <option value="LISTO_PARA_RECOGER">LISTO PARA RECOGER</option>
                  <option value="ENVIADO">ENVIADO</option>
                  <option value="ENTREGADO">ENTREGADO</option>
                  <option value="CANCELADO">CANCELADO</option>
                </select>
              </div>

              {/* Customer and Shipping Details */}
              <div className="bg-rose-50/40 p-3 rounded-2xl border border-rose-100/60 space-y-1 text-xs">
                <p className="font-bold text-slate-800">👤 {o.customer?.name}</p>
                {o.deliveryType === "SHIPPING" ? (
                  <p className="text-slate-600 text-[11px]">
                    📍 Envío a: {o.shippingAddress}, {o.neighborhood} ({o.courierCompany || "Paquetería"}
                    {o.trackingNumber ? ` - Guía: ${o.trackingNumber}` : ""})
                  </p>
                ) : (
                  <p className="text-amber-800 font-semibold text-[11px]">
                    📍 Pedido para Recoger en boutique
                  </p>
                )}
              </div>

              {/* Items List */}
              <div className="mt-3 space-y-1 text-xs">
                {o.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-slate-700">
                    <span>
                      {item.quantity}x {item.productName}
                    </span>
                    <span className="font-bold">{formatCurrency(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-rose-100 flex justify-between items-center text-xs">
              <span className="text-slate-400 text-[10px]">
                Registrado: {formatDateShort(o.createdAt)}
              </span>
              <span className="font-extrabold text-purple-900 text-base">
                Total: {formatCurrency(o.total)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* NEW ORDER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-rose-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-extrabold text-lg text-purple-950">🧾 Registrar Pedido de WhatsApp</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Cliente</label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone || "Sin teléfono"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tipo Entrega</label>
                  <select
                    value={deliveryType}
                    onChange={(e) => setDeliveryType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="SHIPPING">📦 Envío a Domicilio</option>
                    <option value="PICKUP">📍 Recoger en Tienda</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Costo Envío ($)</label>
                  <input
                    type="number"
                    value={shippingCost}
                    onChange={(e) => setShippingCost(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-purple-900"
                  />
                </div>
              </div>

              {deliveryType === "SHIPPING" && (
                <div className="space-y-2 bg-purple-50/40 p-3 rounded-2xl border border-purple-100">
                  <input
                    type="text"
                    placeholder="Dirección completa..."
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full p-2 bg-white border rounded-xl"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Empresa Paquetería (Estafeta...)"
                      value={courierCompany}
                      onChange={(e) => setCourierCompany(e.target.value)}
                      className="p-2 bg-white border rounded-xl"
                    />
                    <input
                      type="text"
                      placeholder="Número Guía de Rastreo"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="p-2 bg-white border rounded-xl font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Add Product Items */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Agregar Producto</label>
                <select
                  onChange={(e) => {
                    if (e.target.value) handleAddOrderItem(e.target.value);
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="">+ Selecciona un producto para agregar...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - {formatCurrency(p.price)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 pt-2">
                {orderItems.map((item, idx) => {
                  const p = products.find((x) => x.id === item.productId);
                  return (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 p-2 rounded-xl border text-[11px]">
                      <span className="font-bold">{p?.name}</span>
                      <span>{formatCurrency(item.unitPrice)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 pt-5">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateOrderSubmit}
                disabled={isPending}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md"
              >
                {isPending ? "Creando..." : "Crear Pedido"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
