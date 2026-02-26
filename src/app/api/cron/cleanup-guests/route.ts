import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 削除対象: 30日以上前のゲストユーザー
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // prisma.user の型が Any の場合を考慮
    const p = prisma as { user?: { deleteMany: (args: any) => Promise<any> } };
    
    if (p.user) {
      const result = await p.user.deleteMany({
        where: {
          id: { startsWith: 'guest_' },
          createdAt: { lt: thirtyDaysAgo },
        },
      });

      return NextResponse.json({ 
          success: true, 
          message: `Deactivated ${result.count} stale guest accounts.` 
      });
    }

    return NextResponse.json({ success: true, message: 'User table not ready.' });

  } catch (error) {
    console.error('Guest cleanup cron error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
