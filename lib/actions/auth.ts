"use server";

import { db } from "@/lib/db";
import { setAuthSession, clearAuthSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "El correo y la contraseña son obligatorios." };
  }

  try {
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user || !user.active) {
      return { error: "Credenciales inválidas o cuenta desactivada." };
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return { error: "Credenciales inválidas." };
    }

    // Set secure HTTP-only cookie session
    await setAuthSession({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      // Pass permissions into session
      canAccessPOS: user.canAccessPOS,
      canAccessInventory: user.canAccessInventory,
      canAccessCustomers: user.canAccessCustomers,
      canAccessExpenses: user.canAccessExpenses,
      canAccessReports: user.canAccessReports,
      canAccessSettings: user.canAccessSettings,
    });

    return { success: true };
  } catch (error) {
    console.error("Login Error:", error);
    return { error: "Error en el servidor al intentar iniciar sesión." };
  }
}

export async function logoutAction() {
  await clearAuthSession();
  redirect("/login");
}
