import { PrismaClient } from "@prisma/client";
import {
  normalizeAssetType,
  normalizeTags,
  sanitizeTagsForProductName,
} from "../src/lib/product-contracts";

const prisma = new PrismaClient();

const shouldApply = process.argv.includes("--apply");

function sameJson(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

async function main() {
  console.log(shouldApply ? "🛠️  開始修正資料..." : "🔎 Dry run：檢查可修正資料...");

  const products = await prisma.product.findMany({
    select: { id: true, name: true, tags: true },
  });

  const assets = await prisma.asset.findMany({
    select: { id: true, title: true, type: true },
  });

  let productFixCount = 0;
  let assetFixCount = 0;

  for (const product of products) {
    const normalizedTags = normalizeTags(product.tags);
    const sanitizedTags = sanitizeTagsForProductName(product.name, normalizedTags);
    if (!sameJson(product.tags, sanitizedTags)) {
      productFixCount += 1;
      console.log(`  - Product tags: ${product.name}`);

      if (shouldApply) {
        await prisma.product.update({
          where: { id: product.id },
          data: { tags: sanitizedTags },
        });
      }
    }
  }

  for (const asset of assets) {
    const normalizedType = normalizeAssetType(asset.type);
    if (asset.type !== normalizedType) {
      assetFixCount += 1;
      console.log(`  - Asset type: ${asset.title} (${asset.type} -> ${normalizedType})`);

      if (shouldApply) {
        await prisma.asset.update({
          where: { id: asset.id },
          data: { type: normalizedType },
        });
      }
    }
  }

  console.log("");
  console.log(`Product tags 可修正：${productFixCount} 筆`);
  console.log(`Asset type 可修正：${assetFixCount} 筆`);

  if (!shouldApply) {
    console.log("（目前是 dry-run，資料庫未異動）");
    console.log("若要套用修正，執行：npm run normalize:data");
  } else {
    console.log("✅ 資料修正完成");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
