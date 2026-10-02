"use client";

import { useState, useTransition, useEffect, useRef, useMemo, useDeferredValue } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  UserPlus,
  ShoppingBag,
  CreditCard,
  Banknote,
  Building2,
  Smartphone,
  HelpCircle,
  Truck,
  MapPin,
  Handshake,
  CheckCircle2,
  Printer,
  FileText,
  Share2,
  Sparkles,
  AlertTriangle,
  X,
} from "lucide-react";
import { createSale, CreateSaleInput } from "@/lib/actions/sales";
import { formatCurrency } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductVariant {
  id: string;
  sku: string;
  size: string | null;
  color: string | null;
  stock: number;
  cost: number;
  price: number;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  categoryId: string;
  category: Category;
  cost: number;
  price: number;
  stock: number;
  minStock: number;
  image: string | null;
  hasVariants: boolean;
  variants: ProductVariant[];
}

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  isGeneral: Boolean;
}

interface CartItem {
  cartId: string; // unique key in cart
  productId: string;
  variantId?: string;
  name: string;
  variantName?: string;
  sku: string;
  unitPrice: number;
  cost: number;
  quantity: number;
  discount: number;
  maxStock: number;
}

export function POSInterface({
  initialProducts,
  categories,
  customers,
  isOpenCashRegister,
}: {
  initialProducts: Product[];
  categories: Category[];
  customers: Customer[];
  isOpenCashRegister: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Custom Toast State
  const [toastMessage, setToastMessage] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Global barcode scanner listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      // Do not intercept if typing in another input
      if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || (active as HTMLElement).isContentEditable)) {
        return;
      }

      // If a standard character is typed
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (searchInputRef.current) {
          const input = searchInputRef.current;
          input.focus();
          
          // Use native setter to properly trigger React's onChange
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            "value"
          )?.set;
          nativeInputValueSetter?.call(input, input.value + e.key);
          input.dispatchEvent(new Event("input", { bubbles: true }));
          e.preventDefault();
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    customers.find((c) => c.isGeneral)?.id || customers[0]?.id || ""
  );
  const [paymentMethod, setPaymentMethod] = useState<"EFECTIVO" | "TARJETA" | "TRANSFERENCIA" | "MERCADO_PAGO" | "OTRO">("EFECTIVO");
  const [deliveryType, setDeliveryType] = useState<"PICKUP" | "SHIPPING" | "PERSONAL">("PICKUP");
  const [generalDiscount, setGeneralDiscount] = useState<number>(0);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [saleNotes, setSaleNotes] = useState<string>("");

  // Variant Modal state
  const [variantModalProduct, setVariantModalProduct] = useState<Product | null>(null);

  // Success Ticket Modal state
  const [completedSale, setCompletedSale] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const deferredSearchQuery = useDeferredValue(searchQuery);

  const filteredProducts = useMemo(() => {
    const results = initialProducts.filter((p) => {
      const matchesCategory = selectedCategory === "ALL" || p.categoryId === selectedCategory;
      const matchesSearch =
        deferredSearchQuery.trim() === "" ||
        p.name.toLowerCase().includes(deferredSearchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(deferredSearchQuery.toLowerCase()) ||
        p.variants.some(
          (v) =>
            v.sku.toLowerCase().includes(deferredSearchQuery.toLowerCase()) ||
            (v.size && v.size.toLowerCase().includes(deferredSearchQuery.toLowerCase())) ||
            (v.color && v.color.toLowerCase().includes(deferredSearchQuery.toLowerCase()))
        );
      return matchesCategory && matchesSearch;
    });
    // Limitar el número de nodos DOM renderizados para mantener el sistema rápido
    return results.slice(0, 60);
  }, [initialProducts, selectedCategory, deferredSearchQuery]);

  // Handle Search Input Enter (Barcode Scan)
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const query = searchQuery.trim().toLowerCase();
      if (!query) return;

      let matchedProduct: Product | null = null;
      let matchedVariant: ProductVariant | null = null;

      // 1. Check for exact variant SKU match
      for (const product of initialProducts) {
        const variant = product.variants.find((v) => v.sku.toLowerCase() === query);
        if (variant) {
          matchedProduct = product;
          matchedVariant = variant;
          break;
        }
      }

      // 2. Check for exact product SKU match
      if (!matchedProduct) {
        matchedProduct = initialProducts.find((p) => p.sku.toLowerCase() === query) || null;
      }

      if (matchedProduct) {
        if (matchedVariant) {
          handleSelectVariant(matchedProduct, matchedVariant);
        } else if (!matchedProduct.hasVariants || matchedProduct.variants.length === 0) {
          handleSelectProduct(matchedProduct);
        } else {
          // Scanned base product but it has variants, open modal
          setVariantModalProduct(matchedProduct);
        }
        setSearchQuery("");
        // Focus stays naturally on the input
      } else {
        showToast(`Producto no encontrado con SKU: ${searchQuery}`, "error");
        setSearchQuery("");
      }
    }
  };

  // Handle Add Product to Cart
  const handleSelectProduct = (product: Product) => {
    if (product.hasVariants && product.variants.length > 0) {
      setVariantModalProduct(product);
      return;
    }

    if (product.stock <= 0) {
      alert("Este producto está AGOTADO.");
      return;
    }

    addToCart({
      cartId: `prod-${product.id}`,
      productId: product.id,
      name: product.name,
      sku: product.sku,
      unitPrice: product.price,
      cost: product.cost,
      quantity: 1,
      discount: 0,
      maxStock: product.stock,
    });
  };

  const handleSelectVariant = (product: Product, variant: ProductVariant) => {
    if (variant.stock <= 0) {
      alert("Esta variante está AGOTADA.");
      return;
    }

    addToCart({
      cartId: `var-${variant.id}`,
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      variantName: `Talla ${variant.size || "-"} / Color ${variant.color || "-"}`,
      sku: variant.sku,
      unitPrice: variant.price,
      cost: variant.cost,
      quantity: 1,
      discount: 0,
      maxStock: variant.stock,
    });

    setVariantModalProduct(null);
  };

  const addToCart = (newItem: CartItem) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((i) => i.cartId === newItem.cartId);
      if (existingIndex > -1) {
        const updated = [...prev];
        const currentQty = updated[existingIndex].quantity;
        if (currentQty + 1 > newItem.maxStock) {
          alert(`No puedes agregar más. El stock máximo disponible es ${newItem.maxStock}.`);
          return prev;
        }
        // Create a new object to avoid mutating previous state (which causes +2 in Strict Mode)
        updated[existingIndex] = { ...updated[existingIndex], quantity: currentQty + 1 };
        return updated;
      }
      return [...prev, newItem];
    });
  };

  const updateQuantity = (cartId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartId === cartId) {
            const newQty = item.quantity + delta;
            if (newQty > item.maxStock) {
              alert(`Stock máximo alcanzado (${item.maxStock}).`);
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (cartId: string) => {
    setCart((prev) => prev.filter((i) => i.cartId !== cartId));
  };

  // Totals calculations
  const subtotal = cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const grandTotal = Math.max(0, subtotal - generalDiscount + Number(shippingCost));

  // Execute Sale
  const handleCompleteSale = () => {
    if (cart.length === 0) return;
    if (paymentMethod === "EFECTIVO" && !isOpenCashRegister) {
      setErrorMsg("⚠️ Para cobrar en efectivo debes abrir caja primero.");
      return;
    }

    setErrorMsg(null);

    const payload: CreateSaleInput = {
      customerId: selectedCustomerId,
      deliveryType,
      paymentMethod,
      discount: generalDiscount,
      shippingCost: Number(shippingCost),
      notes: saleNotes,
      items: cart.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        discount: i.discount,
      })),
    };

    startTransition(async () => {
      const res = await createSale(payload);
      if (res.success && res.data) {
        setCompletedSale(res.data);
        setCart([]);
        setGeneralDiscount(0);
        setShippingCost(0);
        setSaleNotes("");
      } else {
        setErrorMsg(res.error || "Ocurrió un error al procesar la venta.");
      }
    });
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6 overscroll-none relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl shadow-lg border text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-4 ${
            toastMessage.type === "error"
              ? "bg-red-50 text-red-600 border-red-200"
              : "bg-emerald-50 text-emerald-600 border-emerald-200"
          }`}
        >
          {toastMessage.type === "error" ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          {toastMessage.msg}
        </div>
      )}

      {/* LEFT COLUMN: Product Catalog & Fast Search */}
      <div className="flex-1 flex flex-col min-w-0 space-y-4 min-h-0 overflow-hidden">
        {/* Search Bar */}
        <div className="bg-white p-3.5 rounded-2xl border border-rose-100 shadow-2xs flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="🔎 Buscar o escanear SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Categories Horizontal Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === "ALL"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-white text-slate-600 border border-rose-100 hover:bg-rose-50"
            }`}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-rose-100 hover:bg-rose-50"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 overflow-y-auto overscroll-contain pb-4 pr-2">
          {filteredProducts.map((product) => {
            const isOutOfStock = product.stock <= 0;
            const isLowStock = product.stock > 0 && product.stock <= product.minStock;

            return (
              <div
                key={product.id}
                onClick={() => handleSelectProduct(product)}
                className={`bg-white rounded-2xl border p-3 flex flex-col justify-between cursor-pointer transition-all duration-150 hover:shadow-md hover:border-rose-300 active:scale-[0.98] ${
                  isOutOfStock ? "opacity-60 border-slate-200 bg-slate-50" : "border-rose-100"
                }`}
              >
                <div>
                  {/* Image container */}
                  <div className="relative w-full h-28 bg-rose-50/50 rounded-xl overflow-hidden mb-2 flex items-center justify-center">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ShoppingBag className="w-8 h-8 text-rose-300" />
                    )}

                    {/* Stock badge */}
                    {isOutOfStock ? (
                      <span className="absolute top-1.5 right-1.5 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                        ❌ AGOTADO
                      </span>
                    ) : isLowStock ? (
                      <span className="absolute top-1.5 right-1.5 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                        ⚠️ Stock: {product.stock}
                      </span>
                    ) : (
                      <span className="absolute top-1.5 right-1.5 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                        🟢 {product.stock} disp.
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-xs text-slate-800 line-clamp-2 leading-snug">
                    {product.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{product.sku}</p>
                </div>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-rose-50">
                  <span className="font-bold text-rose-700 text-sm">
                    {formatCurrency(product.price)}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-sm">
                    +
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT COLUMN: POS Cart & Checkout Modal Panel */}
      <div className="w-full lg:w-[420px] bg-white rounded-2xl border border-rose-100 p-4 shadow-sm flex flex-col min-h-0 overflow-hidden">
        <div className="flex flex-col min-h-0 h-full">
          {/* Cart Header */}
          <div className="flex items-center justify-between pb-3 border-b border-rose-100 shrink-0">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-rose-600" />
              <h2 className="font-bold text-rose-950 text-base">Carrito de Venta</h2>
            </div>
            <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {cart.reduce((a, b) => a + b.quantity, 0)} artículos
            </span>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto overscroll-contain my-3 space-y-2 pr-2 min-h-0">
            {cart.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-rose-200 stroke-1" />
                <p className="text-xs">El carrito está vacío.</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Haz clic en un producto para agregarlo.
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.cartId}
                  className="bg-rose-50/40 p-2.5 rounded-xl border border-rose-100/60 flex items-center justify-between text-xs"
                >
                  <div className="flex-1 pr-2">
                    <p className="font-semibold text-slate-800 leading-tight">{item.name}</p>
                    {item.variantName && (
                      <span className="text-[10px] text-rose-600 font-medium bg-rose-100/70 px-1.5 py-0.2 rounded-md inline-block mt-0.5">
                        {item.variantName}
                      </span>
                    )}
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {formatCurrency(item.unitPrice)} c/u
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Quantity controls */}
                    <div className="flex items-center bg-white border border-rose-200 rounded-lg shadow-2xs">
                      <button
                        onClick={() => updateQuantity(item.cartId, -1)}
                        className="p-1 text-slate-500 hover:text-rose-600"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 font-bold text-rose-950 text-xs">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.cartId, 1)}
                        className="p-1 text-slate-500 hover:text-rose-600"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="font-bold text-rose-950 w-16 text-right">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </span>

                    <button
                      onClick={() => removeFromCart(item.cartId)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Customer Selection */}
          <div className="space-y-3 pt-3 border-t border-rose-100 shrink-0">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">👤 Cliente</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.phone ? `(${c.phone})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Delivery Method */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                📦 Tipo de Entrega
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setDeliveryType("PICKUP")}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[10px] font-bold transition-all ${
                    deliveryType === "PICKUP"
                      ? "bg-rose-50 border-rose-500 text-rose-700 shadow-2xs"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 mb-0.5" />
                  Recoger
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryType("SHIPPING")}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[10px] font-bold transition-all ${
                    deliveryType === "SHIPPING"
                      ? "bg-rose-50 border-rose-500 text-rose-700 shadow-2xs"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Truck className="w-3.5 h-3.5 mb-0.5" />
                  Envío
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryType("PERSONAL")}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[10px] font-bold transition-all ${
                    deliveryType === "PERSONAL"
                      ? "bg-rose-50 border-rose-500 text-rose-700 shadow-2xs"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Handshake className="w-3.5 h-3.5 mb-0.5" />
                  Personal
                </button>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                💳 Método de Pago
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("EFECTIVO")}
                  className={`flex items-center justify-center gap-1 p-2 rounded-xl border text-[10px] font-bold transition-all ${
                    paymentMethod === "EFECTIVO"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                  Efectivo
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("TARJETA")}
                  className={`flex items-center justify-center gap-1 p-2 rounded-xl border text-[10px] font-bold transition-all ${
                    paymentMethod === "TARJETA"
                      ? "bg-blue-50 border-blue-500 text-blue-800 shadow-2xs"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                  Tarjeta
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("TRANSFERENCIA")}
                  className={`flex items-center justify-center gap-1 p-2 rounded-xl border text-[10px] font-bold transition-all ${
                    paymentMethod === "TRANSFERENCIA"
                      ? "bg-purple-50 border-purple-500 text-purple-800 shadow-2xs"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-purple-600" />
                  Transf.
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Totals & Checkout Button */}
        <div className="pt-3 border-t border-rose-100 mt-3 space-y-2 shrink-0">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 p-2 rounded-xl flex items-center gap-2 text-xs text-red-700">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-800">{formatCurrency(subtotal)}</span>
            </div>
            {shippingCost > 0 && (
              <div className="flex justify-between">
                <span>Costo Envío:</span>
                <span className="font-semibold text-slate-800">
                  {formatCurrency(shippingCost)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-rose-950 font-bold text-base pt-1 border-t border-slate-100">
              <span>Total a Cobrar:</span>
              <span className="text-rose-600">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          <button
            onClick={handleCompleteSale}
            disabled={cart.length === 0 || isPending}
            className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-md text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isPending ? (
              <span>Procesando venta...</span>
            ) : (
              <>
                <ShoppingBag className="w-5 h-5" />
                <span>COBRAR {formatCurrency(grandTotal)}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* VARIANT SELECTOR MODAL */}
      {variantModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-md shadow-2xl border border-rose-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-rose-950 text-base">
                Selecciona Talla / Variante
              </h3>
              <button
                onClick={() => setVariantModalProduct(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">{variantModalProduct.name}</p>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {variantModalProduct.variants.map((v) => (
                <div
                  key={v.id}
                  onClick={() => handleSelectVariant(variantModalProduct, v)}
                  className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    v.stock <= 0
                      ? "bg-slate-50 border-slate-200 opacity-60 pointer-events-none"
                      : "bg-rose-50/40 border-rose-100 hover:border-rose-300 hover:bg-rose-50"
                  }`}
                >
                  <div>
                    <span className="font-bold text-xs text-rose-950 block">
                      Talla: {v.size || "Única"} - Color: {v.color || "Único"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{v.sku}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-rose-700 text-sm block">
                      {formatCurrency(v.price)}
                    </span>
                    <span
                      className={`text-[10px] font-bold ${
                        v.stock <= 0 ? "text-red-500" : "text-emerald-600"
                      }`}
                    >
                      {v.stock <= 0 ? "Agotado" : `Stock: ${v.stock}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* COMPLETED SALE TICKET MODAL */}
      {completedSale && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-rose-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center pb-4 border-b border-rose-100">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-extrabold text-xl text-rose-950">¡Venta Completada!</h3>
              <p className="text-xs text-amber-600 font-bold mt-0.5">
                Folio: {completedSale.saleNumber}
              </p>
            </div>

            {/* Printable Ticket View */}
            <div id="printable-ticket" className="py-4 space-y-3 text-xs font-mono">
              <div className="text-center border-b border-dashed border-slate-300 pb-2">
                <p className="font-bold text-sm">COMPRITAS BONITAS</p>
                <p className="text-[10px] text-slate-500">Lencería & Detalles</p>
                <p className="text-[10px] text-slate-500">Fecha: {new Date().toLocaleString()}</p>
              </div>

              <div className="space-y-1">
                {completedSale.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between">
                    <span>
                      {item.quantity}x {item.productName} {item.variantName ? `(${item.variantName})` : ""}
                    </span>
                    <span className="font-bold">{formatCurrency(item.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-slate-300 pt-2 space-y-0.5">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(completedSale.subtotal)}</span>
                </div>
                {completedSale.discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Descuento:</span>
                    <span>-{formatCurrency(completedSale.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm pt-1 border-t">
                  <span>TOTAL:</span>
                  <span>{formatCurrency(completedSale.total)}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Método de pago: {completedSale.payments[0]?.paymentMethod || "Efectivo"}
                </p>
              </div>

              <div className="text-center text-[10px] text-slate-400 pt-2">
                ¡Gracias por tu preferencia!
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-4 border-t border-rose-100">
              <button
                onClick={() => window.print()}
                className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 rounded-xl text-xs transition-colors"
              >
                <Printer className="w-4 h-4" />
                Imprimir
              </button>
              <button
                onClick={() => setCompletedSale(null)}
                className="flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-xs transition-colors"
              >
                Nueva Venta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
