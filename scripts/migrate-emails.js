const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

function hashEmail(email) {
    if (!email || email.startsWith('guest_')) return email; // ゲスト用ダミーメールはそのまま（または既にハッシュ形式ならスルー）
    const normalizedEmail = email.toLowerCase().trim();
    return crypto.createHash('sha256').update(normalizedEmail).digest('hex');
}

async function main() {
    console.log('--- 既存メールアドレスのハッシュ化（匿名化）を開始します ---');
    const users = await prisma.user.findMany();
    let count = 0;

    for (const user of users) {
        if (user.email.length === 64 && /^[0-9a-f]+$/.test(user.email)) {
            // 既にハッシュ化されていると思われるものはスキップ
            continue;
        }

        const hashed = hashEmail(user.email);
        
        try {
            await prisma.user.update({
                where: { id: user.id },
                data: { email: hashed }
            });
            count++;
            console.log(`Updated: ${user.id} (Original was length ${user.email.length})`);
        } catch (e) {
            console.error(`Error updating user ${user.id}:`, e.message);
        }
    }

    console.log(`--- 完了: ${count} 件のユーザーを匿名化しました ---`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
