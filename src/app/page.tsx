import Link from 'next/link'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export const MOCK_PRODUCTS = [
  {
    id: "1",
    name: "超彈力無縫托腹帶",
    description: "專為亞洲孕婦體型設計的無縫托腹帶，採用高透氣彈性布料，能隨著孕肚變化自然延伸，有效緩解孕晚期的腰痠背痛與下墜感。一體成型的無縫編織技術，穿著時不會有勒痕與刺癢感，甚至產後也能繼續做為束腹帶使用。",
    ingredients: "85% 尼龍 (Nylon)、15% 彈性纖維 (Spandex)",
    tags: ["托腹帶", "恥骨痛", "孕晚期", "肚皮下墜"],
    pitch: "從孕期到產後，完美支撐不勒肚",
    coreSellingPoints: ["無縫編織不刺癢", "業界最強彈力", "產後可當束腹帶"],
    problemsSolved: ["孕晚期腰痠背痛", "肚子下墜感", "一般托腹帶悶熱"],
    targetAudience: ["懷孕4個月以上", "腰痠恥骨痛媽咪"],
    salesTips: "銷售時請讓客人親手拉拉看彈力。強調『買一條抵兩條』，產後也能繼續穿。",
    bossNotes: "這款紗線成本是市面上兩倍，絕不打價格戰，講究包覆性與親膚度。",
    variantsInfo: "",
    lastUpdated: "2024-03-25",
    assets: [
      { id: '11', title: "商品主視覺", type: "圖片", url: "https://via.placeholder.com/600x400?text=主視覺", note: "官網首圖" },
      { id: '12', title: "實穿分享", type: "圖片", url: "https://via.placeholder.com/600x400?text=UGC", note: "社群可用" },
      { id: '13', title: "穿戴教學", type: "影片", url: "https://youtube.com/watch", note: "新手媽咪必看" }
    ],
    replies: [
      { id: '21', content: "這款托腹帶非常透氣，即使夏天穿也很舒服喔！", scenario: "詢問是否悶熱", note: "溫和安撫型", isPremium: true, assetId: "12" },
      { id: '22', content: "彈性極佳，從孕期可以一路穿到產後作為束腹帶，非常超值！", scenario: "覺得單價高", note: "強調 CP 值", isPremium: true, assetId: "13" }
    ]
  },
  {
    id: "3",
    name: "SILVÉRION®抗菌噴霧",
    description: "醫療級抑菌噴霧，專為家有嬰幼兒的環境設計。採用 SILVÉRION® 檸檬酸銀離子技術，無酒精、無色無味，不刺激寶寶皮膚與呼吸道。噴灑後30秒即刻抑菌，且免水洗，適合噴灑於玩具、餐桌、推車等寶寶容易接觸的表面。",
    ingredients: "純水 (Purified Water)、檸檬酸銀離子 (SILVÉRION® Silver Citrate)",
    tags: ["消毒", "噴霧", "玩具清潔", "無酒精"],
    pitch: "醫療級抑菌99.9%，溫和不刺鼻",
    coreSellingPoints: ["EPA認證檸檬酸銀離子", "無酒精無色無味", "30秒即刻抑菌"],
    problemsSolved: ["酒精刺激寶寶皮膚", "傳統消毒水刺鼻", "擔心寶寶咬玩具"],
    targetAudience: ["家有嬰幼兒", "外出消毒需求"],
    salesTips: "主打『無酒精』，特別適合口慾期喜歡四處舔咬的寶寶，可噴玩具與餐桌。",
    bossNotes: "包裝做不透光設計避免銀離子變黑，這點必須教育前線與客人以免客訴。",
    variantsInfo: "🟢 【補充包/1000ml】銷售重點：請引導買過噴瓶的客人帶補充包，大包裝CP值更高又環保。",
    lastUpdated: "2024-03-24",
    assets: [
      { id: '41', title: "SGS 檢驗報告", type: "圖片", url: "https://via.placeholder.com/600x400?text=SGS", note: "針對抑菌效果有疑慮時出示" }
    ],
    replies: [
      { id: '51', content: "我們使用的是醫療級 SILVÉRION® 檸檬酸銀離子，不含酒精，噴完免水洗，就算寶寶舔食也是安全無毒的喔！", scenario: "寶寶吃到會不會怎樣", note: "專業安撫", isPremium: true, assetId: "41" },
    ]
  }
];

export default async function Home({ searchParams }: { searchParams: Promise<{ query?: string }> }) {
  const resolvedParams = await searchParams;
  const query = resolvedParams?.query || "";
  const products = MOCK_PRODUCTS.filter((p) => 
    p.name.includes(query) || 
    (p.tags && p.tags.some(tag => tag.includes(query)))
  );

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
            <button className="w-full flex items-center justify-between text-sm font-bold text-rose-700 bg-rose-50 px-3 py-2.5 rounded-lg transition-colors border border-rose-100">
              全部商品
              <span className="text-xs font-bold bg-rose-200 text-rose-800 px-2 py-0.5 rounded-full tracking-wide">23</span>
            </button>
            <button className="w-full flex items-center justify-between text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2.5 rounded-lg transition-colors border border-transparent">
              孕期穿著
              <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">8</span>
            </button>
            <button className="w-full flex items-center justify-between text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2.5 rounded-lg transition-colors border border-transparent">
              哺乳內衣
              <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">12</span>
            </button>
            <button className="w-full flex items-center justify-between text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2.5 rounded-lg transition-colors border border-transparent">
              洗沐護理
              <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">3</span>
            </button>
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
              {products.map((product) => {
                 const hasVideo = product.assets.some(a => a.type === '影片');
                 const hasPremium = product.replies.some(r => r.isPremium);

                 return (
                 <Card key={product.id} className="overflow-hidden hover:border-rose-300 hover:shadow-md transition-all duration-200 flex flex-col group bg-white relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 to-orange-300 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex flex-col items-center justify-center text-center px-6 pt-8 pb-4 relative">
                     <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-rose-700 transition-colors">{product.name}</h3>
                     <span className="text-xs font-medium text-gray-400 mt-2 tracking-wider tabular-nums bg-gray-50 px-2.5 py-0.5 rounded-full border border-gray-100">更新：{product.lastUpdated}</span>
                  </div>

                  <CardContent className="px-6 pb-6 pt-2 flex flex-col flex-1 items-center">
                    
                    {/* Manual Search Tags */}
                    {product.tags && product.tags.length > 0 && (
                       <div className="flex flex-wrap justify-center gap-1.5 mb-6">
                          {product.tags.map(t => (
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
