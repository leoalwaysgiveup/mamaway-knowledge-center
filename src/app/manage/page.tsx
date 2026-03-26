"use client";

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { createProduct } from "@/app/actions"

export default function ManagePage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-24">
      {/* Sticky Top Navbar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 max-w-4xl py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900 px-2 -ml-2 font-medium">&larr; 放棄並返回</Button>
            </Link>
            <h1 className="text-lg font-bold text-gray-900 border-l border-gray-300 pl-4">編輯商品 / 新增商品</h1>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="font-semibold shadow-sm bg-white">儲存草稿</Button>
            <Button type="submit" form="product-form" className="font-bold shadow-sm bg-rose-600 hover:bg-rose-700 text-white">確認發布</Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl mt-8">
        <form id="product-form" action={createProduct} className="space-y-8">
          
          {/* Section 1: Basic Info */}
          <Card className="shadow-sm border-gray-200 overflow-hidden">
            <CardHeader className="bg-gray-50 border-b border-gray-200 py-4">
              <CardTitle className="text-base text-gray-800 flex items-center gap-2">
                 <span className="w-6 h-6 rounded bg-gray-200 text-gray-600 flex items-center justify-center text-xs">1</span> 
                 基礎識別資訊
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-bold text-gray-700">商品名稱 <span className="text-rose-500">*</span></label>
                    <Input name="name" required placeholder="例如：超彈力無縫托腹帶" className="border-gray-300 focus-visible:ring-rose-500 font-medium" />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-bold text-gray-700">一句話定位 (Pitch)</label>
                    <Input name="pitch" placeholder="例如：從孕期到產後，完美支撐不勒肚" className="border-gray-300 focus-visible:ring-rose-500 font-medium" />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-bold text-gray-700">搜尋關鍵字 (Tags)</label>
                    <Input name="tags" placeholder="請用逗號分隔，例如：托腹帶, 恥骨痛, 孕晚期" className="border-gray-300 focus-visible:ring-rose-500 font-medium" />
                    <p className="text-xs text-gray-400">這些標籤將用於首頁搜尋，幫助快速定位商品</p>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-bold text-gray-700">商品描述</label>
                    <Textarea name="description" placeholder="輸入完整的商品描述..." className="h-20 border-gray-300 focus-visible:ring-rose-500 font-medium text-sm resize-none" />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-bold text-gray-700">成分 / 材質</label>
                    <Input name="ingredients" placeholder="例如：純水、檸檬酸銀離子" className="border-gray-300 focus-visible:ring-rose-500 font-medium" />
                  </div>
                </div>
            </CardContent>
          </Card>

          {/* Section 2: Core Context */}
          <Card className="shadow-sm border-gray-200 overflow-hidden">
            <CardHeader className="bg-gray-50 border-b border-gray-200 py-4">
              <CardTitle className="text-base text-gray-800 flex items-center gap-2">
                 <span className="w-6 h-6 rounded bg-gray-200 text-gray-600 flex items-center justify-center text-xs">2</span> 
                 核心賣點與推薦情境
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid gap-6">
              <div className="grid gap-3">
                <div className="flex justify-between items-end">
                   <Label htmlFor="coreSellingPoints" className="text-gray-700 font-bold">核心賣點 (Core Selling Points)</Label>
                   <span className="text-xs text-gray-400">建議條列式輸入 (換行分隔)</span>
                </div>
                <Textarea id="coreSellingPoints" name="coreSellingPoints" rows={3} placeholder="例：&#10;- 無縫編織不刺癢&#10;- 業界最強彈力" className="bg-white border-gray-300 focus-visible:ring-rose-500 font-mono" />
              </div>

              <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                <div className="grid gap-3">
                  <Label htmlFor="problemsSolved" className="text-gray-700 font-bold">適合解決的問題</Label>
                  <Textarea id="problemsSolved" name="problemsSolved" rows={3} placeholder="例：&#10;- 孕晚期腰痠背痛" className="bg-white border-gray-300 focus-visible:ring-blue-500" />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="targetAudience" className="text-gray-700 font-bold">精準推薦對象</Label>
                  <Textarea id="targetAudience" name="targetAudience" rows={3} placeholder="例：&#10;- 懷孕 4 個月以上媽咪" className="bg-white border-gray-300 focus-visible:ring-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Sales Tips & DNA */}
          <Card className="shadow-sm border-rose-200 overflow-hidden">
            <CardHeader className="bg-rose-50 border-b border-rose-100 py-4">
              <CardTitle className="text-base text-rose-900 flex items-center gap-2">
                 <span className="w-6 h-6 rounded bg-rose-200 text-rose-800 flex items-center justify-center text-xs font-bold">3</span> 
                 對外銷售與內部叮嚀
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid gap-6 bg-rose-50/10">
                  <div className="grid gap-2">
                     <label className="text-sm font-bold text-gray-700">銷售 Tips</label>
                     <p className="text-xs text-gray-400 mb-1">最容易說服客人的三大情境與話術</p>
                     <Textarea name="salesTips" placeholder="1. 怕悶熱的產婦：主推透氣孔洞設計...&#10;2. 順產產婦：主打產後1週即可當束腹..." className="h-32 border-gray-300 focus-visible:ring-rose-500 text-sm resize-none" />
                  </div>
               <div className="h-px bg-gray-100 my-2"></div>
              <div className="grid gap-3">
                <Label htmlFor="bossNotes" className="text-green-800 font-bold">內部叮嚀 / 老闆筆記 (Boss Notes)</Label>
                <p className="text-xs text-gray-500">此款商品的內部核心精神、延伸規格特點與銷售話術避雷點等。</p>
                <Textarea id="bossNotes" name="bossNotes" rows={3} className="bg-white border-green-200 focus-visible:ring-green-500" />
              </div>
            </CardContent>
          </Card>

          {/* Section 4 & 5 placeholders for future wiring */}
          <div className="grid md:grid-cols-2 gap-6">
             <Card className="shadow-sm border-dashed border-gray-300 bg-gray-50 text-center p-8 flex flex-col justify-center items-center h-48">
                <span className="text-3xl mb-3 opacity-50">💬</span>
                <span className="font-bold text-gray-700">過往回覆管理</span>
                <span className="text-xs text-gray-500 mt-1">獨立管理介面，於儲存基本資料後開放</span>
             </Card>
             <Card className="shadow-sm border-dashed border-gray-300 bg-gray-50 text-center p-8 flex flex-col justify-center items-center h-48">
                <span className="text-3xl mb-3 opacity-50">🖼️</span>
                <span className="font-bold text-gray-700">媒體素材庫配置</span>
                <span className="text-xs text-gray-500 mt-1">上傳圖片/影片，於建立儲存桶後開放拖曳上傳</span>
             </Card>
          </div>

        </form>
      </div>
    </div>
  )
}
