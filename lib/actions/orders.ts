"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getOrders(statusFilter?: string) {
  const whereClause: any = {};
  if (statusFilter && statusFilter !== "ALL") {
    whereClause.status = statusFilter;
  }
  return await db.order.findMany({
    where: whereClause,
    include: {
      customer: true,
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export interface CreateOrderInput {
  customerId: string;
  whatsappRef?: string;
  deliveryType: "PICKUP" | "SHIPPING" | "PERSONAL";
  recipientName?: string;
  recipientPhone?: string;
  shippingAddress?: string;
  neighborhood?: string;
  city?: string;
  postalCode?: string;
  addressReferences?: string;
  shippingCost: number;
  courierCompany?: string;
  trackingNumber?: string;
  notes?: string;
  items: {
    productId: string;
    variantId?: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export async function createOrder(input: CreateOrderInput) {
  try {
    const count = await db.order.count();
    const nextNum = (count + 1).toString().padStart(3, "0");
    const year = new Date().getFullYear();
    const orderNumber = `WA-${year}-${nextNum}`;

    let totalItems = 0;
    const itemsToCreate = [];

    for (const item of input.items) {
      const prod = await db.product.findUnique({ where: { id: item.productId } });
      if (!prod) throw new Error("Producto no encontrado.");

      let varName = null;
      let sku = prod.sku;

      if (item.variantId) {
        const variant = await db.productVariant.findUnique({ where: { id: item.variantId } });
        if (variant) {
          varName = `Talla ${variant.size || ""} / Color ${variant.color || ""}`;
          sku = variant.sku;
        }
      }

      const itemSubtotal = item.unitPrice * item.quantity;
      totalItems += itemSubtotal;

      itemsToCreate.push({
        productId: item.productId,
        variantId: item.variantId || null,
        productName: prod.name,
        variantName: varName,
        sku,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        subtotal: itemSubtotal,
      });
    }

    const grandTotal = totalItems + (input.shippingCost || 0);

    const order = await db.order.create({
      data: {
        orderNumber,
        customerId: input.customerId,
        whatsappRef: input.whatsappRef || orderNumber,
        status: "NUEVO",
        deliveryType: input.deliveryType,
        recipientName: input.recipientName,
        recipientPhone: input.recipientPhone,
        shippingAddress: input.shippingAddress,
        neighborhood: input.neighborhood,
        city: input.city,
        postalCode: input.postalCode,
        addressReferences: input.addressReferences,
        shippingCost: input.shippingCost || 0,
        courierCompany: input.courierCompany,
        trackingNumber: input.trackingNumber,
        notes: input.notes,
        total: grandTotal,
        items: {
          create: itemsToCreate,
        },
      },
    });

    revalidatePath("/pedidos");
    return { success: true, data: order };
  } catch (err: any) {
    return { success: false, error: err.message || "Error al crear el pedido." };
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: "NUEVO" | "CONFIRMADO" | "PREPARANDO" | "LISTO_PARA_RECOGER" | "ENVIADO" | "ENTREGADO" | "CANCELADO" | "DEVUELTO",
  trackingInfo?: { courierCompany?: string; trackingNumber?: string }
) {
  try {
    const updated = await db.order.update({
      where: { id: orderId },
      data: {
        status,
        courierCompany: trackingInfo?.courierCompany,
        trackingNumber: trackingInfo?.trackingNumber,
      },
    });
    revalidatePath("/pedidos");
    return { success: true, data: updated };
  } catch (err: any) {
    return { success: false, error: err.message || "Error al actualizar estado del pedido." };
  }
}
