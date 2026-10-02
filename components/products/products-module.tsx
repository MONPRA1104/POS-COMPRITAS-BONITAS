"use client";

import { useState, useTransition } from "react";
import { createProduct, createCategory } from "@/lib/actions/products";
import { formatCurrency } from "@/lib/utils";
import {
  Boxes,
  Plus,
  FolderPlus,
  Tag,
  Search,
  CheckCircle2,
  X,
  Layers,
} from "lucide-react";

export function ProductsModule({
  products,
  categories,
}: {
  products: any[];
  categories: any[];
}) {
  const [isPending, startTransition] = useTransition();

  // Modals state
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // New Category Form
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");

  // New Product Form
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [brand, setBrand] = useState("Compritas Bonitas");
  const [cost, setCost] = useState(100);
  const [price, setPrice] = useState(250);
  const [stock, setStock] = useState(10);
  const [minStock, setMinStock] = useState(3);
  const [image, setImage] = useState("");

  // Variants management
  const [hasVariants, setHasVariants] = useState(false);
  const [variantsList, setVariantsList] = useState<
    { sku: string; size: string; color: string; stock: number; cost: number; price: number; minStock: number }[]
  >([]);

  const [varSize, setVarSize] = useState("M");
  const [varColor, setVarColor] = useState("Rosa");
  const [varStock, setVarStock] = useState(5);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAddVariantItem = () => {
    if (!sku) {
      alert("Ingresa primero el SKU base del producto.");
      return;
    }
    const varSku = `${sku}-${varColor.toUpperCase()}-${varSize.toUpperCase()}`;
    setVariantsList((prev) => [
      ...prev,
      {
        sku: varSku,
        size: varSize,
        color: varColor,
        stock: varStock,
        cost: Number(cost),
        price: Number(price),
        minStock: Number(minStock),
      },
    ]);
  };

  const handleCreateProductSubmit = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await createProduct({
        sku,
        name,
        description,
        categoryId,
        brand,
        cost: Number(cost),
        price: Number(price),
        stock: Number(stock),
        minStock: Number(minStock),
        image,
        hasVariants,
        variants: hasVariants ? variantsList : [],
      });

      if (res.success) {
        setShowProductModal(false);
        window.location.reload();
      } else {
        setErrorMsg(res.error || "Error al crear el producto.");
      }
    });
  };

  const handleCreateCategorySubmit = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await createCategory(catName, catDesc);
      if (res.success) {
        setShowCategoryModal(false);
        window.location.reload();
      } else {
        setErrorMsg(res.error || "Error al crear la categoría.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-3xl border border-rose-100 shadow-2xs">
        <div className="flex items-center gap-2">
          <Boxes className="w-5 h-5 text-rose-600" />
          <span className="font-bold text-rose-950 text-sm">
            Catálogo de Productos ({products.length} productos registrados)
          </span>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="flex-1 sm:flex-none bg-white hover:bg-rose-50 text-rose-700 font-bold px-4 py-2 rounded-2xl border border-rose-200 text-xs flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <FolderPlus className="w-4 h-4 text-rose-600" />
            <span>Nueva Categoría</span>
          </button>
          <button
            onClick={() => setShowProductModal(true)}
            className="flex-1 sm:flex-none bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-2 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>NUEVO PRODUCTO</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-rose-50/50 text-slate-700 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3 rounded-l-xl">SKU</th>
                <th className="py-2.5 px-3">Producto</th>
                <th className="py-2.5 px-3">Categoría</th>
                <th className="py-2.5 px-3 text-center">Variantes</th>
                <th className="py-2.5 px-3 text-center">Stock Total</th>
                <th className="py-2.5 px-3 text-right">Costo</th>
                <th className="py-2.5 px-3 rounded-r-xl text-right">Precio Venta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-rose-50/30 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-rose-950">{p.sku}</td>
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-800">{p.name}</p>
                    <span className="text-[10px] text-slate-400">{p.brand || "Sin marca"}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded-md text-[10px]">
                      {p.category?.name || "Sin Categoría"}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-bold">
                    {p.hasVariants ? (
                      <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-[10px]">
                        {p.variants.length} variantes
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[10px]">Sin variantes</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center font-extrabold text-slate-900 text-sm">
                    {p.stock}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-500">{formatCurrency(p.cost)}</td>
                  <td className="py-3 px-3 text-right font-bold text-rose-700 text-sm">
                    {formatCurrency(p.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW PRODUCT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-rose-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-extrabold text-lg text-rose-950">🧺 Registrar Nuevo Producto</h3>
              <button onClick={() => setShowProductModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="bg-red-50 text-red-700 text-xs p-2.5 rounded-xl border border-red-200 mb-3">
                {errorMsg}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">SKU Base</label>
                  <input
                    type="text"
                    placeholder="Ej. PROD-LENC-05"
                    value={sku}
                    onChange={(e) => setSku(e.target.value.toUpperCase())}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Categoría</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre del Producto</label>
                <input
                  type="text"
                  placeholder="Ej. Baby Doll Encaje Blanco..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Costo ($)</label>
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Precio Venta ($)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-rose-700"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stock Mínimo</label>
                  <input
                    type="number"
                    value={minStock}
                    onChange={(e) => setMinStock(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              {/* Has Variants Toggle */}
              <div className="pt-2 border-t border-rose-100">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-rose-950">
                  <input
                    type="checkbox"
                    checked={hasVariants}
                    onChange={(e) => setHasVariants(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-400"
                  />
                  <span>Este producto maneja Variantes (Talla / Color)</span>
                </label>
              </div>

              {hasVariants ? (
                <div className="bg-rose-50/50 p-3 rounded-2xl border border-rose-100 space-y-2">
                  <span className="font-bold text-slate-800 block text-xs">Añadir Variantes</span>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Talla (M, L...)"
                      value={varSize}
                      onChange={(e) => setVarSize(e.target.value)}
                      className="p-2 bg-white border rounded-xl"
                    />
                    <input
                      type="text"
                      placeholder="Color"
                      value={varColor}
                      onChange={(e) => setVarColor(e.target.value)}
                      className="p-2 bg-white border rounded-xl"
                    />
                    <input
                      type="number"
                      placeholder="Stock"
                      value={varStock}
                      onChange={(e) => setVarStock(Number(e.target.value))}
                      className="p-2 bg-white border rounded-xl"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddVariantItem}
                    className="w-full bg-rose-600 text-white font-bold py-1.5 rounded-xl text-xs"
                  >
                    + Agregar Variante
                  </button>

                  {/* Added variants list */}
                  <div className="space-y-1 pt-2">
                    {variantsList.map((v, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center bg-white p-2 rounded-xl text-[11px] border"
                      >
                        <span className="font-mono font-bold">{v.sku}</span>
                        <span>
                          Talla: {v.size} | Color: {v.color} | Stock: {v.stock}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stock Inicial</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-5">
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateProductSubmit}
                disabled={isPending}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md"
              >
                {isPending ? "Guardando..." : "Guardar Producto"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW CATEGORY MODAL */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-rose-100">
            <h3 className="font-extrabold text-lg text-rose-950 mb-3">📁 Crear Nueva Categoría</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre Categoría</label>
                <input
                  type="text"
                  placeholder="Ej. Accesorios de Moda..."
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Descripción</label>
                <input
                  type="text"
                  placeholder="Descripción opcional..."
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-5">
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateCategorySubmit}
                disabled={isPending}
                className="flex-1 bg-rose-600 text-white font-bold py-2.5 rounded-xl text-xs shadow-md"
              >
                Crear Categoría
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
