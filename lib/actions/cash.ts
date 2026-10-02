"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getCurrentCashRegister() {
  try {
    const activeRegister = await db.cashRegister.findFirst({
      where: { status: "OPEN" },
      include: {
        openedByUser: true,
        cashMovements: {
          orderBy: { createdAt: "desc" },
          include: { user: true },
        },
      },
    });
    return activeRegister;
  } catch (err) {
    console.error("Error fetching current cash register:", err);
    return null;
  }
}

export async function openCashRegister(initialFund: number, notes?: string) {
  try {
    const existingOpen = await db.cashRegister.findFirst({
      where: { status: "OPEN" },
    });

    if (existingOpen) {
      return { success: false, error: "Ya existe una caja abierta en este momento." };
    }

    const activeUser = await db.user.findFirst({ where: { active: true } });
    if (!activeUser) return { success: false, error: "No se encontró usuario activo." };

    const register = await db.$transaction(async (tx) => {
      const reg = await tx.cashRegister.create({
        data: {
          openedByUserId: activeUser.id,
          openedAt: new Date(),
          initialFund: initialFund,
          expectedCash: initialFund,
          status: "OPEN",
          notes: notes,
        },
      });

      // Initial movement
      await tx.cashMovement.create({
        data: {
          cashRegisterId: reg.id,
          userId: activeUser.id,
          type: "INGRESO_MANUAL",
          amount: initialFund,
          paymentMethod: "EFECTIVO",
          note: `Fondo inicial de caja: $${initialFund.toFixed(2)} MXN`,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: activeUser.id,
          action: "APERTURA_CAJA",
          entity: "CashRegister",
          entityId: reg.id,
          newValues: JSON.stringify({ initialFund }),
        },
      });

      return reg;
    });

    revalidatePath("/caja");
    revalidatePath("/ventas/nueva");
    return { success: true, data: register };
  } catch (err: any) {
    return { success: false, error: err.message || "Error al abrir la caja." };
  }
}

export async function addCashMovement(input: {
  type: "GASTO" | "RETIRO" | "INGRESO_MANUAL";
  amount: number;
  paymentMethod: "EFECTIVO" | "TARJETA" | "TRANSFERENCIA" | "MERCADO_PAGO" | "OTRO";
  note: string;
}) {
  try {
    const activeRegister = await db.cashRegister.findFirst({
      where: { status: "OPEN" },
    });

    if (!activeRegister) {
      return { success: false, error: "No hay una caja abierta para registrar movimientos." };
    }

    const activeUser = await db.user.findFirst({ where: { active: true } });
    if (!activeUser) return { success: false, error: "Usuario no activo." };

    const result = await db.$transaction(async (tx) => {
      const movement = await tx.cashMovement.create({
        data: {
          cashRegisterId: activeRegister.id,
          userId: activeUser.id,
          type: input.type,
          amount: input.amount,
          paymentMethod: input.paymentMethod,
          note: input.note,
        },
      });

      // If payment is EFECTIVO, update expected cash in register
      if (input.paymentMethod === "EFECTIVO") {
        const delta = input.type === "INGRESO_MANUAL" ? input.amount : -input.amount;
        await tx.cashRegister.update({
          where: { id: activeRegister.id },
          data: {
            expectedCash: { increment: delta },
          },
        });
      }

      return movement;
    });

    revalidatePath("/caja");
    return { success: true, data: result };
  } catch (err: any) {
    return { success: false, error: err.message || "Error al registrar movimiento de caja." };
  }
}

export async function closeCashRegister(countedCash: number, notes?: string) {
  try {
    const activeRegister = await db.cashRegister.findFirst({
      where: { status: "OPEN" },
    });

    if (!activeRegister) {
      return { success: false, error: "No hay ninguna caja abierta para cerrar." };
    }

    const activeUser = await db.user.findFirst({ where: { active: true } });
    if (!activeUser) return { success: false, error: "Usuario no activo." };

    const difference = countedCash - activeRegister.expectedCash;

    // Require reason note if difference is non-zero
    if (Math.abs(difference) > 0.01 && (!notes || notes.trim().length === 0)) {
      return {
        success: false,
        error: `Existe una diferencia de ${difference < 0 ? "Faltante" : "Sobrante"} ($${Math.abs(
          difference
        ).toFixed(2)} MXN). Debe escribir el motivo de la diferencia.`,
      };
    }

    const closed = await db.$transaction(async (tx) => {
      const reg = await tx.cashRegister.update({
        where: { id: activeRegister.id },
        data: {
          closedByUserId: activeUser.id,
          closedAt: new Date(),
          countedCash: countedCash,
          difference: difference,
          status: "CLOSED",
          notes: notes,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: activeUser.id,
          action: "CIERRE_CAJA",
          entity: "CashRegister",
          entityId: reg.id,
          oldValues: JSON.stringify({ status: "OPEN", expectedCash: activeRegister.expectedCash }),
          newValues: JSON.stringify({ status: "CLOSED", countedCash, difference }),
        },
      });

      return reg;
    });

    revalidatePath("/caja");
    revalidatePath("/ventas/nueva");
    revalidatePath("/dashboard");
    return { success: true, data: closed };
  } catch (err: any) {
    return { success: false, error: err.message || "Error al cerrar la caja." };
  }
}
