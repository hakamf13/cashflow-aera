import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // 🔥 FIX: jangan throw
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
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

    const totalIncome = income._sum.amount || 0;
    const totalExpense = expense._sum.amount || 0;
    const totalProfit = profit._sum.totalProfit || 0;

    const sharing = totalProfit * 0.05;
    const netProfit = totalProfit - sharing;
    const balance = totalIncome - totalExpense;

    return NextResponse.json({
      success: true,
      data: {
        income: totalIncome,
        expense: totalExpense,
        profit: totalProfit,
        sharing,
        netProfit,
        balance,
      },
    });
  } catch (error) {
    console.error("DASHBOARD ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Internal error" },
      { status: 500 }
    );
  }
}