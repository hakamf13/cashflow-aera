import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const [income, profit, expense] = await Promise.all([
      prisma.cashflow.aggregate({
        where: { userId, type: "IN" },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId },
        _sum: { totalProfit: true },
      }),
      prisma.cashflow.aggregate({
        where: { userId, type: "OUT" },
        _sum: { amount: true },
      }),
    ]);

    const totalProfit = profit._sum.totalProfit || 0;
    const sharing = totalProfit * 0.05;
    const netProfit = totalProfit - sharing;

    return NextResponse.json({
      success: true,
      data: {
        income: income._sum.amount || 0,
        expense: expense._sum.amount || 0,
        profit: totalProfit,
        sharing,
        netProfit,
        balance:
          (income._sum.amount || 0) -
          (expense._sum.amount || 0),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}