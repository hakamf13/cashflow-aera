import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const transactions = await prisma.transaction.findMany({
      where: { userId },
    });

    // 📅 TODAY
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTransactions = transactions.filter(
      (t) => new Date(t.date) >= today
    );

    const totalRevenue = todayTransactions.reduce(
      (sum, t) => sum + t.totalAmount,
      0
    );

    const totalProfit = todayTransactions.reduce(
      (sum, t) => sum + t.totalProfit,
      0
    );

    const totalTransactions = todayTransactions.length;

    // 💰 ALL TIME (UNTUK CARD)
    const income = transactions.reduce(
      (sum, t) => sum + t.totalAmount,
      0
    );

    const profit = transactions.reduce(
      (sum, t) => sum + t.totalProfit,
      0
    );

    const expense = income - profit;
    const sharing = profit * 0.05;
    const netProfit = profit - sharing;

    // 📊 LAST 7 DAYS
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);

      const dayStr = d.toISOString().split("T")[0];

      const daily = transactions.filter(
        (t) =>
          new Date(t.date).toISOString().split("T")[0] === dayStr
      );

      return {
        date: dayStr,
        revenue: daily.reduce((s, t) => s + t.totalAmount, 0),
        profit: daily.reduce((s, t) => s + t.totalProfit, 0),
      };
    }).reverse();

    return NextResponse.json({
      // 🔹 summary today
      totalRevenue,
      totalProfit,
      totalTransactions,

      // 🔹 financial breakdown
      income,
      expense,
      profit,
      sharing,
      netProfit,

      // 🔹 chart
      chart: last7Days,
    });
  } catch (error) {
    console.error("DASHBOARD ERROR:", error);

    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}