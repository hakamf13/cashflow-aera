import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
    throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
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

    const fontPath = path.join(
      process.cwd(),
      "public/fonts/Roboto-Regular.ttf"
    );

    const doc = new PDFDocument({
      font: fontPath,
    });

    const buffer = await new Promise<Buffer>((resolve) => {
      const data: Uint8Array[] = [];

      doc.on("data", (chunk) => data.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(data)));

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

      doc.text(`Total Income: Rp ${totalIncome.toLocaleString()}`);
      doc.text(`Total Profit: Rp ${totalProfit.toLocaleString()}`);

      doc.end();
    });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          "attachment; filename=transactions.pdf",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}