/**
 * 全ユーザーのEmailを表示してs2527084を特定するスクリプト
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

async function main() {
  console.log('\n=== 全ユーザーメールアドレス表示 ===\n');
  
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { diagnostics: true, vectors: true } }
    }
  });

  for (const u of users) {
    const tag = u.email.includes('@zax.guest') ? '[GUEST]' : '[USER ]';
    console.log(`${tag} email: ${u.email}`);
    console.log(`       id:    ${u.id}`);
    console.log(`       診断=${u._count.diagnostics}件 | ベクトル=${u._count.vectors}件`);
    console.log(`       作成: ${new Date(u.createdAt).toLocaleString('ja-JP')}\n`);
  }

  // 最も診断回数が多いゲストの詳細
  const guestUser = await prisma.user.findFirst({
    where: { email: { contains: '@zax.guest' } },
    include: {
      diagnostics: {
        orderBy: { createdAt: 'asc' },
        select: { id: true, createdAt: true, synthesis: true }
      },
      vectors: {
        orderBy: { createdAt: 'asc' },
        select: { id: true, createdAt: true, statsVector: true, reasoning: true }
      }
    }
  });

  if (guestUser) {
    console.log('\n=== ゲストユーザーの詳細診断履歴 ===');
    console.log(`email: ${guestUser.email}`);
    console.log(`診断 ${guestUser.diagnostics.length}件\n`);
    
    for (const [i, d] of guestUser.diagnostics.entries()) {
      console.log(`[診断${i+1}] ${new Date(d.createdAt).toLocaleString('ja-JP')}`);
      console.log(`  synthesis: ${d.synthesis.substring(0, 200).replace(/\n/g,' ')}...\n`);
    }

    console.log(`\nEssenceVector ${guestUser.vectors.length}件\n`);
    for (const [i, v] of guestUser.vectors.entries()) {
      const s = v.statsVector ? JSON.parse(v.statsVector) : null;
      console.log(`[V${i+1}] ${new Date(v.createdAt).toLocaleString('ja-JP')}`);
      if (s) console.log(`  6次元: 論理=${s[0]} 直感=${s[1]} 共感=${s[2]} 意志=${s[3]} 創造=${s[4]} 柔軟=${s[5]}`);
      console.log(`  reasoning: ${v.reasoning.substring(0, 100)}`);
    }
  }
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
