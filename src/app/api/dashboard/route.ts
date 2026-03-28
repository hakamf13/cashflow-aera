import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) throw new Error("User not found");

    const [income, profit, expense] = await Promise.all([
      prisma.cashflow.aggregate({
        where: {
          userId: user.id,
          type: "IN",
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          userId: user.id,
        },
        _sum: { totalProfit: true },
      }),
      prisma.cashflow.aggregate({
        where: {
          userId: user.id,
          type: "OUT",
        },
        _sum: { amount: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        income: income._sum.amount || 0,
        profit: profit._sum.totalProfit || 0,
        expense: expense._sum.amount || 0,
        balance:
          (income._sum.amount || 0) -
          (expense._sum.amount || 0),
      },
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}