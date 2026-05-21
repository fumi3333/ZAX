export interface ResultData {
  id: string;
  isGuest: boolean;
  synthesis: string;
  answers: Record<string, number>;
  vector?: number[] | string;
}

export interface StructuredReport {
  otsuge: string;
  machihito: string;
  koudou: string;
}

export const DIMENSION_LABELS = ["生活基盤", "社会意識", "信頼構築", "対話力", "野心", "寛容性"] as const;

export const OMIKUJI_SECTIONS = [
  { key: "otsuge"    as const, label: "分析結果",     sub: "あなたの本質" },
  { key: "machihito" as const, label: "相性のいい相手", sub: "引き合う存在" },
  { key: "koudou"   as const, label: "行動指針",     sub: "日常のアクション" },
] as const;
