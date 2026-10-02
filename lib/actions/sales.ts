"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface CreateSaleInput {
  customerId: string;
  deliveryType: "PICKUP" | "SHIPPING" | "PERSONAL";
  paymentMethod: "EFECTIVO" | "TARJETA" | "TRANSFERENCIA" | "MERCADO_PAGO" | "OTRO";
  discount: number;
  shippingCost: number;
  notes?: string;
  items: {
    productId: string;
    variantId?: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
  }[];
}

export async function createSale(input: CreateSaleInput) {
  try {
    if (!input.items || input.items.length === 0) {
      return { success: false, error: "El carrito no puede estar vacío." };
    }

    // 1. Get current active user (admin/vendedor)
    const activeUser = await db.user.findFirst({ where: { active: true } });
    if (!activeUser) {
      return { success: false, error: "No se encontró un usuario activo para registrar la venta." };
    }

    // 2. Check if cash register is open if paying with Cash
    let activeCashRegister = null;
    if (input.paymentMethod === "EFECTIVO") {
      activeCashRegister = await db.cashRegister.findFirst({
        where: { status: "OPEN" },
      });
      if (!activeCashRegister) {
        return {
          success: false,
          error: "Para cobrar en efectivo se requiere tener una Caja Abierta. Por favor abre caja primero.",
        };
      }
    }

    // 3. Execute database transaction
    const result = await db.$transaction(async (tx) => {
      // Validate customer or default to General Customer
      let customerId = input.customerId;
      if (!customerId) {
        const generalCust = await tx.customer.findFirst({ where: { isGeneral: true } });
        if (generalCust) {
          customerId = generalCust.id;
        } else {
          const newGen = await tx.customer.create({
            data: {
              name: "CLIENTE MOSTRADOR (GENERAL)",
              isGeneral: true,
            },
          });
          customerId = newGen.id;
        }
      }

      // Generate next sale number CB-XXXXXX
      const saleCount = await tx.sale.count();
      const nextNum = (saleCount + 1).toString().padStart(6, "0");
      const saleNumber = `CB-${nextNum}`;

      let subtotal = 0;
      let historicalCostSum = 0;
      const saleItemsToCreate = [];

      // Validate stock & calculate totals
      for (const item of input.items) {
        let productName = "";
        let variantName = null;
        let sku = "";
        let unitCost = 0;
        let availableStock = 0;

        if (item.variantId) {
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
            include: { product: true },
          });
          if (!variant) {
            throw new Error(`La variante seleccionada no existe.`);
          }
          if (variant.stock < item.quantity) {
            throw new Error(
              `Stock insuficiente para ${variant.product.name} (${variant.size || ""} ${variant.color || ""}). Quedan ${variant.stock} unidades.`
            );
          }
          productName = variant.product.name;
          variantName = `Talla ${variant.size || "-"} / Color ${variant.color || "-"}`;
          sku = variant.sku;
          unitCost = variant.cost;
          availableStock = variant.stock;

          // Update variant stock
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });

          // Also update parent product stock if needed
          await tx.product.update({
            where: { id: variant.productId },
            data: { stock: { decrement: item.quantity } },
          });
        } else {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });
          if (!product) {
            throw new Error(`El producto seleccionado no existe.`);
          }
          if (product.stock < item.quantity) {
            throw new Error(`Stock insuficiente para ${product.name}. Quedan ${product.stock} unidades.`);
          }
          productName = product.name;
          sku = product.sku;
          unitCost = product.cost;
          availableStock = product.stock;

          // Update product stock
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }

        const itemDiscount = item.discount || 0;
        const itemSubtotal = (item.unitPrice - itemDiscount) * item.quantity;
        subtotal += itemSubtotal;
        historicalCostSum += unitCost * item.quantity;

        saleItemsToCreate.push({
          productId: item.productId,
          variantId: item.variantId || null,
          productName,
          variantName,
          sku,
          unitCost,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          discount: itemDiscount,
          subtotal: itemSubtotal,
        });
      }

      const total = subtotal - (input.discount || 0) + (input.shippingCost || 0);

      // Create Sale record
      const sale = await tx.sale.create({
        data: {
          saleNumber,
          customerId,
          cashRegisterId: activeCashRegister ? activeCashRegister.id : null,
          userId: activeUser.id,
          status: "COMPLETED",
          subtotal,
          discount: input.discount || 0,
          shippingCost: input.shippingCost || 0,
          total,
          deliveryType: input.deliveryType,
          historicalCostSum,
          notes: input.notes,
          items: {
            create: saleItemsToCreate,
          },
          payments: {
            create: [
              {
                paymentMethod: input.paymentMethod,
                amount: total,
              },
            ],
          },
        },
        include: {
          items: true,
          payments: true,
          customer: true,
        },
      });

      // Register inventory movements
      for (const item of saleItemsToCreate) {
        const prevStock = 10; // reference
        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            variantId: item.variantId,
            type: "VENTA",
            quantity: item.quantity,
            previousStock: prevStock,
            newStock: prevStock - item.quantity,
            userId: activeUser.id,
            reason: `Venta Folio ${sale.saleNumber}`,
            referenceId: sale.id,
          },
        });
      }

      // If EFECTIVO payment, record in cash movements
      if (input.paymentMethod === "EFECTIVO" && activeCashRegister) {
        await tx.cashMovement.create({
          data: {
            cashRegisterId: activeCashRegister.id,
            userId: activeUser.id,
            type: "VENTA",
            amount: total,
            paymentMethod: "EFECTIVO",
            referenceId: sale.id,
            note: `Venta en efectivo Folio ${sale.saleNumber}`,
          },
        });

        // Update expected cash in register
        await tx.cashRegister.update({
          where: { id: activeCashRegister.id },
          data: {
            expectedCash: { increment: total },
          },
        });
      }

      // Update customer purchase stats
      if (customerId) {
        await tx.customer.update({
          where: { id: customerId },
          data: {
            totalPurchasesCount: { increment: 1 },
            totalSpent: { increment: total },
            lastPurchaseAt: new Date(),
          },
        });
      }

      // Record Audit Log
      await tx.auditLog.create({
        data: {
          userId: activeUser.id,
          action: "VENTA",
          entity: "Sale",
          entityId: sale.id,
          reference: sale.saleNumber,
          newValues: JSON.stringify({ total, paymentMethod: input.paymentMethod, itemCount: saleItemsToCreate.length }),
        },
      });

      return sale;
    });

    revalidatePath("/ventas");
    revalidatePath("/inventario");
    revalidatePath("/caja");
    revalidatePath("/dashboard");
    return { success: true, data: result };
  } catch (err: any) {
    console.error("Error creating sale:", err);
    return { success: false, error: err.message || "Error al completar la venta." };
  }
}

export async function cancelSale(saleId: string, reason: string) {
  try {
    const activeUser = await db.user.findFirst({ where: { active: true } });
    if (!activeUser) return { success: false, error: "Usuario no autenticado." };

    const result = await db.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { id: saleId },
        include: { items: true, payments: true },
      });

      if (!sale) throw new Error("Venta no encontrada.");
      if (sale.status === "CANCELLED") throw new Error("Esta venta ya fue cancelada.");

      // 1. Revert inventory
      for (const item of sale.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });

        // Record inventory movement
        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            variantId: item.variantId,
            type: "CANCELACION_VENTA",
            quantity: item.quantity,
            previousStock: 0,
            newStock: item.quantity,
            userId: activeUser.id,
            reason: `Cancelación Folio ${sale.saleNumber}: ${reason}`,
            referenceId: sale.id,
          },
        });
      }

      // 2. Adjust Cash Register if it was cash
      const cashPayment = sale.payments.find((p) => p.paymentMethod === "EFECTIVO");
      if (cashPayment && sale.cashRegisterId) {
        const cashRegister = await tx.cashRegister.findUnique({
          where: { id: sale.cashRegisterId },
        });
        if (cashRegister && cashRegister.status === "OPEN") {
          await tx.cashMovement.create({
            data: {
              cashRegisterId: cashRegister.id,
              userId: activeUser.id,
              type: "DEVOLUCION",
              amount: cashPayment.amount,
              paymentMethod: "EFECTIVO",
              referenceId: sale.id,
              note: `Cancelación Folio ${sale.saleNumber}: ${reason}`,
            },
          });

          await tx.cashRegister.update({
            where: { id: cashRegister.id },
            data: { expectedCash: { decrement: cashPayment.amount } },
          });
        }
      }

      // 3. Mark sale as CANCELLED (never delete historical sales)
      const updatedSale = await tx.sale.update({
        where: { id: saleId },
        data: { status: "CANCELLED", notes: `${sale.notes || ""} [CANCELADA: ${reason}]` },
      });

      // 4. Audit Log
      await tx.auditLog.create({
        data: {
          userId: activeUser.id,
          action: "CANCELACION",
          entity: "Sale",
          entityId: sale.id,
          reference: sale.saleNumber,
          oldValues: JSON.stringify({ status: sale.status }),
          newValues: JSON.stringify({ status: "CANCELLED", reason }),
        },
      });

      return updatedSale;
    });

    revalidatePath("/ventas");
    revalidatePath("/inventario");
    revalidatePath("/caja");
    return { success: true, data: result };
  } catch (err: any) {
    return { success: false, error: err.message || "Error al cancelar la venta." };
  }
}
