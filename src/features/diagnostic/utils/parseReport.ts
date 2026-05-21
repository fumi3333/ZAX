import type { StructuredReport } from "../types";

export function sanitizeText(text: string | undefined | null): string {
  if (!text) return "";
  return text
    .replace(/[*#()（）:：\[\]【】「」]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseReport(synthesis: string): StructuredReport | null {
  if (!synthesis) return null;

  try {
    const parsed = JSON.parse(synthesis);
    if (parsed && typeof parsed === "object") {
      const otsuge    = parsed.otsuge    || parsed.otsuge_text    || "";
      const machihito = parsed.machihito || parsed.machihito_text || "";
      const koudou    = parsed.koudou    || parsed.koudou_text    || "";
      if (otsuge || machihito || koudou) {
        return {
          otsuge:    sanitizeText(otsuge),
          machihito: sanitizeText(machihito),
          koudou:    sanitizeText(koudou),
        };
      }
    }
  } catch { /* not JSON */ }

  const paragraphs = synthesis
    .split("\n")
    .map(l => sanitizeText(l))
    .filter(Boolean)
    .filter(l => l.length >= 15)
    .filter(l => !/はじめに|レポート|診断|おみくじ|結果|総評|相性|アプローチ/i.test(l));

  const fallback = {
    machihito: "お互いの個性を補完し合える、知的好奇心旺盛な相手と衝突の先に深い絆が生まれます。",
    koudou:    "今のペースを守りつつ、身を置く環境を少しだけ変えてみることが鍵になります。",
  };

  if (paragraphs.length >= 3) return { otsuge: paragraphs[0], machihito: paragraphs[1], koudou: paragraphs[2] };
  if (paragraphs.length === 2) return { otsuge: paragraphs[0], machihito: paragraphs[1], ...{ koudou: fallback.koudou } };
  if (paragraphs.length === 1) return { otsuge: paragraphs[0], ...fallback };

  return {
    otsuge: "あなたの直感と意志は、周囲の期待を超えて独自の道を切り拓く力に満ちています。",
    ...fallback,
  };
}
