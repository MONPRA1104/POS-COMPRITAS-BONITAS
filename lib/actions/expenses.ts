"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getExpenses() {
  return await db.expense.findMany({
    orderBy: { date: "desc" },
    include: { user: true },
  });
}

export interface CreateExpenseInput {
  concept: string;
  category: "MERCANCIA" | "ENVIOS" | "PUBLICIDAD" | "EMPAQUES" | "TRANSPORTE" | "SERVICIOS" | "OTROS";
  amount: number;
  paymentMethod: "EFECTIVO" | "TARJETA" | "TRANSFERENCIA" | "MERCADO_PAGO" | "OTRO";
  note?: string;
}

export async function createExpense(input: CreateExpenseInput) {
  try {
    const activeUser = await db.user.findFirst({ where: { active: true } });
    if (!activeUser) return { success: false, error: "Usuario no activo." };

    let openRegister = null;
    if (input.paymentMethod === "EFECTIVO") {
      openRegister = await db.cashRegister.findFirst({ where: { status: "OPEN" } });
    }

    const expense = await db.$transaction(async (tx) => {
      const exp = await tx.expense.create({
        data: {
          concept: input.concept,
          category: input.category,
          amount: input.amount,
          paymentMethod: input.paymentMethod,
          cashRegisterId: openRegister ? openRegister.id : null,
          userId: activeUser.id,
          date: new Date(),
          note: input.note,
        },
      });

      if (input.paymentMethod === "EFECTIVO" && openRegister) {
        await tx.cashMovement.create({
          data: {
            cashRegisterId: openRegister.id,
            userId: activeUser.id,
            type: "GASTO",
            amount: input.amount,
            paymentMethod: "EFECTIVO",
            note: `Gasto: ${input.concept}`,
          },
        });

        await tx.cashRegister.update({
          where: { id: openRegister.id },
          data: { expectedCash: { decrement: input.amount } },
        });
      }

      return exp;
    });

    revalidatePath("/gastos");
    revalidatePath("/caja");
    revalidatePath("/reportes");
    return { success: true, data: expense };
  } catch (err: any) {
    return { success: false, error: err.message || "Error al registrar gasto." };
  }
}
