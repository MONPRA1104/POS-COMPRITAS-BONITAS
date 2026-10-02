"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getCategories() {
  return await db.category.findMany({
    orderBy: { name: "asc" },
  });
}

export async function createCategory(name: string, description?: string) {
  try {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    const category = await db.category.create({
      data: { name, slug, description },
    });
    revalidatePath("/productos");
    return { success: true, data: category };
  } catch (err: any) {
    return { success: false, error: err.message || "Error al crear la categoría." };
  }
}

export async function getProducts(search?: string, categoryId?: string) {
  const whereClause: any = { active: true };
  
  if (categoryId && categoryId !== "ALL") {
    whereClause.categoryId = categoryId;
  }

  if (search && search.trim().length > 0) {
    whereClause.OR = [
      { name: { contains: search } },
      { sku: { contains: search } },
      { brand: { contains: search } },
    ];
  }

  return await db.product.findMany({
    where: whereClause,
    include: {
      category: true,
      variants: { where: { active: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export interface ProductInput {
  sku: string;
  name: string;
  description?: string;
  categoryId: string;
  brand?: string;
  cost: number;
  price: number;
  stock: number;
  minStock: number;
  image?: string;
  hasVariants: boolean;
  variants?: {
    sku: string;
    size?: string;
    color?: string;
    stock: number;
    cost: number;
    price: number;
    minStock: number;
  }[];
}

export async function createProduct(input: ProductInput) {
  try {
    const existingSku = await db.product.findUnique({ where: { sku: input.sku } });
    if (existingSku) {
      return { success: false, error: `El SKU "${input.sku}" ya está registrado en otro producto.` };
    }

    const activeUser = await db.user.findFirst({ where: { active: true } });

    const result = await db.$transaction(async (tx) => {
      let totalStock = input.stock;

      if (input.hasVariants && input.variants && input.variants.length > 0) {
        totalStock = input.variants.reduce((sum, v) => sum + v.stock, 0);
      }

      const product = await tx.product.create({
        data: {
          sku: input.sku,
          name: input.name,
          description: input.description,
          categoryId: input.categoryId,
          brand: input.brand,
          cost: input.cost,
          price: input.price,
          stock: totalStock,
          minStock: input.minStock,
          image: input.image,
          hasVariants: input.hasVariants,
          variants: input.hasVariants && input.variants ? {
            create: input.variants.map((v) => ({
              sku: v.sku,
              size: v.size,
              color: v.color,
              stock: v.stock,
              cost: v.cost,
              price: v.price,
              minStock: v.minStock,
            })),
          } : undefined,
        },
        include: { variants: true },
      });

      // Record initial inventory movement if stock > 0
      if (activeUser && totalStock > 0) {
        await tx.inventoryMovement.create({
          data: {
            productId: product.id,
            type: "ENTRADA",
            quantity: totalStock,
            previousStock: 0,
            newStock: totalStock,
            userId: activeUser.id,
            reason: "Alta inicial de producto",
          },
        });
      }

      return product;
    });

    revalidatePath("/productos");
    revalidatePath("/inventario");
    revalidatePath("/ventas/nueva");
    return { success: true, data: result };
  } catch (err: any) {
    return { success: false, error: err.message || "Error al registrar el producto." };
  }
}
