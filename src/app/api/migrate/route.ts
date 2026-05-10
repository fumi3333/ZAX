import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export async function GET() {
  try {
    // Add the missing column for 768-dimensional embeddings
    await prisma.$executeRaw`ALTER TABLE "essence_vectors" ADD COLUMN "embedding" vector(768);`;
    return NextResponse.json({ success: true, message: 'Column added successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
