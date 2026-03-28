import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { items, paymentMethodId, note } = body;

    const user = await prisma.user.findFirst();
    if (!user) throw new Error("User not found");

    let totalAmount = 0;
    let totalProfit = 0;

    // hitung total
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) throw new Error("Product not found");

      const subtotal = product.priceSell * item.quantity;
      const profit =
        (product.priceSell - product.priceCost) * item.quantity;

      totalAmount += subtotal;
      totalProfit += profit;
    }

    // buat transaksi
    const transaction = 
    await prisma.transaction.create({
      data: {
        userId: user.id,
        date: new Date(),
        totalAmount,
        totalProfit,
        paymentMethodId,
        note,
        items: {
          create: await Promise.all(
            items.map(async (item: { productId: any; quantity: number; }) => {
              const product = await prisma.product.findUnique({
                where: { id: item.productId },
              });

              return {
                productId: item.productId,
                quantity: item.quantity,
                priceSell: product!.priceSell,
                priceCost: product!.priceCost,
                subtotal: product!.priceSell * item.quantity,
                profit:
                  (product!.priceSell - product!.priceCost) *
                  item.quantity,
              };
            })
          ),
        },
      },
    });

    await prisma.cashflow.create({
        data: {
            userId: user.id,
            type: "IN",
            amount: totalAmount,
            date: new Date(),
            note: "Income from transaction",
            referenceId: transaction.id,
        },
    });

    // update stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: transaction,
    });
  } catch (error: any) {
    console.error("TRANSACTION ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const start = searchParams.get("start");
    const end = searchParams.get("end");

    const user = await prisma.user.findFirst();
    if (!user) throw new Error("User not found");

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        ...(start && end
          ? {
              date: {
                gte: new Date(start),
                lte: new Date(end),
              },
            }
          : {}),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: transactions,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

