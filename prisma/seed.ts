import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌸 Seeding Compritas Bonitas POS Database...");

  // 1. Business Settings
  await prisma.businessSettings.upsert({
    where: { id: "1" },
    update: {},
    create: {
      id: "1",
      storeName: "Compritas Bonitas",
      phone: "+52 55 1234 5678",
      address: "Atención por WhatsApp y Envíos a todo México",
      currency: "MXN",
      ticketHeader: "✨ COMPRITAS BONITAS ✨\nLencería, Ropa Interior y Detalles",
      ticketFooter: "¡Gracias por tu preferencia!\nWhatsApp: 55 1234 5678 | Instagram: @compritasbonitas",
    },
  });

  // 2. Users (Admin & Vendedor)
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@compritasbonitas.com" },
    update: {},
    create: {
      email: "admin@compritasbonitas.com",
      password: "admin123password", // In production: bcrypt hash
      name: "Administradora",
      role: "ADMIN",
    },
  });

  const sellerUser = await prisma.user.upsert({
    where: { email: "vendedora@compritasbonitas.com" },
    update: {},
    create: {
      email: "vendedora@compritasbonitas.com",
      password: "vendedora123password",
      name: "Vendedora Mostrador",
      role: "VENDEDOR",
    },
  });

  // 3. Categories
  const categories = [
    { name: "Lencería", slug: "lenceria", description: "Conjuntos, baby dolls y prendas de encaje" },
    { name: "Mujer", slug: "mujer", description: "Panties, bras y tops para dama" },
    { name: "Hombre", slug: "hombre", description: "Boxers y camisetas para caballero" },
    { name: "Niño", slug: "nino", description: "Ropa interior y trusas para niño" },
    { name: "Niña", slug: "nina", description: "Panties y tops para niña" },
    { name: "Calcetines", slug: "calcetines", description: "Tines, tinetas y calcetas decorativas" },
    { name: "Otros", slug: "otros", description: "Accesorios, empaques de regalo y detalles" },
  ];

  const catMap: Record<string, string> = {};
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    catMap[cat.name] = created.id;
  }

  // 4. Products & Variants (10 realistic items)
  const demoProducts = [
    {
      sku: "PROD-LENC-01",
      name: "Conjunto Encaje Elegante Rosa",
      description: "Conjunto de bra y panty de encaje suave con detalles dorados",
      categoryName: "Lencería",
      brand: "Compritas Bonitas Signature",
      cost: 120.0,
      price: 299.0,
      stock: 12,
      minStock: 4,
      image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=500&q=80",
      hasVariants: true,
      variants: [
        { sku: "PROD-LENC-01-M", size: "M", color: "Rosa", stock: 5, cost: 120.0, price: 299.0, minStock: 2 },
        { sku: "PROD-LENC-01-L", size: "L", color: "Rosa", stock: 4, cost: 120.0, price: 299.0, minStock: 2 },
        { sku: "PROD-LENC-01-XL", size: "XL", color: "Rosa", stock: 3, cost: 120.0, price: 299.0, minStock: 2 },
      ],
    },
    {
      sku: "PROD-LENC-02",
      name: "Baby Doll Saten y Encaje Negro",
      description: "Baby doll elegante de satén suave con copas de encaje",
      categoryName: "Lencería",
      brand: "Compritas Bonitas Signature",
      cost: 140.0,
      price: 349.0,
      stock: 8,
      minStock: 3,
      image: "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=500&q=80",
      hasVariants: true,
      variants: [
        { sku: "PROD-LENC-02-NEGRO-M", size: "M", color: "Negro", stock: 4, cost: 140.0, price: 349.0, minStock: 2 },
        { sku: "PROD-LENC-02-NEGRO-L", size: "L", color: "Negro", stock: 4, cost: 140.0, price: 349.0, minStock: 2 },
      ],
    },
    {
      sku: "PROD-MUJ-01",
      name: "Panty Seamless Algodón (Pack 3)",
      description: "Pack de 3 panties invisibles sin costura en colores pastel",
      categoryName: "Mujer",
      brand: "Comfort Touch",
      cost: 75.0,
      price: 180.0,
      stock: 25,
      minStock: 6,
      image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=500&q=80",
      hasVariants: true,
      variants: [
        { sku: "PROD-MUJ-01-CH", size: "CH", color: "Multicolor", stock: 8, cost: 75.0, price: 180.0, minStock: 2 },
        { sku: "PROD-MUJ-01-M", size: "M", color: "Multicolor", stock: 10, cost: 75.0, price: 180.0, minStock: 2 },
        { sku: "PROD-MUJ-01-G", size: "G", color: "Multicolor", stock: 7, cost: 75.0, price: 180.0, minStock: 2 },
      ],
    },
    {
      sku: "PROD-MUJ-02",
      name: "Bralette Sin Varilla Encaje Crema",
      description: "Top bralette súper cómodo sin varilla de encaje elástico",
      categoryName: "Mujer",
      brand: "Comfort Touch",
      cost: 65.0,
      price: 159.0,
      stock: 3, // Stock Bajo DEMO
      minStock: 5,
      image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=500&q=80",
      hasVariants: false,
      variants: [],
    },
    {
      sku: "PROD-HOMB-01",
      name: "Boxer Microfibra Hombre Premium",
      description: "Boxer ajustado de microfibra de alta transpirabilidad",
      categoryName: "Hombre",
      brand: "Men Active",
      cost: 50.0,
      price: 120.0,
      stock: 18,
      minStock: 5,
      image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=500&q=80",
      hasVariants: true,
      variants: [
        { sku: "BOXER-NEGRO-M", size: "M", color: "Negro", stock: 6, cost: 50.0, price: 120.0, minStock: 2 },
        { sku: "BOXER-NEGRO-L", size: "L", color: "Negro", stock: 6, cost: 50.0, price: 120.0, minStock: 2 },
        { sku: "BOXER-NEGRO-XL", size: "XL", color: "Negro", stock: 6, cost: 50.0, price: 120.0, minStock: 2 },
      ],
    },
    {
      sku: "PROD-HOMB-02",
      name: "Boxer Algodón Clásico Marino",
      description: "Boxer holgado de algodón suave color azul marino",
      categoryName: "Hombre",
      brand: "Men Active",
      cost: 45.0,
      price: 110.0,
      stock: 0, // AGOTADO DEMO
      minStock: 4,
      image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=500&q=80",
      hasVariants: false,
      variants: [],
    },
    {
      sku: "PROD-NINO-01",
      name: "Set 3 Trusas Niño Estampa Carritos",
      description: "Set de 3 trusas de algodón orgánico para niño",
      categoryName: "Niño",
      brand: "Kids Bonitos",
      cost: 60.0,
      price: 145.0,
      stock: 14,
      minStock: 3,
      image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=500&q=80",
      hasVariants: false,
      variants: [],
    },
    {
      sku: "PROD-NINA-01",
      name: "Top & Panty Niña Diseño Flores",
      description: "Divertido y cómodo conjunto de algodón para niña",
      categoryName: "Niña",
      brand: "Kids Bonitos",
      cost: 55.0,
      price: 135.0,
      stock: 11,
      minStock: 3,
      image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=500&q=80",
      hasVariants: false,
      variants: [],
    },
    {
      sku: "PROD-CALC-01",
      name: "Tines Invisibles Algodón Bambú (Pack 5)",
      description: "Tines invisibles con antideslizante de silicón en talón",
      categoryName: "Calcetines",
      brand: "Socks Soft",
      cost: 40.0,
      price: 99.0,
      stock: 30,
      minStock: 8,
      image: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=500&q=80",
      hasVariants: false,
      variants: [],
    },
    {
      sku: "PROD-OTRO-01",
      name: "Bolsa de Regalo Satinada Compritas Bonitas",
      description: "Bolsa elegante reutilizable con moño dorado para regalo",
      categoryName: "Otros",
      brand: "Compritas Bonitas",
      cost: 12.0,
      price: 35.0,
      stock: 50,
      minStock: 10,
      image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=500&q=80",
      hasVariants: false,
      variants: [],
    },
  ];

  for (const prodData of demoProducts) {
    const { categoryName, variants, ...prodFields } = prodData;
    const categoryId = catMap[categoryName];

    const product = await prisma.product.upsert({
      where: { sku: prodFields.sku },
      update: {},
      create: {
        ...prodFields,
        categoryId,
      },
    });

    if (variants && variants.length > 0) {
      for (const vData of variants) {
        await prisma.productVariant.upsert({
          where: { sku: vData.sku },
          update: {},
          create: {
            ...vData,
            productId: product.id,
          },
        });
      }
    }
  }

  // 5. Customers (including General Customer)
  const generalCustomer = await prisma.customer.upsert({
    where: { id: "c-general-0001" },
    update: {},
    create: {
      id: "c-general-0001",
      name: "CLIENTE MOSTRADOR (GENERAL)",
      phone: "",
      whatsapp: "",
      isGeneral: true,
      notes: "Cliente mostrador para ventas sin registro directo",
    },
  });

  const demoCustomers = [
    {
      id: "c-001",
      name: "Mariana López",
      phone: "5511223344",
      whatsapp: "5511223344",
      email: "mariana.lopez@example.com",
      address: "Av. Insurgentes Sur 123, Depto 4B",
      neighborhood: "Del Valle",
      city: "Ciudad de México",
      postalCode: "03100",
      totalPurchasesCount: 3,
      totalSpent: 1250.0,
    },
    {
      id: "c-002",
      name: "Sofia Ramírez",
      phone: "5588776655",
      whatsapp: "5588776655",
      email: "sofia.ramirez@example.com",
      address: "Calle Reforma 45",
      neighborhood: "Juárez",
      city: "Ciudad de México",
      postalCode: "06600",
      totalPurchasesCount: 1,
      totalSpent: 349.0,
    },
    {
      id: "c-003",
      name: "Carlos Mendoza",
      phone: "5544332211",
      whatsapp: "5544332211",
      email: "carlos.mendoza@example.com",
      address: "Calle Durango 88",
      neighborhood: "Roma Norte",
      city: "Ciudad de México",
      postalCode: "06700",
      totalPurchasesCount: 2,
      totalSpent: 480.0,
    },
    {
      id: "c-004",
      name: "Valeria Fernández",
      phone: "5599887766",
      whatsapp: "5599887766",
      email: "valeria.f@example.com",
      address: "Calle Homero 202",
      neighborhood: "Polanco",
      city: "Ciudad de México",
      postalCode: "11560",
      totalPurchasesCount: 0,
      totalSpent: 0.0,
    },
  ];

  for (const cust of demoCustomers) {
    await prisma.customer.upsert({
      where: { id: cust.id },
      update: {},
      create: cust,
    });
  }

  // 6. Open Cash Register Session
  const openRegister = await prisma.cashRegister.create({
    data: {
      openedByUserId: adminUser.id,
      openedAt: new Date(),
      initialFund: 500.0,
      expectedCash: 500.0,
      status: "OPEN",
      notes: "Apertura de caja matutina con $500.00 MXN en cambio",
    },
  });

  // 7. Initial Cash Movement
  await prisma.cashMovement.create({
    data: {
      cashRegisterId: openRegister.id,
      userId: adminUser.id,
      type: "INGRESO_MANUAL",
      amount: 500.0,
      paymentMethod: "EFECTIVO",
      note: "Fondo inicial de caja",
    },
  });

  // 8. Sample Sales
  const sampleProduct = await prisma.product.findFirst({ where: { sku: "PROD-LENC-01" } });
  const sampleVariant = await prisma.productVariant.findFirst({ where: { sku: "PROD-LENC-01-M" } });

  if (sampleProduct) {
    const sale1 = await prisma.sale.create({
      data: {
        saleNumber: "CB-000001",
        customerId: "c-001",
        cashRegisterId: openRegister.id,
        userId: sellerUser.id,
        status: "COMPLETED",
        subtotal: 299.0,
        discount: 0.0,
        shippingCost: 0.0,
        total: 299.0,
        deliveryType: "PICKUP",
        historicalCostSum: 120.0,
        notes: "Venta directa en mostrador",
        items: {
          create: [
            {
              productId: sampleProduct.id,
              variantId: sampleVariant?.id,
              productName: sampleProduct.name,
              variantName: sampleVariant ? `Talla ${sampleVariant.size} - ${sampleVariant.color}` : null,
              sku: sampleVariant ? sampleVariant.sku : sampleProduct.sku,
              unitCost: 120.0,
              unitPrice: 299.0,
              quantity: 1,
              subtotal: 299.0,
            },
          ],
        },
        payments: {
          create: [
            {
              paymentMethod: "EFECTIVO",
              amount: 299.0,
            },
          ],
        },
      },
    });

    // Register Cash movement for Sale 1
    await prisma.cashMovement.create({
      data: {
        cashRegisterId: openRegister.id,
        userId: sellerUser.id,
        type: "VENTA",
        amount: 299.0,
        paymentMethod: "EFECTIVO",
        referenceId: sale1.id,
        note: `Venta en efectivo Folio ${sale1.saleNumber}`,
      },
    });

    // Update expected cash in register
    await prisma.cashRegister.update({
      where: { id: openRegister.id },
      data: { expectedCash: 500.0 + 299.0 },
    });

    // Inventory movement
    await prisma.inventoryMovement.create({
      data: {
        productId: sampleProduct.id,
        variantId: sampleVariant?.id,
        type: "VENTA",
        quantity: 1,
        previousStock: 6,
        newStock: 5,
        userId: sellerUser.id,
        reason: `Venta Folio ${sale1.saleNumber}`,
        referenceId: sale1.id,
      },
    });
  }

  // 9. Sample WhatsApp Order
  await prisma.order.create({
    data: {
      orderNumber: "WA-2026-001",
      customerId: "c-002",
      whatsappRef: "WA-MARIANA-LENCERIA",
      status: "PREPARANDO",
      deliveryType: "SHIPPING",
      recipientName: "Sofia Ramírez",
      recipientPhone: "5588776655",
      shippingAddress: "Calle Reforma 45",
      neighborhood: "Juárez",
      city: "Ciudad de México",
      postalCode: "06600",
      shippingCost: 80.0,
      courierCompany: "Estafeta / Local",
      notes: "Entregar en horario de oficina",
      total: 429.0,
      items: {
        create: [
          {
            productId: sampleProduct?.id || "",
            productName: sampleProduct?.name || "Baby Doll Saten",
            sku: sampleProduct?.sku || "PROD-LENC-02",
            unitPrice: 349.0,
            quantity: 1,
            subtotal: 349.0,
          },
        ],
      },
    },
  });

  // 10. Sample Expense
  await prisma.expense.create({
    data: {
      concept: "Caja de bolsas de regalo satinadas rosadas (100 pzas)",
      category: "EMPAQUES",
      amount: 350.0,
      paymentMethod: "EFECTIVO",
      cashRegisterId: openRegister.id,
      userId: adminUser.id,
      date: new Date(),
      note: "Compra a proveedor de empaques local",
    },
  });

  // Register Cash Movement for Expense
  await prisma.cashMovement.create({
    data: {
      cashRegisterId: openRegister.id,
      userId: adminUser.id,
      type: "GASTO",
      amount: 350.0,
      paymentMethod: "EFECTIVO",
      note: "Gasto en empaques",
    },
  });

  // Update expected cash in register after expense
  await prisma.cashRegister.update({
    where: { id: openRegister.id },
    data: { expectedCash: 500.0 + 299.0 - 350.0 },
  });

  console.log("🌸 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
