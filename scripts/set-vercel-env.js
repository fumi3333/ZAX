const { spawnSync } = require('child_process');
const crypto = require('crypto');

function setEnv(name, value) {
  console.log(`Setting ${name}...`);
  // 既存のキーがある場合は削除
  spawnSync('npx.cmd', ['vercel', 'env', 'rm', name, 'production', '--yes'], { stdio: 'ignore' });
  
  // 新しいキーを追加
  const result = spawnSync('npx.cmd', ['vercel', 'env', 'add', name, 'production'], {
    input: value,
    encoding: 'utf-8'
  });
  console.log(result.stdout || result.stderr);
}

const keys = {
  ENCRYPTION_KEY: crypto.randomBytes(24).toString('base64'),
  ADMIN_API_KEY: crypto.randomBytes(24).toString('base64'),
  CRON_SECRET: crypto.randomBytes(24).toString('base64')
};

for (const [key, value] of Object.entries(keys)) {
  setEnv(key, value);
}
console.log('✅ Environment variables applied to Vercel.');
