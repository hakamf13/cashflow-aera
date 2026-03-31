import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const methods = await prisma.paymentMethod.findMany();

    return NextResponse.json({
      success: true,
      data: methods,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message,
    });
  }
}