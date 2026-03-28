import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import path from "path";

export async function GET(req: Request) {
  try {
    // 🔥 GET FILTER PARAM
    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    // 🔥 USER
    const user = await prisma.user.findFirst();
    if (!user) throw new Error("User not found");

    // 🔥 QUERY (PAKAI FILTER)
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

    // 🔥 LOAD FONT (ANTI HELVETICA ERROR)
    const fontPath = path.join(
      process.cwd(),
      "public/fonts/Roboto-Regular.ttf"
    );

    const doc = new PDFDocument({
      font: fontPath,
    });

    // 🔥 STREAM TO BUFFER
    const buffer = await new Promise<Buffer>((resolve) => {
      const data: Uint8Array[] = [];

      doc.on("data", (chunk) => data.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(data)));

      // ===== PDF CONTENT =====

      doc.fontSize(18).text("Transaction Report", {
        align: "center",
      });

      doc.moveDown();

      let totalIncome = 0;
      let totalProfit = 0;

      transactions.forEach((trx, index) => {
        totalIncome += trx.totalAmount;
        totalProfit += trx.totalProfit;

        doc
          .fontSize(12)
          .text(
            `${index + 1}. ${new Date(trx.date).toLocaleString()}`
          );

        doc.text(
          `Total: Rp ${trx.totalAmount.toLocaleString()} | Profit: Rp ${trx.totalProfit.toLocaleString()}`
        );

        trx.items.forEach((item) => {
          doc.text(
            ` - ${item.product.name} x${item.quantity} = Rp ${item.subtotal.toLocaleString()}`
          );
        });

        doc.moveDown();
      });

      doc.moveDown();

      doc
        .fontSize(14)
        .text(`Total Income: Rp ${totalIncome.toLocaleString()}`);

      doc
        .fontSize(14)
        .text(`Total Profit: Rp ${totalProfit.toLocaleString()}`);

      doc.end();
    });

    // 🔥 RETURN PDF
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          "attachment; filename=transactions.pdf",
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