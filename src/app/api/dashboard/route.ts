import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 📅 TODAY RANGE
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 🔥 PARALLEL QUERY
    const [income, expense, profit, modal, todayTransactions] =
      await Promise.all([
        prisma.cashflow.aggregate({
          where: { userId, type: "IN" },
          _sum: { amount: true },
        }),
        prisma.cashflow.aggregate({
          where: { userId, type: "OUT" },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: { userId },
          _sum: { totalProfit: true },
        }),
        prisma.cashflow.aggregate({
          where: { userId, type: "MODAL" },
          _sum: { amount: true },
        }),

        // 🔥 langsung filter di DB (lebih efisien)
        prisma.transaction.findMany({
          where: {
            userId,
            date: {
              gte: today,
            },
          },
        }),
      ]);

    // 💰 TOTAL ALL TIME
    const totalIncome = income._sum.amount || 0;
    const totalExpense = expense._sum.amount || 0;
    const totalProfit = profit._sum.totalProfit || 0;
    const totalModal = modal._sum.amount || 0;

    const sharing = totalProfit * 0.05;
    const netProfit = totalProfit - sharing;

    // 🔥 FIX LOGIC (pakai modal)
    const balance = totalModal + totalIncome - totalExpense;

    // 📅 TODAY DATA
    const totalRevenueToday = todayTransactions.reduce(
      (sum, t) => sum + t.totalAmount,
      0
    );

    const totalProfitToday = todayTransactions.reduce(
      (sum, t) => sum + t.totalProfit,
      0
    );

    const totalTransactionToday = todayTransactions.length;

    return NextResponse.json({
      success: true,
      data: {
        // 🔹 today
        totalRevenue: totalRevenueToday,
        totalProfit: totalProfitToday,
        totalTransactions: totalTransactionToday,

        // 🔹 all time
        modal: totalModal, // ✅ NEW
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