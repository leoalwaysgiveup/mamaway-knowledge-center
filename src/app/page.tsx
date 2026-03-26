import Link from 'next/link'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import prisma from "@/lib/prisma"

export default async function Home({ searchParams }: { searchParams: Promise<{ query?: string }> }) {
  const resolvedParams = await searchParams;
  const query = resolvedParams?.query || "";
  
  const allProducts = await prisma.product.findMany({
    include: {
      assets: true,
      replies: true
    },
    orderBy: { updatedAt: 'desc'}
  });

  const products = allProducts.filter((p: any) => {
    const pTags = p.tags as string[] | null;
    return p.name.includes(query) || (pTags && Array.isArray(pTags) && pTags.some((tag: string) => tag.includes(query)))
  });

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
              <Input name="query" placeholder="全域搜尋商品名稱、標籤..." defaultValue={query} className="w-full pl-11 bg-gray-100/80 hover:bg-gray-100 border-transparent focus:bg-white focus:border-rose-300 focus:ring-4 focus:ring-rose-500/10 transition-all rounded-full h-11 shadow-sm font-medium text-gray-900 placeholder:text-gray-400" />
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
        {/* Left Sidebar (Filters) */}
        <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col p-6 overflow-y-auto">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">分類篩選</h2>
          <div className="space-y-1 mt-2">
            <Link href="/" className={`w-full flex items-center justify-between text-sm font-bold px-3 py-2.5 rounded-lg transition-colors ${query === "" ? "text-rose-700 bg-rose-50 border border-rose-100" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent"}`}>
              全部商品
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full tracking-wide ${query === "" ? "bg-rose-200 text-rose-800" : "bg-gray-100 text-gray-500"}`}>{allProducts.length}</span>
            </Link>
            <Link href="?query=孕期" className={`w-full flex items-center justify-between text-sm font-bold px-3 py-2.5 rounded-lg transition-colors ${query === "孕期" ? "text-rose-700 bg-rose-50 border border-rose-100" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent"}`}>
              孕期穿著
            </Link>
            <Link href="?query=哺乳" className={`w-full flex items-center justify-between text-sm font-bold px-3 py-2.5 rounded-lg transition-colors ${query === "哺乳" ? "text-rose-700 bg-rose-50 border border-rose-100" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent"}`}>
               哺乳內衣
            </Link>
            <Link href="?query=洗沐" className={`w-full flex items-center justify-between text-sm font-bold px-3 py-2.5 rounded-lg transition-colors ${query === "洗沐" ? "text-rose-700 bg-rose-50 border border-rose-100" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent"}`}>
               洗沐護理
            </Link>
          </div>
          <hr className="my-6 border-gray-100" />
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">狀態排序</h2>
          <select className="w-full text-sm border-gray-200 rounded-md p-2 bg-white shadow-sm focus:border-rose-500 focus:ring-rose-500">
             <option>最近更新優先</option>
             <option>建立時間排序</option>
             <option>回覆數量最多</option>
          </select>
        </aside>

        {/* Right Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50/50">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">商品資料夾 ({products.length})</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product: any) => {
                 const hasVideo = product.assets.some((a: any) => a.type === '影片');
                 const hasPremium = product.replies.some((r: any) => r.isPremium);

                 return (
                 <Card key={product.id} className="overflow-hidden hover:border-rose-300 hover:shadow-md transition-all duration-200 flex flex-col group bg-white relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 to-orange-300 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex flex-col items-center justify-center text-center px-6 pt-8 pb-4 relative">
                     <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-rose-700 transition-colors">{product.name}</h3>
                     <span className="text-xs font-medium text-gray-400 mt-2 tracking-wider tabular-nums bg-gray-50 px-2.5 py-0.5 rounded-full border border-gray-100">更新：{new Date(product.updatedAt).toLocaleDateString()}</span>
                  </div>

                  <CardContent className="px-6 pb-6 pt-2 flex flex-col flex-1 items-center">
                    
                    {/* Manual Search Tags */}
                    {product.tags && Array.isArray(product.tags) && product.tags.length > 0 && (
                       <div className="flex flex-wrap justify-center gap-1.5 mb-6">
                          {product.tags.map((t: any) => (
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
                  <p>找不到符合「{query}」的商品。</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
