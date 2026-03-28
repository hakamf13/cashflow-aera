import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET(req: Request) {
  try {
    // 🔥 Ambil query param (FILTER)
    const { searchParams } = new URL(req.url);

    const start = searchParams.get("start");
    const end = searchParams.get("end");

    // 🔥 Ambil user
    const user = await prisma.user.findFirst();
    if (!user) throw new Error("User not found");

    // 🔥 Query transaksi + filter tanggal
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

    // 🔥 Flatten data untuk Excel
    const rows: any[] = [];

    transactions.forEach((trx) => {
      trx.items.forEach((item) => {
        rows.push({
          Date: new Date(trx.date).toLocaleString(),
          Product: item.product.name,
          Quantity: item.quantity,
          PriceSell: item.priceSell,
          Subtotal: item.subtotal,
          Profit: item.profit,
          TotalTransaction: trx.totalAmount,
        });
      });
    });

    // 🔥 Create Excel
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    // 🔥 Return file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Disposition":
          "attachment; filename=transactions.xlsx",
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
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