import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";


export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  try {
    console.log("🆔 DELETE ID:", id);

    const session = await getServerSession(authOptions);
    console.log("👤 SESSION:", session);

    // ❌ belum login
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    // ❌ tidak ditemukan
    if (!transaction) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 }
      );
    }

    // ❌ bukan milik user
    if (transaction.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // ✅ DELETE (items auto cascade)
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