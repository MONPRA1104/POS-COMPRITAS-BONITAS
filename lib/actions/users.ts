"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { getAuthSession } from "@/lib/auth";

export async function createUser(formData: FormData) {
  const session = await getAuthSession();
  if (!session || session.user.role !== "ADMIN") {
    return { error: "No tienes permisos de Administrador." };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  if (!name || !email || !password || !role) {
    return { error: "Todos los campos son obligatorios." };
  }

  try {
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return { error: "Ya existe un usuario con este correo." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const isAdmin = role === "ADMIN";

    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        canAccessPOS: true, // Everyone gets POS by default
        canAccessInventory: isAdmin,
        canAccessCustomers: isAdmin,
        canAccessExpenses: isAdmin,
        canAccessReports: isAdmin,
        canAccessSettings: isAdmin,
      },
    });

    revalidatePath("/configuracion");
    return { success: true };
  } catch (error) {
    return { error: "Error interno al crear el usuario." };
  }
}

export async function updateUserPassword(formData: FormData) {
  const session = await getAuthSession();
  if (!session) return { error: "No autorizado." };

  const userId = formData.get("userId") as string;
  const newPassword = formData.get("newPassword") as string;

  if (!userId || !newPassword) return { error: "Datos incompletos." };

  if (session.user.role !== "ADMIN" && session.user.id !== userId) {
    return { error: "Solo puedes cambiar tu propia contraseña o necesitas ser ADMIN." };
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
    return { success: true };
  } catch (error) {
    return { error: "Error al actualizar la contraseña." };
  }
}

export async function updateUserPermissions(userId: string, permissions: any) {
  const session = await getAuthSession();
  if (!session || session.user.role !== "ADMIN") return { error: "No autorizado." };

  try {
    await db.user.update({
      where: { id: userId },
      data: {
        canAccessPOS: permissions.canAccessPOS,
        canAccessInventory: permissions.canAccessInventory,
        canAccessCustomers: permissions.canAccessCustomers,
        canAccessExpenses: permissions.canAccessExpenses,
        canAccessReports: permissions.canAccessReports,
        canAccessSettings: permissions.canAccessSettings,
      },
    });
    revalidatePath("/configuracion");
    return { success: true };
  } catch (error) {
    return { error: "Error al actualizar los permisos." };
  }
}
