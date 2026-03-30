import { notFound } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { ReplyTabEditor } from "@/components/ReplyTabEditor"
import { SalesTabEditor } from "@/components/SalesTabEditor"
import { AssetTabEditor } from "@/components/AssetTabEditor"
import { isImageAssetType, normalizeAssetType, stripListPrefixForPreview } from "@/lib/product-contracts"
import prisma from "@/lib/prisma"

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const product = await prisma.product.findUnique({
    where: { id: resolvedParams.id },
    include: {
      assets: true,
      replies: true
    }
  });
  
  if (!product) return notFound()

  const normalizedAssets = product.assets.map((asset) => ({
    ...asset,
    type: normalizeAssetType(asset.type),
  }))

  // Helper to render lists with optional bullets and preserved spacing
  const renderList = (text: string | null, bulletColor: string = "text-rose-500", isBold: boolean = false) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return <div key={i} className="h-2" />;

      const cleanedLine = stripListPrefixForPreview(trimmedLine);
      if (!cleanedLine) return <div key={i} className="h-2" />;
      
      return (
        <li key={i} className="flex gap-2">
          <span className={`${bulletColor} shrink-0`}>●</span>
          <span className={`flex-1 break-words ${isBold ? 'font-bold' : ''}`}>{cleanedLine}</span>
        </li>
      );
    });
  };

  const mainImage =
    normalizedAssets.find((a) => a.type === "product_img")?.url ||
    normalizedAssets.find((a) => isImageAssetType(a.type))?.url;
  const officialUrl = normalizedAssets.find((a) => a.type === "official_url")?.url || "";
  const testimonialUrl = normalizedAssets.find((a) => a.type === "testimonial_url")?.url || "";

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-3">
             <Link href="/" className="text-gray-500 hover:text-gray-900 transition-colors mr-2 font-bold text-sm bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-full">&larr; 返回列表</Link>
             <div className="w-1 h-4 bg-gray-200"></div>
             <span className="font-extrabold text-gray-900 ml-2 tracking-tight">{product.name}</span>
          </div>
          <Link href={`/manage?id=${product.id}`}>
             <Button variant="outline" size="sm" className="font-bold text-gray-700 shadow-sm hover:text-rose-600 hover:border-rose-300 transition-colors rounded-full px-4">✏️ 編輯商品</Button>
          </Link>
        </div>
      </header>

      {/* Main Layout: Desktop First Sticky Sidebar */}
      <div className="flex-1 max-w-[1400px] mx-auto w-full flex flex-col md:flex-row gap-6 p-4 md:p-6 lg:p-8">
        
        {/* Left Sticky Sidebar: Product Abstract */}
        <aside className="w-full md:w-80 lg:w-96 shrink-0 md:sticky md:top-20 self-start space-y-4">
           <Card className="shadow-sm border-gray-200 overflow-hidden bg-white">
              <div className="h-64 bg-white flex items-center justify-center border-b border-gray-100 relative group cursor-pointer hover:bg-gray-50 transition-colors p-4">
                 {mainImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={mainImage} alt={product.name} className="w-full h-full object-contain" />
                 ) : (
                    <span className="text-5xl opacity-20 group-hover:scale-110 transition-transform">🛍️</span>
                 )}
                  <span className="absolute bottom-2 right-2 text-xs font-bold text-rose-600 bg-white/90 px-3 py-1.5 rounded-full border border-rose-100 z-10 flex items-center gap-1">
                    📸 <span>到素材分頁編輯</span>
                  </span>
               </div>
              <CardContent className="p-5">
                 <h1 className="text-2xl font-bold tracking-tight text-gray-900 text-center mb-5">{product.name}</h1>

                 <div className="pt-2 border-t border-gray-100 space-y-2">
                    {officialUrl ? (
                      <a href={officialUrl} target="_blank" rel="noreferrer" className="block">
                        <Button variant="secondary" className="w-full bg-rose-50 text-rose-700 hover:bg-rose-100 border-none justify-start font-bold">
                          🔗 前往商品官網
                        </Button>
                      </a>
                    ) : (
                      <Button variant="secondary" className="w-full bg-gray-100 text-gray-400 border-none justify-start font-bold" disabled>
                        🔗 尚未設定商品官網
                      </Button>
                    )}

                    {testimonialUrl ? (
                      <a href={testimonialUrl} target="_blank" rel="noreferrer" className="block">
                        <Button variant="outline" className="w-full font-bold shadow-sm text-gray-700 bg-white border-gray-300 justify-start">
                          🥰 前往使用見證
                        </Button>
                      </a>
                    ) : (
                      <Button variant="outline" className="w-full font-bold text-gray-400 bg-white border-gray-200 justify-start" disabled>
                        🥰 尚未設定使用見證網址
                      </Button>
                    )}

                 </div>

                 <div className="mt-6 pt-5 border-t border-gray-100">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">🎯 鎖定推薦對象</div>
                    <ul className="space-y-2">
                       {renderList(product.targetAudience, "text-orange-500", true)}
                    </ul>
                 </div>
              </CardContent>
           </Card>
        </aside>

        {/* Right Main Content Area: Tabs */}
        <main className="flex-1 min-w-0">
          <Tabs defaultValue="overview" className="w-full">
            <div className="bg-white px-2 pt-2 border border-gray-200 rounded-t-xl shadow-sm mb-4 sticky top-[72px] z-30">
               <TabsList className="bg-transparent h-auto p-0 rounded-none w-full justify-start space-x-6 overflow-x-auto flex-nowrap border-b border-gray-200">
                 <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent hover:text-gray-900 data-[state=active]:border-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 px-2 py-3 text-gray-500 font-bold transition-colors whitespace-nowrap">商品概覽</TabsTrigger>
                 <TabsTrigger value="sales" className="rounded-none border-b-2 border-transparent hover:text-gray-900 data-[state=active]:border-gray-200 data-[state=active]:bg-[#f7f4eb] data-[state=active]:text-gray-900 px-2 py-3 text-gray-500 font-bold transition-colors whitespace-nowrap">怎麼賣 / 銷售重點</TabsTrigger>
                 <TabsTrigger value="faq" className="rounded-none border-b-2 border-transparent hover:text-gray-900 data-[state=active]:border-gray-200 data-[state=active]:bg-[#f7f4eb] data-[state=active]:text-gray-900 px-2 py-3 text-gray-500 font-bold transition-colors whitespace-nowrap">FAQ / 門市 Q&A</TabsTrigger>
                 <TabsTrigger value="replies" className="rounded-none border-b-2 border-transparent hover:text-gray-900 data-[state=active]:border-gray-200 data-[state=active]:bg-[#f7f4eb] data-[state=active]:text-gray-900 px-2 py-3 text-gray-500 font-bold transition-colors whitespace-nowrap">過往回覆</TabsTrigger>
                 <TabsTrigger value="assets" className="rounded-none border-b-2 border-transparent hover:text-gray-900 data-[state=active]:border-gray-200 data-[state=active]:bg-[#f7f4eb] data-[state=active]:text-gray-900 px-2 py-3 text-gray-500 font-bold transition-colors whitespace-nowrap">素材 ({normalizedAssets.length})</TabsTrigger>
               </TabsList>
            </div>

            <TabsContent value="overview" className="focus-visible:outline-none focus-visible:ring-0">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Semantic Cards for Overview instead of one big white area */}
                  <Card className="shadow-sm border-gray-200 bg-white">
                     <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-3">
                        <CardTitle className="text-base text-gray-900">🏷️ 成分/材質</CardTitle>
                     </CardHeader>
                     <CardContent className="p-5">
                        <p className="text-sm text-gray-700 font-medium">{product.ingredients}</p>
                     </CardContent>
                  </Card>

                  <Card className="shadow-sm border-gray-200 bg-white">
                     <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-3">
                        <CardTitle className="text-base text-gray-900">📖 商品描述</CardTitle>
                     </CardHeader>
                     <CardContent className="p-5">
                        <p className="text-sm text-gray-700 font-medium leading-relaxed whitespace-pre-line">{product.description}</p>
                     </CardContent>
                  </Card>

                  <Card className="shadow-sm border-gray-200 bg-white">
                     <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-3">
                        <CardTitle className="text-base text-gray-900">✅ 核心賣點詳述</CardTitle>
                     </CardHeader>
                     <CardContent className="p-5">
                        <ul className="space-y-2 text-sm text-gray-700 font-medium">
                           {renderList(product.coreSellingPoints)}
                        </ul>
                     </CardContent>
                  </Card>
                  
                  <Card className="shadow-sm border-gray-200 bg-white">
                     <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-3">
                        <CardTitle className="text-base text-gray-900">🤕 解決痛點</CardTitle>
                     </CardHeader>
                     <CardContent className="p-5">
                        <ul className="space-y-2 text-sm text-gray-700 font-medium">
                           {renderList(product.problemsSolved, "text-blue-500")}
                        </ul>
                     </CardContent>
                  </Card>

                  <Card className="shadow-sm border-gray-200 bg-white lg:col-span-2">
                     <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-3">
                        <CardTitle className="text-base text-gray-900">📝 內部行政補充</CardTitle>
                     </CardHeader>
                     <CardContent className="p-5">
                        <p className="text-sm text-gray-600 font-medium">該商品建立於：{new Date(product.updatedAt).toLocaleDateString()}，負責PM：尚未指派。</p>
                     </CardContent>
                  </Card>
               </div>
            </TabsContent>

            <TabsContent value="sales" className="focus-visible:outline-none focus-visible:ring-0">
              <SalesTabEditor
                productId={product.id}
                initialSalesTips={product.salesTips}
                initialBossNotes={product.bossNotes}
              />
            </TabsContent>

            <TabsContent value="faq">
              <ReplyTabEditor
                productId={product.id}
                mode="faq"
                initialReplies={product.replies}
              />
            </TabsContent>

            <TabsContent value="replies">
              <ReplyTabEditor
                productId={product.id}
                mode="replies"
                initialReplies={product.replies}
              />
            </TabsContent>

            <TabsContent value="assets" className="focus-visible:outline-none focus-visible:ring-0">
              <AssetTabEditor
                productId={product.id}
                initialAssets={normalizedAssets}
              />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
