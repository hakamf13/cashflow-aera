import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { amount, description, date } = body;

    if (!amount) {
      return NextResponse.json(
        { success: false, message: "Amount required" },
        { status: 400 }
      );
    }

    const expense = await prisma.cashflow.create({
      data: {
        userId: session.user.id,
        type: "OUT", // 🔥 EXPENSE
        amount: Number(amount),
        description: description || "Expense",
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: expense,
    });
  } catch (error) {
    console.error("CREATE EXPENSE ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Internal error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await prisma.cashflow.findMany({
      where: {
        userId: session.user.id,
        type: "OUT",
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}