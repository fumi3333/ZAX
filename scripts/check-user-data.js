/**
 * ユーザーデータ確認スクリプト (純粋 JavaScript 版)
 * Node.js で直接実行する
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function main() {
  console.log('\n=== ZAX ユーザーデータ確認 ===\n');

  // 1. 全ユーザー一覧（最新30件）
  console.log('── 全ユーザー一覧（最新30件）──');
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 30,
    include: {
      _count: {
        select: {
          diagnostics: true,
          vectors: true,
        }
      }
    }
  });

  for (const u of users) {
    const tag = u.email.includes('@zax.guest') ? '[GUEST]' : '[USER ]';
    console.log(`${tag} ${u.email.substring(0, 50).padEnd(50)} | 診断${u._count.diagnostics}件 | ベクトル${u._count.vectors}件 | ${new Date(u.createdAt).toLocaleString('ja-JP')}`);
  }

  // 2. s2527084 の詳細
  console.log('\n── s2527084 ユーザーの詳細 ──');
  const targetUser = await prisma.user.findFirst({
    where: { email: { contains: 's2527084' } },
    include: {
      diagnostics: { orderBy: { createdAt: 'asc' } },
      vectors: {
        orderBy: { createdAt: 'asc' },
        select: { id: true, createdAt: true, reasoning: true, resonanceScore: true, statsVector: true }
      }
    }
  });

  if (!targetUser) {
    console.log('⚠ s2527084 のユーザーが見つかりませんでした。');
    console.log('  ゲストのまま診断した場合、ゲストIDで管理されています。');
  } else {
    console.log(`✅ ユーザー発見: id=${targetUser.id}, email=${targetUser.email}`);
    console.log(`   診断=${targetUser.diagnostics.length}件, ベクトル=${targetUser.vectors.length}件\n`);

    for (const [i, d] of targetUser.diagnostics.entries()) {
      console.log(`[診断${i+1}] ${new Date(d.createdAt).toLocaleString('ja-JP')}`);
      console.log(`  先頭300文字: ${d.synthesis.substring(0, 300).replace(/\n/g, ' ')}…\n`);
    }

    for (const [i, v] of targetUser.vectors.entries()) {
      const stats = v.statsVector ? JSON.parse(v.statsVector) : null;
      console.log(`[ベクトル${i+1}] ${new Date(v.createdAt).toLocaleString('ja-JP')}`);
      if (stats) {
        console.log(`  6次元: 論理=${stats[0]} 直感=${stats[1]} 共感=${stats[2]} 意志=${stats[3]} 創造=${stats[4]} 柔軟=${stats[5]}`);
      }
      console.log(`  resonanceScore: ${v.resonanceScore}`);
    }
  }

  // 3. 全体統計
  console.log('\n── 全体統計 ──');
  const totalUsers = await prisma.user.count();
  const guestUsers = await prisma.user.count({ where: { email: { contains: '@zax.guest' } } });
  const diagCount = await prisma.diagnosticResult.count();
  const vecCount = await prisma.essenceVector.count();
  const logCount = await prisma.geminiLog.count();
  console.log(`全ユーザー: ${totalUsers}件（ゲスト: ${guestUsers}件 / 正規: ${totalUsers - guestUsers}件）`);
  console.log(`診断結果: ${diagCount}件 | EssenceVector: ${vecCount}件 | GeminiLog: ${logCount}件`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
