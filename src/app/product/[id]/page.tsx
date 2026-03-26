import { notFound } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Link from 'next/link'
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

  const targetAudienceArray = product.targetAudience?.split('\n').filter(Boolean) || [];
  const coreSellingPointsArray = product.coreSellingPoints?.split('\n').filter(Boolean) || [];
  const problemsSolvedArray = product.problemsSolved?.split('\n').filter(Boolean) || [];

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
              <div className="h-48 bg-gray-100 flex items-center justify-center border-b border-gray-100 relative group cursor-pointer hover:bg-gray-200 transition-colors">
                 <span className="text-5xl opacity-20 group-hover:scale-110 transition-transform">🛍️</span>
                 {/* 透過點擊圖片可預覽或換圖的功能，供內部使用 */}
                 <span className="absolute bottom-2 right-2 text-xs font-bold text-gray-500 bg-white/80 px-2 py-1 rounded">更換相片</span>
              </div>
              <CardContent className="p-5">
                 <h1 className="text-2xl font-bold tracking-tight text-gray-900 text-center mb-5">{product.name}</h1>

                 <div className="pt-2 border-t border-gray-100 space-y-2">
                    <div className="flex gap-2">
                       <Button variant="secondary" className="flex-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border-none justify-start font-bold">
                          🔗 前往商品官網
                       </Button>
                       <Button variant="outline" size="icon" className="shrink-0 border-rose-200 text-rose-700 hover:bg-rose-50" title="複製連結">
                          📋
                       </Button>
                    </div>
                    
                    <div className="flex gap-2">
                       <Button variant="outline" className="flex-1 font-bold shadow-sm text-gray-700 bg-white border-gray-300 justify-start">
                          🥰 前往使用見證
                       </Button>
                       <Button variant="outline" size="icon" className="shrink-0 text-gray-500" title="複製連結">
                          📋
                       </Button>
                    </div>

                    <div className="flex gap-2">
                       <Button variant="outline" className="flex-1 font-bold shadow-sm text-gray-700 bg-white border-gray-300 justify-start">
                          🖼️ 開啟商品主視覺
                       </Button>
                       <Button variant="outline" size="icon" className="shrink-0 text-gray-500" title="複製圖片連結">
                          📋
                       </Button>
                    </div>
                 </div>

                 <div className="mt-6 pt-5 border-t border-gray-100">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">🎯 鎖定推薦對象</div>
                    <ul className="space-y-2">
                       {targetAudienceArray.map((point: string, idx: number) => (
                          <li key={idx} className="flex items-start">
                             <span className="text-orange-500 mr-2 text-[10px] mt-1">●</span>
                             <span className="text-sm text-gray-700 font-bold">{point}</span>
                          </li>
                       ))}
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
                 <TabsTrigger value="sales" className="rounded-none border-b-2 border-transparent hover:text-gray-900 data-[state=active]:border-rose-600 data-[state=active]:bg-transparent data-[state=active]:text-rose-600 px-2 py-3 text-gray-500 font-bold transition-colors whitespace-nowrap">怎麼賣 / 銷售重點</TabsTrigger>
                 <TabsTrigger value="replies" className="rounded-none border-b-2 border-transparent hover:text-gray-900 data-[state=active]:border-rose-600 data-[state=active]:bg-transparent data-[state=active]:text-rose-600 px-2 py-3 text-gray-500 font-bold transition-colors whitespace-nowrap">過往回覆 ({product.replies.length})</TabsTrigger>
                 <TabsTrigger value="assets" className="rounded-none border-b-2 border-transparent hover:text-gray-900 data-[state=active]:border-rose-600 data-[state=active]:bg-transparent data-[state=active]:text-rose-600 px-2 py-3 text-gray-500 font-bold transition-colors whitespace-nowrap">素材 ({product.assets.length})</TabsTrigger>
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
                        <p className="text-sm text-gray-700 font-medium leading-relaxed">{product.description}</p>
                     </CardContent>
                  </Card>

                  <Card className="shadow-sm border-gray-200 bg-white">
                     <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-3">
                        <CardTitle className="text-base text-gray-900">✅ 核心賣點詳述</CardTitle>
                     </CardHeader>
                     <CardContent className="p-5">
                        <ul className="space-y-2 text-sm text-gray-700 font-medium">
                           {coreSellingPointsArray.map((p: string, i: number) => (
                              <li key={i} className="flex gap-2">
                                 <span className="text-rose-500">&bull;</span>
                                 <span>{p}</span>
                              </li>
                           ))}
                        </ul>
                     </CardContent>
                  </Card>
                  
                  <Card className="shadow-sm border-gray-200 bg-white">
                     <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-3">
                        <CardTitle className="text-base text-gray-900">🤕 解決痛點</CardTitle>
                     </CardHeader>
                     <CardContent className="p-5">
                        <ul className="space-y-2 text-sm text-gray-700 font-medium">
                           {problemsSolvedArray.map((p: string, i: number) => (
                              <li key={i} className="flex gap-2">
                                 <span className="text-blue-500">&bull;</span>
                                 <span>{p}</span>
                              </li>
                           ))}
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

            <TabsContent value="sales" className="space-y-4 focus-visible:outline-none focus-visible:ring-0">
               <div className="grid grid-cols-1 gap-4">
                  <Card className="shadow-sm border-orange-200 bg-[#FFF9F2]">
                     <CardHeader className="pb-2">
                        <CardTitle className="text-lg text-orange-900 flex items-center gap-2">💡 一線銷售指引 (Sales Tips)</CardTitle>
                     </CardHeader>
                     <CardContent>
                        <p className="whitespace-pre-line text-gray-800 leading-relaxed font-bold block">
                           {product.salesTips}
                        </p>
                     </CardContent>
                  </Card>

                  {product.bossNotes && (
                     <Card className="shadow-sm border-green-200 bg-[#F2FCF5]">
                        <CardHeader className="pb-2">
                           <CardTitle className="text-lg text-green-900 flex items-center gap-2">♻️ 內部叮嚀 / 老闆筆記</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <p className="whitespace-pre-line text-gray-800 leading-relaxed font-bold block">
                              {product.bossNotes}
                           </p>
                        </CardContent>
                     </Card>
                  )}
               </div>
            </TabsContent>

            <TabsContent value="replies" className="space-y-4 focus-visible:outline-none focus-visible:ring-0">
               <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm mb-4 flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative flex-1 w-full">
                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                     <Input type="search" placeholder="在回覆庫中搜尋關鍵字..." className="pl-9 bg-gray-50 max-w-sm" />
                  </div>
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                     <label className="flex items-center gap-2 text-sm font-bold text-gray-700 cursor-pointer">
                        <input type="checkbox" className="rounded text-rose-600 focus:ring-rose-600 border-gray-300" />
                        ⭐ 只看優質神回覆
                     </label>
                     <select className="text-sm border-gray-200 rounded-md p-2 font-medium bg-white focus:border-rose-500">
                        <option>所有回覆情境</option>
                        {Array.from(new Set(product.replies.map((r: any) => r.scenario))).map((scene: any) => (
                           <option key={scene}>{scene}</option>
                        ))}
                     </select>
                  </div>
               </div>
               
               {product.replies.map((reply: any) => (
                  <Card key={reply.id} className="shadow-sm border border-gray-200 relative overflow-hidden bg-white hover:border-rose-300 transition-colors">
                     {reply.isPremium && <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-100 to-transparent -rotate-12 translate-x-4 -translate-y-4 pointer-events-none"></div>}
                     <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-56 bg-gray-50 p-4 border-b sm:border-b-0 sm:border-r border-gray-200 flex flex-col">
                           <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">對應情境</span>
                           <h4 className="font-bold text-gray-900 mb-3">{reply.scenario}</h4>
                           <div className="flex flex-col gap-2 mt-auto">
                              {reply.isPremium && <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-none w-fit font-bold shadow-none">⭐ 優質神回覆</Badge>}
                              {reply.note && <Badge variant="outline" className="bg-white text-gray-600 border-gray-200 w-fit">語氣: {reply.note}</Badge>}
                           </div>
                        </div>
                        <div className="flex-1 p-5 flex flex-col justify-between">
                           <p className="text-gray-900 leading-relaxed text-[15px] mb-6 font-medium whitespace-pre-wrap">{reply.content}</p>
                           <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
                              <div className="flex items-center gap-2">
                                 {reply.assetId && (
                                    <Button variant="ghost" size="sm" className="text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 font-semibold h-8 rounded-md">
                                       🔗 搭配指定素材 #{reply.assetId}
                                    </Button>
                                 )}
                              </div>
                              <div className="flex items-center gap-2">
                                 <Button variant="outline" size="sm" className="text-purple-700 border-purple-200 bg-purple-50 hover:bg-purple-100 h-8 font-bold">✨ AI 改寫</Button>
                                 <Button size="sm" className="bg-gray-900 text-white hover:bg-gray-800 shadow-sm h-8 font-bold">📋 複製文字</Button>
                              </div>
                           </div>
                        </div>
                     </div>
                  </Card>
               ))}
               {product.replies.length === 0 && (
                  <div className="py-16 text-center text-gray-400 border border-dashed border-gray-300 rounded-lg bg-gray-50/50">
                     查無符合此條件的回覆紀錄。
                  </div>
               )}
            </TabsContent>

            <TabsContent value="assets" className="focus-visible:outline-none focus-visible:ring-0">
               <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                 {product.assets.map((asset: any) => (
                    <Card key={asset.id} className="shadow-sm border-gray-200 overflow-hidden flex flex-col bg-white">
                       {asset.type === '圖片' ? (
                          <div className="bg-gray-100 aspect-video w-full border-b border-gray-100 relative group cursor-pointer">
                             {/* eslint-disable-next-line @next/next/no-img-element */}
                             <img src={asset.url} alt={asset.title} className="w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center transition-all">
                                <span className="opacity-0 group-hover:opacity-100 bg-white/95 text-gray-900 text-xs font-bold px-3 py-1.5 rounded shadow-sm">放大檢視</span>
                             </div>
                          </div>
                       ) : (
                          <div className="bg-gray-50 flex-1 aspect-video flex flex-col items-center justify-center text-center border-b border-gray-200 px-4 group">
                             <a href={asset.url} target="_blank" rel="noreferrer">
                                <Button variant="secondary" size="sm" className="shadow-sm bg-white border border-gray-200 group-hover:bg-gray-50">▶️ 開啟 {asset.type}</Button>
                             </a>
                          </div>
                       )}
                       <CardContent className="p-3 bg-white flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                             <Badge variant="secondary" className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1 py-0">{asset.type}</Badge>
                             <h3 className="font-bold text-gray-900 text-sm truncate">{asset.title}</h3>
                          </div>
                          {asset.note && <p className="text-[11px] text-gray-500 font-medium truncate">{asset.note}</p>}
                          <div className="mt-2 pt-2 border-t border-gray-50 flex gap-1">
                             <Button variant="ghost" size="sm" className="h-6 text-[10px] flex-1 text-gray-600 border border-gray-100 font-bold bg-gray-50">下載 / 儲存</Button>
                             <Button variant="ghost" size="sm" className="h-6 text-[10px] flex-1 text-gray-600 border border-gray-100 font-bold bg-gray-50">複製網址</Button>
                          </div>
                       </CardContent>
                    </Card>
                 ))}
               </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
