import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    const userId = session.user.id;

    const { items, paymentMethodId, note } = await req.json();

    let totalAmount = 0;
    let totalProfit = 0;

    // 🔥 ambil semua product sekali
    const productIds = items.map((i: any) => i.productId);

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = Object.fromEntries(
      products.map((p) => [p.id, p])
    );

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        date: new Date(),
        totalAmount: 0,
        totalProfit: 0,
        paymentMethodId,
        note,
        items: {
          create: items.map((item: any) => {
            const product = productMap[item.productId];
            if (!product) throw new Error("Product not found");

            const subtotal = product.priceSell * item.quantity;
            const profit =
              (product.priceSell - product.priceCost) *
              item.quantity;

            totalAmount += subtotal;
            totalProfit += profit;

            return {
              productId: item.productId,
              quantity: item.quantity,
              priceSell: product.priceSell,
              priceCost: product.priceCost,
              subtotal,
              profit,
            };
          }),
        },
      },
    });

    // update total setelah create
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { totalAmount, totalProfit },
    });

    // cashflow
    await prisma.cashflow.create({
      data: {
        userId,
        type: "IN",
        amount: totalAmount,
        date: new Date(),
        note: "Income from transaction",
        referenceId: transaction.id,
      },
    });

    // update stock
    await Promise.all(
      items.map((item: any) =>
        prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
          },
        })
      )
    );

    const fullTransaction = await prisma.transaction.findUnique({
      where: { id: transaction.id },
      include: {
        paymentMethod: true,
        items: {
          include: { product: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: fullTransaction,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    const transactions = await prisma.transaction.findMany({
      where: { userId: session.user.id },
      include: {
        paymentMethod: true, // 🔥 INI YANG KURANG
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

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    const userId = session.user.id;

    const { id } = await req.json();

    const trx = await prisma.transaction.findFirst({
      where: { id, userId }, // 🔥 pastikan milik user
      include: { items: true },
    });

    if (!trx) throw new Error("Transaction not found");

    // 🔄 BALIKKAN STOCK
    await Promise.all(
      trx.items.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity },
          },
        })
      )
    );

    // 💰 HAPUS CASHFLOW
    await prisma.cashflow.deleteMany({
      where: { referenceId: id },
    });

    // ❌ HAPUS TRANSACTION
    await prisma.transaction.delete({
      where: { id },
    });

    return Response.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return Response.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}