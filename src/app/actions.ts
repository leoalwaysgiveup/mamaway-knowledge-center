"use server"

import prisma from "@/lib/prisma"
import {
  normalizeCategory,
  normalizeAssetType,
  normalizeProblemShortcuts,
  sanitizeTagsForProductName,
  parseProblemShortcutsInput,
  parseTagsInput,
  normalizeToBulletListText,
} from "@/lib/product-contracts"
import {
  explainProductMatch,
  pickBestProductByQuery,
  rankProductsByQuery,
} from "@/lib/product-matching"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import fs from "fs/promises"
import path from "path"

function shouldFallbackWithoutTaxonomyFields(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  const message = error.message ?? ""
  return (
    message.includes("Unknown argument `category`") ||
    message.includes("Unknown argument `problemShortcuts`") ||
    message.includes("Unknown field `category`") ||
    message.includes("Unknown field `problemShortcuts`")
  )
}

async function ensureCategoryDictionaryOption(name: string) {
  if (prisma.categoryDictionary?.upsert) {
    return await prisma.categoryDictionary.upsert({
      where: { name },
      update: {},
      create: { name },
      select: { id: true, name: true },
    })
  }

  await prisma.$executeRaw`
    INSERT INTO \`CategoryDictionary\` (\`id\`, \`name\`, \`createdAt\`, \`updatedAt\`)
    VALUES (UUID(), ${name}, NOW(), NOW())
    ON DUPLICATE KEY UPDATE \`updatedAt\` = NOW()
  `

  return { id: "raw-fallback", name }
}

async function ensureProblemShortcutDictionaryOption(name: string) {
  if (prisma.problemShortcutDictionary?.upsert) {
    return await prisma.problemShortcutDictionary.upsert({
      where: { name },
      update: {},
      create: { name },
      select: { id: true, name: true },
    })
  }

  await prisma.$executeRaw`
    INSERT INTO \`ProblemShortcutDictionary\` (\`id\`, \`name\`, \`createdAt\`, \`updatedAt\`)
    VALUES (UUID(), ${name}, NOW(), NOW())
    ON DUPLICATE KEY UPDATE \`updatedAt\` = NOW()
  `

  return { id: "raw-fallback", name }
}

async function listProductsWithCategory() {
  try {
    return await prisma.product.findMany({
      select: { id: true, category: true },
    })
  } catch (error) {
    if (!shouldFallbackWithoutTaxonomyFields(error)) throw error
    return await prisma.$queryRaw<Array<{ id: string; category: string | null }>>`
      SELECT \`id\`, \`category\` FROM \`Product\`
    `
  }
}

async function listProductsWithProblemShortcuts() {
  try {
    return await prisma.product.findMany({
      select: { id: true, problemShortcuts: true },
    })
  } catch (error) {
    if (!shouldFallbackWithoutTaxonomyFields(error)) throw error
    return await prisma.$queryRaw<Array<{ id: string; problemShortcuts: unknown }>>`
      SELECT \`id\`, \`problemShortcuts\` FROM \`Product\`
    `
  }
}

async function updateProductCategoryById(id: string, category: string | null) {
  try {
    await prisma.product.update({
      where: { id },
      data: { category },
    })
    return
  } catch (error) {
    if (!shouldFallbackWithoutTaxonomyFields(error)) throw error
  }

  await prisma.$executeRaw`
    UPDATE \`Product\`
    SET \`category\` = ${category}
    WHERE \`id\` = ${id}
  `
}

async function updateProductProblemShortcutsById(id: string, problemShortcuts: string[]) {
  try {
    await prisma.product.update({
      where: { id },
      data: { problemShortcuts },
    })
    return
  } catch (error) {
    if (!shouldFallbackWithoutTaxonomyFields(error)) throw error
  }

  await prisma.$executeRaw`
    UPDATE \`Product\`
    SET \`problemShortcuts\` = ${JSON.stringify(problemShortcuts)}
    WHERE \`id\` = ${id}
  `
}

async function syncProblemShortcutDictionary(shortcuts: string[]) {
  for (const shortcut of shortcuts) {
    try {
      await ensureProblemShortcutDictionaryOption(shortcut)
    } catch {
      // Keep request successful even if dictionary sync fails.
    }
  }
}

async function applyProductTaxonomyFields(
  id: string,
  payload: { category: string | null; problemShortcuts: string[] }
) {
  try {
    await prisma.product.update({
      where: { id },
      data: {
        category: payload.category,
        problemShortcuts: payload.problemShortcuts,
      },
    })
    return
  } catch (error) {
    if (!shouldFallbackWithoutTaxonomyFields(error)) throw error
  }

  await prisma.$executeRaw`
    UPDATE \`Product\`
    SET
      \`category\` = ${payload.category},
      \`problemShortcuts\` = ${JSON.stringify(payload.problemShortcuts)}
    WHERE \`id\` = ${id}
  `
}

export async function uploadFile(formData: FormData) {
  const file = formData.get("file") as File
  if (!file) return null

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  
  const uploadDir = path.join(process.cwd(), "public", "uploads")
  try {
    await fs.access(uploadDir)
  } catch {
    await fs.mkdir(uploadDir, { recursive: true })
  }

  const fileName = `${Date.now()}-${file.name}`
  const filePath = path.join(uploadDir, fileName)
  await fs.writeFile(filePath, buffer)

  return `/uploads/${fileName}`
}

export async function getProduct(id: string) {
  return await prisma.product.findUnique({
    where: { id },
    include: {
      assets: true,
      replies: true
    }
  })
}

export async function createProduct(formData: FormData) {
  const name = formData.get("name")?.toString() || ""
  const tagsStr = formData.get("tags")?.toString() || ""
  const category = formData.get("category")?.toString().trim() || ""
  const problemShortcutsStr = formData.get("problemShortcuts")?.toString() || ""
  const description = formData.get("description")?.toString() || ""
  const ingredients = formData.get("ingredients")?.toString() || ""
  const coreSellingPointsRaw = formData.get("coreSellingPoints")?.toString() || ""
  const problemsSolvedRaw = formData.get("problemsSolved")?.toString() || ""
  const targetAudienceRaw = formData.get("targetAudience")?.toString() || ""
  const salesTips = formData.get("salesTips")?.toString() || ""
  const bossNotes = formData.get("bossNotes")?.toString() || ""
  const pitch = formData.get("pitch")?.toString() || ""

  const tags = sanitizeTagsForProductName(name, parseTagsInput(tagsStr))
  const problemShortcuts = parseProblemShortcutsInput(problemShortcutsStr)
  const coreSellingPoints = normalizeToBulletListText(coreSellingPointsRaw)
  const problemsSolved = normalizeToBulletListText(problemsSolvedRaw)
  const targetAudience = normalizeToBulletListText(targetAudienceRaw)

  const baseData = {
    name,
    description,
    ingredients,
    tags: tags,
    pitch,
    coreSellingPoints,
    problemsSolved,
    targetAudience,
    salesTips,
    bossNotes,
  }

  let product
  try {
    product = await prisma.product.create({
      data: {
        ...baseData,
        category: category || null,
        problemShortcuts,
      },
    })
  } catch (error) {
    if (!shouldFallbackWithoutTaxonomyFields(error)) throw error
    product = await prisma.product.create({ data: baseData })
  }

  await applyProductTaxonomyFields(product.id, {
    category: category || null,
    problemShortcuts,
  })

  revalidatePath("/")
  if (category) {
    try {
      await ensureCategoryDictionaryOption(category)
    } catch {
      // Keep product creation successful even if dictionary sync fails.
    }
  }
  await syncProblemShortcutDictionary(problemShortcuts)
  redirect(`/product/${product.id}`)
}

export async function updateProduct(id: string, formData: FormData) {
  const name = formData.get("name")?.toString() || ""
  const tagsStr = formData.get("tags")?.toString() || ""
  const category = formData.get("category")?.toString().trim() || ""
  const problemShortcutsStr = formData.get("problemShortcuts")?.toString() || ""
  const description = formData.get("description")?.toString() || ""
  const ingredients = formData.get("ingredients")?.toString() || ""
  const coreSellingPointsRaw = formData.get("coreSellingPoints")?.toString() || ""
  const problemsSolvedRaw = formData.get("problemsSolved")?.toString() || ""
  const targetAudienceRaw = formData.get("targetAudience")?.toString() || ""
  const salesTips = formData.get("salesTips")?.toString() || ""
  const bossNotes = formData.get("bossNotes")?.toString() || ""
  const pitch = formData.get("pitch")?.toString() || ""

  const tags = sanitizeTagsForProductName(name, parseTagsInput(tagsStr))
  const problemShortcuts = parseProblemShortcutsInput(problemShortcutsStr)
  const coreSellingPoints = normalizeToBulletListText(coreSellingPointsRaw)
  const problemsSolved = normalizeToBulletListText(problemsSolvedRaw)
  const targetAudience = normalizeToBulletListText(targetAudienceRaw)

  const baseData = {
    name,
    description,
    ingredients,
    tags: tags,
    pitch,
    coreSellingPoints,
    problemsSolved,
    targetAudience,
    salesTips,
    bossNotes,
  }

  try {
    await prisma.product.update({
      where: { id },
      data: {
        ...baseData,
        category: category || null,
        problemShortcuts,
      },
    })
  } catch (error) {
    if (!shouldFallbackWithoutTaxonomyFields(error)) throw error
    await prisma.product.update({
      where: { id },
      data: baseData,
    })
  }

  await applyProductTaxonomyFields(id, {
    category: category || null,
    problemShortcuts,
  })

  revalidatePath("/")
  revalidatePath(`/product/${id}`)
  if (category) {
    try {
      await ensureCategoryDictionaryOption(category)
    } catch {
      // Keep product update successful even if dictionary sync fails.
    }
  }
  await syncProblemShortcutDictionary(problemShortcuts)
}

export async function updateAsset(
  assetId: string,
  data: { title: string; url: string; type: string; note?: string }
) {
  const asset = await prisma.asset.update({
    where: { id: assetId },
    data: {
      title: data.title.trim(),
      url: data.url.trim(),
      type: normalizeAssetType(data.type),
      note: data.note?.trim() || null,
    },
    select: {
      id: true,
      productId: true,
      title: true,
      type: true,
      url: true,
      note: true,
    },
  })

  revalidatePath("/")
  revalidatePath("/manage")
  revalidatePath(`/product/${asset.productId}`)

  return asset
}

export async function deleteAsset(assetId: string) {
  const existing = await prisma.asset.findUnique({
    where: { id: assetId },
    select: { productId: true },
  })

  if (!existing) return

  await prisma.asset.delete({
    where: { id: assetId }
  })

  revalidatePath("/")
  revalidatePath("/manage")
  revalidatePath(`/product/${existing.productId}`)
}

export async function addAsset(
  productId: string,
  data: { title: string; url: string; type: string; note?: string }
) {
  const asset = await prisma.asset.create({
    data: {
      title: data.title.trim(),
      url: data.url.trim(),
      type: normalizeAssetType(data.type),
      note: data.note?.trim() || null,
      productId
    },
    select: {
      id: true,
      productId: true,
      title: true,
      type: true,
      url: true,
      note: true,
    },
  })

  revalidatePath("/")
  revalidatePath("/manage")
  revalidatePath(`/product/${productId}`)

  return asset
}

export async function addReply(
  productId: string,
  data: { scenario: string; content: string; note?: string; isFAQ?: boolean; isPremium?: boolean }
) {
  const reply = await prisma.reply.create({
    data: {
      productId,
      scenario: data.scenario.trim(),
      content: data.content.trim(),
      note: data.note?.trim() || null,
      isFAQ: Boolean(data.isFAQ),
      isPremium: Boolean(data.isPremium),
    },
  })

  revalidatePath("/")
  revalidatePath(`/product/${productId}`)
  revalidatePath("/manage")

  return reply
}

export async function updateReply(
  replyId: string,
  data: { scenario: string; content: string; note?: string; isFAQ?: boolean; isPremium?: boolean }
) {
  const existing = await prisma.reply.findUnique({
    where: { id: replyId },
    select: { productId: true },
  })

  if (!existing) throw new Error("找不到該回覆")

  const reply = await prisma.reply.update({
    where: { id: replyId },
    data: {
      scenario: data.scenario.trim(),
      content: data.content.trim(),
      note: data.note?.trim() || null,
      isFAQ: Boolean(data.isFAQ),
      isPremium: Boolean(data.isPremium),
    },
  })

  revalidatePath("/")
  revalidatePath(`/product/${existing.productId}`)
  revalidatePath("/manage")

  return reply
}

export async function deleteReply(replyId: string) {
  const existing = await prisma.reply.findUnique({
    where: { id: replyId },
    select: { productId: true },
  })

  if (!existing) return

  await prisma.reply.delete({
    where: { id: replyId },
  })

  revalidatePath("/")
  revalidatePath(`/product/${existing.productId}`)
  revalidatePath("/manage")
}

export async function updateProductSalesContent(
  productId: string,
  data: { salesTips: string; bossNotes?: string }
) {
  const updated = await prisma.product.update({
    where: { id: productId },
    data: {
      salesTips: data.salesTips,
      bossNotes: data.bossNotes?.trim() || "",
    },
    select: {
      id: true,
      salesTips: true,
      bossNotes: true,
    },
  })

  revalidatePath("/")
  revalidatePath(`/product/${productId}`)
  revalidatePath("/manage")

  return updated
}

export async function analyzeText(text: string) {
  const products = await prisma.product.findMany({
    include: {
      assets: true,
      replies: true
    },
    orderBy: { updatedAt: 'desc' }
  });

  return pickBestProductByQuery(products, text);
}

export async function analyzeWorkspace(text: string) {
  const products = await prisma.product.findMany({
    include: {
      assets: true,
      replies: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const ranked = rankProductsByQuery(products, text).slice(0, 3);
  const fallback = ranked.length > 0 ? ranked : products.slice(0, 3).map((product) => ({ product, score: 0 }));

  const matches = fallback.map((entry) => ({
    ...entry.product,
    matchScore: entry.score,
    matchReasons: explainProductMatch(entry.product, text),
  }));

  return {
    matches,
    selectedProductId: matches[0]?.id ?? null,
  };
}

export async function saveInquiryCase(data: { queryContent: string, suggestedProductId?: string, finalReply: string }) {
  await prisma.inquiryCase.create({
    data: {
      queryContent: data.queryContent,
      suggestedProductId: data.suggestedProductId,
      finalReply: data.finalReply
    }
  });
}

export async function deleteProduct(id: string) {
  // First delete associated assets and replies (if not set to cascade in schema)
  await prisma.asset.deleteMany({ where: { productId: id } })
  await prisma.reply.deleteMany({ where: { productId: id } })
  
  await prisma.product.delete({
    where: { id }
  })

  revalidatePath("/")
  redirect("/")
}

export async function batchRenameCategory(oldName: string, newName: string) {
  const source = normalizeCategory(oldName)
  const target = normalizeCategory(newName)

  if (!source || !target) {
    throw new Error("請填寫完整的舊名稱與新名稱")
  }
  if (source === target) {
    throw new Error("舊名稱與新名稱不可相同")
  }

  const products = await listProductsWithCategory()

  const idsToUpdate = products
    .filter((product) => normalizeCategory(product.category) === source)
    .map((product) => product.id)

  for (const id of idsToUpdate) {
    await updateProductCategoryById(id, target)
  }

  try {
    await ensureCategoryDictionaryOption(target)
    if (prisma.categoryDictionary?.deleteMany) {
      await prisma.categoryDictionary.deleteMany({
        where: { name: source },
      })
    } else {
      await prisma.$executeRaw`DELETE FROM \`CategoryDictionary\` WHERE \`name\` = ${source}`
    }
  } catch {
    // Do not block batch rename if dictionary sync fails.
  }

  revalidatePath("/")
  revalidatePath("/manage")

  return {
    updatedProducts: idsToUpdate.length,
    oldName: source,
    newName: target,
  }
}

export async function addCategoryOption(name: string) {
  const normalized = normalizeCategory(name)
  if (!normalized) throw new Error("請輸入類別名稱")

  const created = await ensureCategoryDictionaryOption(normalized)

  revalidatePath("/")
  revalidatePath("/manage")

  return created
}

export async function listCategoryOptions() {
  let dictionaryNames: string[] = []
  if (prisma.categoryDictionary?.findMany) {
    const rows = await prisma.categoryDictionary.findMany({
      orderBy: { name: "asc" },
      select: { name: true },
    })
    dictionaryNames = rows.map((row) => row.name)
  } else {
    try {
      const rows = await prisma.$queryRaw<Array<{ name: string }>>`
        SELECT \`name\` FROM \`CategoryDictionary\` ORDER BY \`name\` ASC
      `
      dictionaryNames = rows.map((row) => row.name)
    } catch {
      dictionaryNames = []
    }
  }

  const products = await listProductsWithCategory()
  const categoryFromProducts = products
    .map((product) => normalizeCategory(product.category))
    .filter(Boolean)

  return Array.from(new Set([...dictionaryNames, ...categoryFromProducts])).sort((a, b) =>
    a.localeCompare(b, "zh-Hant")
  )
}

export async function listProblemShortcutOptions() {
  let dictionaryNames: string[] = []
  if (prisma.problemShortcutDictionary?.findMany) {
    const rows = await prisma.problemShortcutDictionary.findMany({
      orderBy: { name: "asc" },
      select: { name: true },
    })
    dictionaryNames = rows.map((row) => row.name)
  } else {
    try {
      const rows = await prisma.$queryRaw<Array<{ name: string }>>`
        SELECT \`name\` FROM \`ProblemShortcutDictionary\` ORDER BY \`name\` ASC
      `
      dictionaryNames = rows.map((row) => row.name)
    } catch {
      dictionaryNames = []
    }
  }

  const products = await listProductsWithProblemShortcuts()
  const shortcutFromProducts = products.flatMap((product) =>
    normalizeProblemShortcuts(product.problemShortcuts)
  )

  return Array.from(new Set([...dictionaryNames, ...shortcutFromProducts])).sort((a, b) =>
    a.localeCompare(b, "zh-Hant")
  )
}

export async function deleteCategoryOption(name: string) {
  const normalized = normalizeCategory(name)
  if (!normalized) throw new Error("請指定要刪除的類別")

  const products = await listProductsWithCategory()
  const idsToClear = products
    .filter((product) => normalizeCategory(product.category) === normalized)
    .map((product) => product.id)

  for (const id of idsToClear) {
    await updateProductCategoryById(id, null)
  }

  const clearedProducts = idsToClear.length

  if (prisma.categoryDictionary?.deleteMany) {
    await prisma.categoryDictionary.deleteMany({
      where: { name: normalized },
    })
  } else {
    await prisma.$executeRaw`DELETE FROM \`CategoryDictionary\` WHERE \`name\` = ${normalized}`
  }

  revalidatePath("/")
  revalidatePath("/manage")

  return {
    name: normalized,
    clearedProducts,
  }
}

export async function addProblemShortcutOption(name: string) {
  const normalized = name.trim()
  if (!normalized) throw new Error("請輸入問題捷徑")

  const created = await ensureProblemShortcutDictionaryOption(normalized)

  revalidatePath("/")
  revalidatePath("/manage")

  return created
}

export async function deleteProblemShortcutOption(name: string) {
  const normalized = name.trim()
  if (!normalized) throw new Error("請指定要刪除的問題捷徑")

  const products = await listProductsWithProblemShortcuts()
  let clearedProducts = 0
  let removedEntries = 0

  for (const product of products) {
    const shortcuts = normalizeProblemShortcuts(product.problemShortcuts)
    if (!shortcuts.includes(normalized)) continue

    const filtered = shortcuts.filter((item) => item !== normalized)
    removedEntries += shortcuts.length - filtered.length
    await updateProductProblemShortcutsById(product.id, filtered)
    clearedProducts += 1
  }

  if (prisma.problemShortcutDictionary?.deleteMany) {
    await prisma.problemShortcutDictionary.deleteMany({
      where: { name: normalized },
    })
  } else {
    await prisma.$executeRaw`DELETE FROM \`ProblemShortcutDictionary\` WHERE \`name\` = ${normalized}`
  }

  revalidatePath("/")
  revalidatePath("/manage")

  return {
    name: normalized,
    clearedProducts,
    removedEntries,
  }
}

export async function batchRenameProblemShortcut(oldName: string, newName: string) {
  const source = oldName.trim()
  const target = newName.trim()

  if (!source || !target) {
    throw new Error("請填寫完整的舊名稱與新名稱")
  }
  if (source === target) {
    throw new Error("舊名稱與新名稱不可相同")
  }

  const products = await listProductsWithProblemShortcuts()

  let updatedProducts = 0
  let replacedEntries = 0

  for (const product of products) {
    const shortcuts = normalizeProblemShortcuts(product.problemShortcuts)
    if (!shortcuts.includes(source)) continue

    const replaced = shortcuts.map((item) => (item === source ? target : item))
    const deduped = Array.from(new Set(replaced))
    replacedEntries += shortcuts.filter((item) => item === source).length

    await updateProductProblemShortcutsById(product.id, deduped)
    updatedProducts += 1
  }

  try {
    await ensureProblemShortcutDictionaryOption(target)
    if (prisma.problemShortcutDictionary?.deleteMany) {
      await prisma.problemShortcutDictionary.deleteMany({
        where: { name: source },
      })
    } else {
      await prisma.$executeRaw`DELETE FROM \`ProblemShortcutDictionary\` WHERE \`name\` = ${source}`
    }
  } catch {
    // Do not block batch rename if dictionary sync fails.
  }

  revalidatePath("/")
  revalidatePath("/manage")

  return {
    updatedProducts,
    replacedEntries,
    oldName: source,
    newName: target,
  }
}
