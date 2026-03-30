export const ASSET_TYPES = [
  "product_img",
  "product_detail_img",
  "testimonial_url",
  "video_link",
  "official_url",
] as const;

export type AssetType = (typeof ASSET_TYPES)[number];

export const ASSET_TYPE_OPTIONS: Array<{ value: AssetType; label: string }> = [
  { value: "product_img", label: "主視覺" },
  { value: "product_detail_img", label: "商品圖片" },
  { value: "testimonial_url", label: "使用見證網址" },
  { value: "video_link", label: "影片連結" },
  { value: "official_url", label: "官網網址" },
];

const ASSET_TYPE_MAP: Record<string, AssetType> = {
  product_img: "product_img",
  "主視覺": "product_img",
  "主圖": "product_img",
  main_visual: "product_img",
  main: "product_img",
  "封面": "product_img",
  product_detail_img: "product_detail_img",
  "商品圖片": "product_detail_img",
  "商品照": "product_detail_img",
  "細節圖": "product_detail_img",
  "商品圖": "product_detail_img",
  img: "product_img",
  image: "product_img",
  "圖片": "product_detail_img",
  testimonial_url: "testimonial_url",
  "使用見證網址": "testimonial_url",
  "見證連結": "testimonial_url",
  testimonial: "testimonial_url",
  "使用見證": "testimonial_url",
  // Backward compatibility: old image types are folded into 商品圖片
  testimonial_img: "product_detail_img",
  scenario_img: "product_detail_img",
  scenario: "product_detail_img",
  "見證圖": "product_detail_img",
  "情境圖": "product_detail_img",
  video_link: "video_link",
  video: "video_link",
  "影片": "video_link",
  official_url: "official_url",
  official: "official_url",
  "官網": "official_url",
};

export function normalizeAssetType(value: unknown): AssetType {
  if (typeof value !== "string") return "product_img";
  const raw = value.trim();
  if (!raw) return "product_img";

  const mapped = ASSET_TYPE_MAP[raw] ?? ASSET_TYPE_MAP[raw.toLowerCase()];
  if (mapped) return mapped;

  if (raw.includes("主視覺") || raw.includes("主圖")) return "product_img";
  if (raw.includes("商品") && raw.includes("圖")) return "product_detail_img";
  if (raw.includes("見證") && (raw.includes("連結") || raw.includes("網址"))) return "testimonial_url";
  if (raw.includes("見證")) return "testimonial_url";
  if (raw.includes("情境")) return "product_detail_img";
  if (raw.includes("官網")) return "official_url";
  if (raw.includes("影片")) return "video_link";
  if (raw.includes("圖")) return "product_detail_img";

  return "product_img";
}

export function isImageAssetType(value: unknown): boolean {
  return normalizeAssetType(value).endsWith("_img");
}

export function getAssetTypeLabel(value: unknown): string {
  const normalized = normalizeAssetType(value);
  return ASSET_TYPE_OPTIONS.find((option) => option.value === normalized)?.label ?? "商品圖片";
}

export function normalizeTags(value: unknown): string[] {
  const cleanTag = (tag: unknown) =>
    String(tag)
      .trim()
      .replace(/^['"\[\]\s]+/, "")
      .replace(/['"\[\]\s]+$/, "");

  if (Array.isArray(value)) {
    return value
      .map((tag) => cleanTag(tag))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    const raw = value.trim();
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .map((tag) => cleanTag(tag))
          .filter(Boolean);
      }
    } catch {
      // Fall through to comma-separated handling.
    }

    return raw
      .split(/[,\n，]/)
      .map((tag) => cleanTag(tag))
      .filter(Boolean);
  }

  return [];
}

export function parseTagsInput(input: string): string[] {
  return normalizeTags(input);
}

export function tagsToInputValue(value: unknown): string {
  return normalizeTags(value).join(", ");
}

function normalizeTagToken(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s\p{P}\p{S}]+/gu, "");
}

export function sanitizeTagsForProductName(productName: string, rawTags: string[]): string[] {
  const normalizedName = normalizeTagToken(productName);
  const seen = new Set<string>();
  const sanitized: string[] = [];

  for (const rawTag of rawTags) {
    const tag = rawTag.trim();
    if (!tag) continue;

    const normalizedTag = normalizeTagToken(tag);
    if (!normalizedTag) continue;

    if (
      normalizedName &&
      (normalizedTag === normalizedName ||
        normalizedName.includes(normalizedTag) ||
        normalizedTag.includes(normalizedName))
    ) {
      continue;
    }

    if (seen.has(normalizedTag)) continue;
    seen.add(normalizedTag);
    sanitized.push(tag);
  }

  return sanitized;
}

function uniqueNonEmpty(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

export function normalizeCategory(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

export function normalizeProblemShortcuts(value: unknown): string[] {
  if (Array.isArray(value)) {
    return uniqueNonEmpty(value.map((item) => String(item)));
  }

  if (typeof value === "string") {
    const raw = value.trim();
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return uniqueNonEmpty(parsed.map((item) => String(item)));
      }
    } catch {
      // Fall through to text split handling.
    }

    return uniqueNonEmpty(raw.split(/[,\n，]/));
  }

  return [];
}

export function parseProblemShortcutsInput(input: string): string[] {
  return normalizeProblemShortcuts(input);
}

export function problemShortcutsToInputValue(value: unknown): string {
  return normalizeProblemShortcuts(value).join(", ");
}

// Remove decorative emoji prefixes at the beginning of list lines.
export function stripLeadingListEmoji(value: string): string {
  return value
    .replace(/^((?:[✔✅☑️]|[\p{Extended_Pictographic}]\uFE0F?)\s*)+/u, "")
    .trim();
}

// For compact previews, remove both decorative emoji and list markers.
export function stripListPrefixForPreview(value: string): string {
  const withoutEmoji = stripLeadingListEmoji(value);
  return withoutEmoji.replace(/^([●•\-*]+\s*|\d+[.)、]\s*)/, "").trim();
}

export function normalizeToBulletListText(value: string): string {
  return value
    .split("\n")
    .map((line) => {
      const normalized = stripListPrefixForPreview(line);
      if (!normalized) return "";
      return `● ${normalized}`;
    })
    .join("\n");
}
