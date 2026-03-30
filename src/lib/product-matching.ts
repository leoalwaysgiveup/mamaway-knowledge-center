import { normalizeProblemShortcuts, normalizeTags } from "@/lib/product-contracts";

type ProductLike = {
  id: string;
  name: string;
  pitch?: string | null;
  category?: string | null;
  problemShortcuts?: unknown;
  description?: string | null;
  ingredients?: string | null;
  coreSellingPoints?: string | null;
  problemsSolved?: string | null;
  targetAudience?: string | null;
  salesTips?: string | null;
  bossNotes?: string | null;
  tags?: unknown;
  replies?: Array<{ content?: string | null; scenario?: string | null }>;
  assets?: Array<{ title?: string | null }>;
};

type RankedProduct<T extends ProductLike> = {
  product: T;
  score: number;
};

type MatchDetail = {
  label: string;
  keywords: string[];
  score: number;
};

function normalizeText(text: string | null | undefined): string {
  return (text ?? "").toLowerCase().trim();
}

function unique(items: string[]): string[] {
  return Array.from(new Set(items));
}

function buildQueryTerms(query: string): string[] {
  const normalized = normalizeText(query);
  if (!normalized) return [];

  const splitTerms = normalized
    .split(/[\s,，。！？、；;:\n\r\t]+/)
    .map((term) => term.trim())
    .filter(Boolean);

  const terms = new Set<string>();
  terms.add(normalized);

  for (const term of splitTerms) {
    terms.add(term);

    // For CJK queries without spaces, 2-char grams increase practical match rate.
    if (term.length >= 4) {
      for (let i = 0; i <= term.length - 2; i += 1) {
        terms.add(term.slice(i, i + 2));
      }
    }
  }

  return Array.from(terms).filter((term) => term.length >= 2);
}

function countTermMatches(text: string, terms: string[]): number {
  if (!text) return 0;
  return terms.filter((term) => text.includes(term)).length;
}

function scoreField(text: string, terms: string[], weight: number): number {
  const matchCount = countTermMatches(text, terms);
  if (matchCount === 0) return 0;
  return Math.min(matchCount, 3) * weight;
}

function getMatchedKeywords(text: string, terms: string[]): string[] {
  if (!text) return [];
  return unique(terms.filter((term) => text.includes(term))).slice(0, 3);
}

function getProductMatchDetails<T extends ProductLike>(product: T, query: string): MatchDetail[] {
  const normalizedQuery = normalizeText(query);
  const terms = buildQueryTerms(normalizedQuery);
  if (terms.length === 0) return [];

  const fields: Array<{
    label: string;
    text: string;
    weight: number;
  }> = [
    { label: "商品名稱", text: normalizeText(product.name), weight: 12 },
    { label: "商品類別", text: normalizeText(product.category), weight: 11 },
    {
      label: "問題捷徑",
      text: normalizeProblemShortcuts(product.problemShortcuts)
        .map((tag) => tag.toLowerCase())
        .join(" "),
      weight: 10,
    },
    { label: "標籤", text: normalizeTags(product.tags).map((tag) => tag.toLowerCase()).join(" "), weight: 10 },
    { label: "可解決痛點", text: normalizeText(product.problemsSolved), weight: 8 },
    { label: "推薦對象", text: normalizeText(product.targetAudience), weight: 7 },
    { label: "一句話定位", text: normalizeText(product.pitch), weight: 6 },
    {
      label: "歷史回覆",
      text: (product.replies ?? [])
        .map((reply) => `${reply.scenario ?? ""} ${reply.content ?? ""}`)
        .join(" ")
        .toLowerCase(),
      weight: 6,
    },
  ];

  const details = fields
    .map((field) => {
      const keywords = getMatchedKeywords(field.text, terms);
      return {
        label: field.label,
        keywords,
        score: keywords.length * field.weight,
      };
    })
    .filter((detail) => detail.keywords.length > 0)
    .sort((a, b) => b.score - a.score);

  return details;
}

export function scoreProductByQuery<T extends ProductLike>(product: T, query: string): number {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return 0;

  const terms = buildQueryTerms(normalizedQuery);
  if (terms.length === 0) return 0;

  const name = normalizeText(product.name);
  const pitch = normalizeText(product.pitch);
  const category = normalizeText(product.category);
  const problemShortcutsText = normalizeProblemShortcuts(product.problemShortcuts)
    .map((item) => item.toLowerCase())
    .join(" ");
  const description = normalizeText(product.description);
  const ingredients = normalizeText(product.ingredients);
  const coreSellingPoints = normalizeText(product.coreSellingPoints);
  const problemsSolved = normalizeText(product.problemsSolved);
  const targetAudience = normalizeText(product.targetAudience);
  const salesTips = normalizeText(product.salesTips);
  const bossNotes = normalizeText(product.bossNotes);
  const tagsText = normalizeTags(product.tags).map((tag) => tag.toLowerCase()).join(" ");
  const repliesText = (product.replies ?? [])
    .map((reply) => `${reply.scenario ?? ""} ${reply.content ?? ""}`)
    .join(" ")
    .toLowerCase();
  const assetsText = (product.assets ?? [])
    .map((asset) => asset.title ?? "")
    .join(" ")
    .toLowerCase();

  let score = 0;
  score += scoreField(name, terms, 12);
  score += scoreField(category, terms, 11);
  score += scoreField(problemShortcutsText, terms, 10);
  score += scoreField(tagsText, terms, 10);
  score += scoreField(problemsSolved, terms, 8);
  score += scoreField(targetAudience, terms, 7);
  score += scoreField(pitch, terms, 6);
  score += scoreField(coreSellingPoints, terms, 6);
  score += scoreField(repliesText, terms, 6);
  score += scoreField(salesTips, terms, 4);
  score += scoreField(description, terms, 3);
  score += scoreField(ingredients, terms, 3);
  score += scoreField(bossNotes, terms, 2);
  score += scoreField(assetsText, terms, 2);

  // Exact query hits should have a clear priority boost.
  const allText = [
    name,
    category,
    problemShortcutsText,
    tagsText,
    pitch,
    coreSellingPoints,
    problemsSolved,
    targetAudience,
    repliesText,
  ].join(" ");

  if (name.includes(normalizedQuery)) score += 16;
  if (allText.includes(normalizedQuery)) score += 10;

  return score;
}

export function rankProductsByQuery<T extends ProductLike>(
  products: T[],
  query: string
): RankedProduct<T>[] {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) {
    return products.map((product) => ({ product, score: 0 }));
  }

  const ranked = products.map((product) => ({
    product,
    score: scoreProductByQuery(product, normalizedQuery),
  }));

  return ranked
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);
}

export function pickBestProductByQuery<T extends ProductLike>(
  products: T[],
  query: string
): T | null {
  if (products.length === 0) return null;

  const ranked = rankProductsByQuery(products, query);
  if (ranked.length > 0) return ranked[0].product;

  return products[0] ?? null;
}

export function normalizeSearchInput(query: string | null | undefined): string {
  return normalizeText(query ?? "");
}

export function extractSearchKeywords(query: string): string[] {
  return unique(buildQueryTerms(query));
}

export function explainProductMatch<T extends ProductLike>(product: T, query: string): string[] {
  return getProductMatchDetails(product, query)
    .slice(0, 3)
    .map((detail) => `${detail.label}：${detail.keywords.join("、")}`);
}

export function scoreTextByQuery(text: string | null | undefined, query: string): number {
  const normalizedText = normalizeText(text);
  const terms = buildQueryTerms(query);
  if (!normalizedText || terms.length === 0) return 0;
  return terms.filter((term) => normalizedText.includes(term)).length;
}
