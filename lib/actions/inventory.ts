"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function adjustStock(input: {
  productId: string;
  variantId?: string;
  type: "ENTRADA" | "AJUSTE_POSITIVO" | "AJUSTE_NEGATIVO" | "PRODUCTO_DANADO" | "DEVOLUCION";
  quantity: number;
  reason: string;
}) {
  try {
    if (!input.quantity || input.quantity <= 0) {
      return { success: false, error: "La cantidad debe ser mayor a 0." };
    }
    if (!input.reason || input.reason.trim().length === 0) {
      return { success: false, error: "El motivo del ajuste es obligatorio." };
    }

    const activeUser = await db.user.findFirst({ where: { active: true } });
    if (!activeUser) return { success: false, error: "Usuario no activo." };

    const result = await db.$transaction(async (tx) => {
      let previousStock = 0;
      let newStock = 0;
      const isPositive = ["ENTRADA", "AJUSTE_POSITIVO", "DEVOLUCION"].includes(input.type);
      const delta = isPositive ? input.quantity : -input.quantity;

      if (input.variantId) {
        const variant = await tx.productVariant.findUnique({
          where: { id: input.variantId },
        });
        if (!variant) throw new Error("Variante no encontrada.");
        previousStock = variant.stock;
        newStock = previousStock + delta;
        if (newStock < 0) throw new Error(`El ajuste resultaría en un stock negativo (${newStock}).`);

        await tx.productVariant.update({
          where: { id: input.variantId },
          data: { stock: newStock },
        });

        // Update total parent product stock
        await tx.product.update({
          where: { id: input.productId },
          data: { stock: { increment: delta } },
        });
      } else {
        const product = await tx.product.findUnique({
          where: { id: input.productId },
        });
        if (!product) throw new Error("Producto no encontrado.");
        previousStock = product.stock;
        newStock = previousStock + delta;
        if (newStock < 0) throw new Error(`El ajuste resultaría en un stock negativo (${newStock}).`);

        await tx.product.update({
          where: { id: input.productId },
          data: { stock: newStock },
        });
      }

      // Record movement audit
      const movement = await tx.inventoryMovement.create({
        data: {
          productId: input.productId,
          variantId: input.variantId || null,
          type: input.type,
          quantity: input.quantity,
          previousStock,
          newStock,
          userId: activeUser.id,
          reason: input.reason,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: activeUser.id,
          action: "AJUSTE_INVENTARIO",
          entity: "InventoryMovement",
          entityId: movement.id,
          newValues: JSON.stringify({
            type: input.type,
            quantity: input.quantity,
            previousStock,
            newStock,
            reason: input.reason,
          }),
        },
      });

      return movement;
    });

    revalidatePath("/inventario");
    revalidatePath("/productos");
    revalidatePath("/ventas/nueva");
    return { success: true, data: result };
  } catch (err: any) {
    return { success: false, error: err.message || "Error al realizar el ajuste de inventario." };
  }
}

export async function getInventoryMovements() {
  return await db.inventoryMovement.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      product: true,
      variant: true,
      user: true,
    },
    take: 100,
  });
}
