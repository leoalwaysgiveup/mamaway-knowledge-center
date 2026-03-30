import Link from 'next/link'
import { connection } from "next/server"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  normalizeCategory,
  normalizeProblemShortcuts,
  normalizeTags,
  stripListPrefixForPreview,
} from "@/lib/product-contracts"
import { SidebarTaxonomyManager } from "@/components/SidebarTaxonomyManager"
import { normalizeSearchInput, rankProductsByQuery } from "@/lib/product-matching"
import prisma from "@/lib/prisma"

function extractListPreview(value: unknown, limit: number = 2): string[] {
  if (typeof value !== "string" || !value.trim()) return []

  return value
    .split("\n")
    .map((line) => stripListPrefixForPreview(line.trim()))
    .filter(Boolean)
    .slice(0, limit)
}

function getProductCategory(
  product: { id: string; category?: string | null },
  categoryByProductId: Map<string, string>
): string {
  const explicitCategory = normalizeCategory(product.category)
  if (explicitCategory) return explicitCategory
  return normalizeCategory(categoryByProductId.get(product.id))
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; problem?: string }>
}) {
  await connection()

  const resolvedParams = await searchParams;
  const q = resolvedParams?.q?.trim() || "";
  const category = resolvedParams?.category?.trim() || "";
  const problem = resolvedParams?.problem?.trim() || "";
  const normalizedTextQuery = normalizeSearchInput(q);
  const normalizedCategory = normalizeSearchInput(category);
  const normalizedProblem = normalizeSearchInput(problem);
  
  const allProducts = await prisma.product.findMany({
    include: {
      assets: true,
      replies: true
    },
    orderBy: { updatedAt: 'desc'}
  });

  let productCategoryRows: Array<{ id: string; category: string | null }> = []
  try {
    productCategoryRows = await prisma.$queryRaw<Array<{ id: string; category: string | null }>>`
      SELECT \`id\`, \`category\` FROM \`Product\`
    `
  } catch {
    productCategoryRows = []
  }

  const categoryByProductId = new Map(
    productCategoryRows.map((row) => [row.id, normalizeCategory(row.category)])
  )
  let categoryDictionary: Array<{ name: string }> = []
  if (prisma.categoryDictionary?.findMany) {
    categoryDictionary = await prisma.categoryDictionary.findMany({
      orderBy: { name: "asc" },
      select: { name: true },
    })
  } else {
    try {
      categoryDictionary = await prisma.$queryRaw<Array<{ name: string }>>`
        SELECT \`name\` FROM \`CategoryDictionary\` ORDER BY \`name\` ASC
      `
    } catch {
      categoryDictionary = []
    }
  }
  const dictionaryCategorySet = new Set(categoryDictionary.map((item) => item.name))

  let problemShortcutDictionary: Array<{ name: string }> = []
  if (prisma.problemShortcutDictionary?.findMany) {
    problemShortcutDictionary = await prisma.problemShortcutDictionary.findMany({
      orderBy: { name: "asc" },
      select: { name: true },
    })
  } else {
    try {
      problemShortcutDictionary = await prisma.$queryRaw<Array<{ name: string }>>`
        SELECT \`name\` FROM \`ProblemShortcutDictionary\` ORDER BY \`name\` ASC
      `
    } catch {
      problemShortcutDictionary = []
    }
  }
  const dictionaryProblemShortcutSet = new Set(problemShortcutDictionary.map((item) => item.name))

  const filteredByTaxonomy = allProducts.filter((product) => {
    const productCategory = normalizeSearchInput(getProductCategory(product, categoryByProductId))
    const productShortcuts = normalizeProblemShortcuts(product.problemShortcuts).map((shortcut) =>
      normalizeSearchInput(shortcut)
    )

    if (normalizedCategory && productCategory !== normalizedCategory) return false
    if (
      normalizedProblem &&
      !productShortcuts.some(
        (shortcut) =>
          shortcut === normalizedProblem ||
          shortcut.includes(normalizedProblem) ||
          normalizedProblem.includes(shortcut)
      )
    ) {
      return false
    }
    return true
  })

  const products =
    normalizedTextQuery === ""
      ? filteredByTaxonomy
      : rankProductsByQuery(filteredByTaxonomy, normalizedTextQuery).map((entry) => entry.product);

  const categoryCounter = new Map<string, number>()
  const explicitCategorySet = new Set<string>()
  for (const item of categoryDictionary) {
    categoryCounter.set(item.name, 0)
  }
  for (const product of allProducts) {
    const category = getProductCategory(product, categoryByProductId)
    if (category) explicitCategorySet.add(category)
    if (!category) continue
    categoryCounter.set(category, (categoryCounter.get(category) ?? 0) + 1)
  }

  const categoryItems = Array.from(categoryCounter.entries())
    .map(([label, count]) => ({
      label,
      count,
      canDelete: dictionaryCategorySet.has(label) || explicitCategorySet.has(label),
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "zh-Hant"))

  const problemShortcutCounter = new Map<string, number>()
  const explicitProblemShortcutSet = new Set<string>()
  for (const item of problemShortcutDictionary) {
    problemShortcutCounter.set(item.name, 0)
  }
  for (const product of allProducts) {
    for (const shortcut of normalizeProblemShortcuts(product.problemShortcuts)) {
      explicitProblemShortcutSet.add(shortcut)
      problemShortcutCounter.set(shortcut, (problemShortcutCounter.get(shortcut) ?? 0) + 1)
    }
  }

  const problemShortcutItems = Array.from(problemShortcutCounter.entries())
    .map(([label, count]) => ({
      label,
      query: label,
      count,
      canDelete: dictionaryProblemShortcutSet.has(label) || explicitProblemShortcutSet.has(label),
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "zh-Hant"))

  const productsWithProblemCount = allProducts.filter(
    (product) => normalizeProblemShortcuts(product.problemShortcuts).length > 0
  ).length

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-rose-700 rounded-lg flex items-center justify-center text-white font-black shadow-sm ring-1 ring-rose-900/10">M</div>
            <h1 className="text-lg font-bold tracking-tight text-gray-900">商品回覆與素材查詢中心</h1>
            <div className="h-4 w-px bg-gray-300 mx-2 hidden md:block"></div>
            <div className="hidden md:flex gap-2">
               <Button variant="secondary" size="sm" className="bg-rose-50 text-rose-700 font-bold border border-rose-100 shadow-none rounded-full px-4 hover:bg-rose-100 transition-colors">📁 商品總覽</Button>
               <Link href="/workspace">
                  <Button variant="ghost" size="sm" className="text-gray-500 font-bold hover:text-gray-900 hover:bg-gray-100 transition-colors rounded-full px-4">⚡ 情境工作台</Button>
               </Link>
            </div>
          </div>
          <div className="flex-1 max-w-xl px-8">
            <form className="relative w-full group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-rose-500 transition-colors z-10">🔍</span>
              {category && <input type="hidden" name="category" value={category} />}
              {problem && <input type="hidden" name="problem" value={problem} />}
              <Input name="q" placeholder="先輸入顧客問題（例如：紅屁屁、腰痠、溢乳、悶熱）" defaultValue={q} className="w-full pl-11 bg-gray-100/80 hover:bg-gray-100 border-transparent focus:bg-white focus:border-rose-300 focus:ring-4 focus:ring-rose-500/10 transition-all rounded-full h-11 shadow-sm font-medium text-gray-900 placeholder:text-gray-400" />
            </form>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/manage">
               <Button variant="outline" className="text-sm font-bold hidden md:flex rounded-full shadow-sm hover:text-rose-600 hover:border-rose-300 transition-colors">➕ 新增商品</Button>
            </Link>
            <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 text-xs font-bold shadow-sm cursor-pointer hover:bg-rose-100 transition-colors">A</div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        <SidebarTaxonomyManager
          textQuery={q}
          activeCategory={category}
          activeProblem={problem}
          totalProducts={allProducts.length}
          productsWithProblemCount={productsWithProblemCount}
          categoryItems={categoryItems}
          problemShortcutItems={problemShortcutItems}
        />

        {/* Right Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50/50">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">問題解法商品庫 ({products.length})</h2>
                {(q || category || problem) && (
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {q && (
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                        關鍵字：{q}
                      </span>
                    )}
                    {category && (
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
                        類別：{category}
                      </span>
                    )}
                    {problem && (
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                        問題：{problem}
                      </span>
                    )}
                    <Link href="/" className="text-xs font-semibold text-gray-500 hover:text-gray-900 underline underline-offset-2">
                      清除全部條件
                    </Link>
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => {
                 const productTags = normalizeTags(product.tags);
                 const productShortcutPreview = normalizeProblemShortcuts(product.problemShortcuts).slice(0, 2)
                 const problemPreview = extractListPreview(product.problemsSolved, 2)
                 const audiencePreview = extractListPreview(product.targetAudience, 1)

                 return (
                 <Card key={product.id} className="overflow-hidden hover:border-rose-300 hover:shadow-md transition-all duration-200 flex flex-col group bg-white relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 to-orange-300 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex flex-col items-center justify-center text-center px-6 pt-6 pb-4 relative">
                     <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-rose-700 transition-colors">{product.name}</h3>
                  </div>

                  <CardContent className="px-6 pb-6 pt-2 flex flex-col flex-1 items-center">
                    <div className="w-full mb-4 p-3 rounded-lg border border-gray-100 bg-gray-50/60">
                      {productShortcutPreview.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {productShortcutPreview.map((shortcut) => (
                            <span key={shortcut} className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                              {shortcut}
                            </span>
                          ))}
                        </div>
                      )}
                      {problemPreview.length > 0 ? (
                        <ul className="text-sm font-semibold text-gray-700 space-y-1 text-left">
                          {problemPreview.map((item) => (
                            <li key={item} className="flex gap-2">
                              <span className="text-rose-500 shrink-0">●</span>
                              <span className="break-words">{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-400 text-left">尚未整理可解決問題</p>
                      )}

                      {audiencePreview[0] && (
                        <p className="text-xs text-gray-500 mt-2 text-left">
                          適合對象：{audiencePreview[0]}
                        </p>
                      )}
                    </div>
                    
                    {productTags.length > 0 && (
                       <div className="flex flex-wrap justify-center gap-1.5 mb-6">
                          {productTags.map((t) => (
                             <span key={t} className="text-xs text-gray-600 bg-white border border-gray-200 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 transition-colors px-2.5 py-1 rounded-full font-bold cursor-default shadow-sm">
                                #{t}
                             </span>
                          ))}
                       </div>
                    )}

                    <div className="flex gap-2 mt-auto w-full pt-4 border-t border-gray-100">
                      <Link href={`/product/${product.id}`} className="flex-1">
                        <Button variant="default" className="w-full bg-gray-900 hover:bg-rose-700 transition-colors text-sm font-bold shadow-none rounded-lg h-9">查看商品資料</Button>
                      </Link>
                      <Link href={`/manage?id=${product.id}`} className="shrink-0" title="快速編輯">
                        <Button variant="outline" size="icon" className="shadow-none border-gray-200 text-gray-500 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 transition-colors rounded-lg h-9 w-9">✏️</Button>
                      </Link>
                    </div>
                  </CardContent>
                 </Card>
                 )
              })}
              {products.length === 0 && (
                <div className="col-span-full py-20 text-center text-gray-500 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <span className="text-4xl mb-2 block">🔍</span>
                  <p>
                    找不到符合條件的商品
                    {[q && `關鍵字「${q}」`, category && `類別「${category}」`, problem && `問題「${problem}」`]
                      .filter(Boolean)
                      .join("、")}
                    。
                  </p>
                  {category && (
                    <p className="text-sm mt-2">
                      這個類別目前尚未指派商品，請到
                      {" "}
                      <Link href="/manage" className="underline underline-offset-2 font-semibold text-gray-700 hover:text-gray-900">
                        商品編輯
                      </Link>
                      {" "}
                      填寫「商品類別」。
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
