import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextRequest } from "next/server";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // 🔥 FIX DI SINI
) {
  const { id } = await context.params; // 🔥 WAJIB DI-AWAIT

  try {
    console.log("🆔 DELETE ID:", id);

    const session = await getServerSession(authOptions);
    console.log("👤 SESSION:", session);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 }
      );
    }

    if (transaction.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    await prisma.transaction.delete({
      where: { id },
    });

    console.log("✅ DELETE SUCCESS");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("🔥 DELETE ERROR:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}