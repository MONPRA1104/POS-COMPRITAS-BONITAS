"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getCustomers(search?: string) {
  const whereClause: any = {};
  if (search && search.trim().length > 0) {
    whereClause.OR = [
      { name: { contains: search } },
      { phone: { contains: search } },
      { whatsapp: { contains: search } },
    ];
  }
  return await db.customer.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
  });
}

export async function getCustomerById(id: string) {
  return await db.customer.findUnique({
    where: { id },
    include: {
      sales: {
        orderBy: { createdAt: "desc" },
        include: { items: true, payments: true },
      },
      orders: {
        orderBy: { createdAt: "desc" },
        include: { items: true },
      },
    },
  });
}

export interface CustomerInput {
  name: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  postalCode?: string;
  notes?: string;
}

export async function createCustomer(input: CustomerInput) {
  try {
    const customer = await db.customer.create({
      data: {
        ...input,
        whatsapp: input.whatsapp || input.phone,
      },
    });
    revalidatePath("/clientes");
    revalidatePath("/ventas/nueva");
    return { success: true, data: customer };
  } catch (err: any) {
    return { success: false, error: err.message || "Error al guardar cliente." };
  }
}
