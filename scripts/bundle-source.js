/**
 * 全ソースコードを1つのMarkdownファイルにまとめるスクリプト
 * 出力ファイル: c:\ZAX\ZAX_FULL_SOURCE.md
 */
const fs = require('fs');
const path = require('path');

const ROOT = 'c:\\ZAX';
const OUTPUT = path.join(ROOT, 'ZAX_FULL_SOURCE.md');

// 対象ファイル（フルパス）
const targetFiles = [
  // スキーマ・設定
  'prisma\\schema.prisma',
  'src\\middleware.ts',
  // アプリ - ページ
  'src\\app\\layout.tsx',
  'src\\app\\page.tsx',
  'src\\app\\globals.css',
  'src\\app\\about\\page.tsx',
  'src\\app\\philosophy\\page.tsx',
  'src\\app\\technology\\page.tsx',
  'src\\app\\product\\page.tsx',
  'src\\app\\privacy\\page.tsx',
  'src\\app\\terms\\page.tsx',
  'src\\app\\diagnostic\\page.tsx',
  'src\\app\\diagnostic\\result\\[id]\\page.tsx',
  'src\\app\\history\\page.tsx',
  'src\\app\\matching\\page.tsx',
  'src\\app\\input\\page.tsx',
  'src\\app\\input\\InputClient.tsx',
  // アプリ - API
  'src\\app\\api\\diagnostic\\submit\\route.ts',
  'src\\app\\api\\diagnostic\\result\\[id]\\route.ts',
  'src\\app\\api\\vectors\\history\\route.ts',
  'src\\app\\api\\matching\\register\\route.ts',
  'src\\app\\api\\matching\\candidates\\route.ts',
  'src\\app\\api\\match\\route.ts',
  'src\\app\\api\\analyze\\route.ts',
  'src\\app\\api\\feedback\\route.ts',
  'src\\app\\api\\reflection\\route.ts',
  'src\\app\\api\\mypage\\route.ts',
  'src\\app\\api\\gemini-logs\\route.ts',
  'src\\app\\api\\auth\\guest-register\\route.ts',
  'src\\app\\api\\diagnostic\\generate-report\\route.ts',
  // コンポーネント
  'src\\components\\AppNavigation.tsx',
  'src\\components\\CorporateHeader.tsx',
  'src\\components\\LandingPage.tsx',
  'src\\components\\ImpactSimulationGraph.tsx',
  'src\\components\\ImpactChart.tsx',
  'src\\components\\EssenceInput.tsx',
  'src\\components\\EvidenceAnalysis.tsx',
  'src\\components\\VectorTransformationVisual.tsx',
  'src\\components\\Footer.tsx',
  'src\\components\\Providers.tsx',
  'src\\components\\diagnostic\\DiagnosticResultClient.tsx',
  'src\\components\\diagnostic\\ResultRadarChart.tsx',
  'src\\components\\diagnostic\\CompareRadarChart.tsx',
  'src\\components\\diagnostic\\MatchResults.tsx',
  'src\\components\\chat\\PostChatInterview.tsx',
  'src\\components\\chat\\ReflectionView.tsx',
  'src\\components\\product\\ThreeLayerModel.tsx',
  'src\\components\\ui\\card.tsx',
  'src\\components\\ui\\button.tsx',
  // ライブラリ
  'src\\lib\\gemini.ts',
  'src\\lib\\gemini-log.ts',
  'src\\lib\\db\\client.ts',
  'src\\lib\\crypto.ts',
  'src\\lib\\utils.ts',
  'src\\lib\\rec\\engine.ts',
  'src\\lib\\actions\\manual-auth.ts',
  // データ
  'src\\data\\questions.ts',
  'src\\context\\DiagnosticContext.tsx',
];

let output = `# ZAX - Full Source Code Bundle
生成日時: ${new Date().toLocaleString('ja-JP')}

このファイルはZAXプロジェクトの全ソースコードをGeminiによるコードレビュー用にまとめたものです。

## ファイル一覧
${targetFiles.map((f, i) => `${i+1}. \`${f}\``).join('\n')}

---

`;

for (const relPath of targetFiles) {
  const fullPath = path.join(ROOT, relPath);
  const ext = path.extname(relPath).slice(1);
  const lang = ext === 'prisma' ? 'prisma' : ext === 'css' ? 'css' : ext === 'ts' ? 'typescript' : 'tsx';
  
  output += `## \`${relPath}\`\n\n`;
  
  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    output += `\`\`\`${lang}\n${content}\n\`\`\`\n\n---\n\n`;
  } catch (e) {
    output += `_ファイルが見つかりませんでした: ${e.message}_\n\n---\n\n`;
  }
}

fs.writeFileSync(OUTPUT, output, 'utf-8');
const sizeKB = Math.round(fs.statSync(OUTPUT).size / 1024);
console.log(`✅ 生成完了: ${OUTPUT}`);
console.log(`   ファイル数: ${targetFiles.length}`);
console.log(`   ファイルサイズ: ${sizeKB} KB`);
