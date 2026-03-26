"use client"

import { useState } from "react"
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { analyzeText, saveInquiryCase } from "../actions"

export default function Workspace() {
  const [inputText, setInputText] = useState("")
  const [isAnalyzed, setIsAnalyzed] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [targetProduct, setTargetProduct] = useState<any>(null)
  
  const [draftText, setDraftText] = useState("媽咪您好呀👋 寶寶長紅屁屁一定很不舒服，辛苦媽咪了！\n\n我們的產品完全使用天然成分，針對嬌嫩敏感的嬰兒肌膚設計，不會有刺痛問題哦！")

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    const product = await analyzeText(inputText);
    setTargetProduct(product);
    setIsAnalyzed(true);
    setIsAnalyzing(false);
  }

  const handleReset = () => {
    setIsAnalyzed(false);
    setInputText("");
    setTargetProduct(null);
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("已複製到剪貼簿！");
  }

  const handleAppendReply = (content: string) => {
    setDraftText((prev) => prev + "\n\n" + content);
  }

  const handleRewrite = () => {
    setDraftText((prev) => "【AI 語氣轉換中...】\n" + prev);
  }

  const handleSaveDraft = async () => {
    if (!targetProduct) return;
    await saveInquiryCase({
      queryContent: inputText,
      suggestedProductId: targetProduct.id,
      finalReply: draftText
    });
    alert("已成功儲存為情境案例！");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-rose-600 rounded flex items-center justify-center text-white font-bold">M</div>
            <h1 className="text-lg font-bold tracking-tight text-gray-900">商品回覆與素材查詢中心</h1>
            <div className="h-4 w-px bg-gray-300 mx-2"></div>
            <div className="flex gap-2">
               <Link href="/">
                  <Button variant="ghost" size="sm" className="text-gray-500 font-medium hover:text-gray-900">📁 商品總覽</Button>
               </Link>
               <Button variant="secondary" size="sm" className="bg-rose-50 text-rose-700 font-bold border border-rose-100">⚡ 情境工作台</Button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/manage">
               <Button variant="outline" className="text-sm font-medium hidden md:flex">➕ 新增商品</Button>
            </Link>
            <div className="w-8 h-8 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 text-xs font-bold">A</div>
          </div>
        </div>
      </header>

      {/* Workspace Area */}
      <main className="flex-1 overflow-x-hidden p-4 md:p-8">
         <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 items-start">
            
            {/* Left Column: Input & Initial Analysis */}
            <div className="w-full lg:w-[400px] xl:w-[480px] shrink-0 space-y-6 lg:sticky lg:top-24">
               
               {/* Panel 1: Input Area */}
               <Card className="shadow-sm border-gray-200 bg-white">
                  <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-3">
                     <CardTitle className="text-base text-gray-900 flex items-center justify-between">
                        <span>📥 貼入客訴或情境描述</span>
                        {isAnalyzed && <Button variant="ghost" size="sm" onClick={handleReset} className="h-6 text-xs text-gray-500">重新輸入</Button>}
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                     {!isAnalyzed ? (
                        <div className="space-y-4">
                           <Textarea 
                              value={inputText}
                              onChange={(e) => setInputText(e.target.value)}
                              placeholder="請貼上社群留言內容、客服對話截圖文字，例如：「請問寶寶最近紅屁屁，可以用你們的抗菌噴霧噴嗎？會不會太刺激？」" 
                              className="h-40 resize-none bg-gray-50 focus:bg-white text-sm" 
                           />
                           <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50 text-gray-400 text-sm hover:bg-gray-100 cursor-pointer transition-colors">
                              或點擊上傳截圖 / 圖片圖片提取文字
                           </div>
                           <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold h-10 shadow-sm">
                              {isAnalyzing ? "🔄 AI 分析中..." : "⚡ 啟動 AI 智能分析"}
                           </Button>
                        </div>
                     ) : (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                           <p className="text-sm text-gray-700 italic border-l-2 border-gray-300 pl-3">&quot;{inputText}&quot;</p>
                        </div>
                     )}
                  </CardContent>
               </Card>

               {/* Panel 2: Analysis Results (Only visible after analysis) */}
               {isAnalyzed && targetProduct && (
                  <Card className="shadow-sm border-indigo-200 bg-white overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <CardHeader className="bg-indigo-50/50 border-b border-indigo-100 pb-3">
                        <CardTitle className="text-base text-indigo-900 flex items-center gap-2">
                           <span className="w-5 h-5 flex items-center justify-center bg-indigo-600 text-white rounded text-xs">AI</span>
                           痛點拆解與商品推薦
                        </CardTitle>
                     </CardHeader>
                     <CardContent className="p-5 space-y-5">
                        <div className="space-y-2">
                           <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">診斷出的顧客痛點</div>
                           <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="bg-white border-red-200 text-red-700 font-bold">寶寶皮膚嬌嫩怕刺激</Badge>
                              <Badge variant="outline" className="bg-white border-red-200 text-red-700 font-bold">擔心有化學殘留</Badge>
                           </div>
                        </div>

                        <div className="space-y-2 border-t border-gray-100 pt-4">
                           <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">已匹配到最適合的解決方案：</div>
                           <Link href={`/product/${targetProduct.id}`}>
                              <Card className="border border-indigo-200 bg-[#FAFAFF] hover:border-indigo-400 transition-colors shadow-sm cursor-pointer group">
                                 <CardContent className="p-3 flex items-center justify-between">
                                    <div>
                                       <h4 className="font-bold text-indigo-900 group-hover:text-indigo-700">{targetProduct.name}</h4>
                                    </div>
                                    <span className="text-indigo-400 group-hover:text-indigo-600">&rarr;</span>
                                 </CardContent>
                              </Card>
                           </Link>
                        </div>
                     </CardContent>
                  </Card>
               )}
            </div>

            {/* Right Column: Knowledge Retrieval & Output (Only visible after analysis) */}
            {isAnalyzed && targetProduct && (
               <div className="flex-1 flex flex-col gap-6 animate-in slide-in-from-right-8 fade-in duration-500 delay-150 fill-mode-both min-w-0">
                  
                  {/* Row: Context Retrieval (Replies & Assets) */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                     {/* Panel 3: Past Similar Replies */}
                     <Card className="shadow-sm border-gray-200 bg-white flex flex-col">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-3">
                           <CardTitle className="text-base text-gray-900 flex items-center justify-between">
                              <span>💬 相似情境歷史回覆</span>
                              <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-none font-bold shadow-none text-xs">找到 {targetProduct.replies.length} 筆</Badge>
                           </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 bg-gray-50/30 overflow-y-auto max-h-[300px]">
                           <div className="p-4 space-y-4">
                              {targetProduct.replies?.map((reply: any) => (
                                 <div key={reply.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm relative pr-12 group hover:border-rose-300">
                                    {reply.isPremium && <Badge variant="secondary" className="absolute top-2 right-2 bg-amber-50 text-amber-600 border border-amber-200 text-[10px] px-1.5 py-0 shadow-none">神回覆</Badge>}
                                    <p className="text-sm font-bold text-gray-400 mb-1">{reply.scenario}</p>
                                    <p className="text-sm text-gray-800 leading-relaxed font-medium mb-3">{reply.content}</p>
                                    <Button onClick={() => handleAppendReply(reply.content)} variant="outline" size="sm" className="w-full text-xs font-bold text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100 h-7">採用此回覆架構</Button>
                                 </div>
                              ))}
                           </div>
                        </CardContent>
                     </Card>

                     {/* Panel 4: Assets */}
                     <Card className="shadow-sm border-gray-200 bg-white flex flex-col">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-3">
                           <CardTitle className="text-base text-gray-900">🖼️ 可搭配素材</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 bg-gray-50/30 overflow-y-auto max-h-[300px]">
                           <div className="p-4 grid grid-cols-2 gap-3">
                              {targetProduct.assets?.map((asset: any) => (
                                 <div key={asset.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden group">
                                    {asset.type === '圖片' ? (
                                       <div className="bg-gray-100 aspect-video relative">
                                          {/* eslint-disable-next-line @next/next/no-img-element */}
                                          <img src={asset.url} alt={asset.title} className="w-full h-full object-cover" />
                                       </div>
                                    ) : (
                                       <div className="bg-gray-50 aspect-video flex flex-col items-center justify-center text-center">
                                          <span className="text-gray-400 text-sm">▶️ 影片檔案</span>
                                       </div>
                                    )}
                                    <div className="p-2">
                                       <h4 className="text-xs font-bold text-gray-900 truncate mb-2">{asset.title}</h4>
                                       <Button onClick={() => handleAppendReply(`[已提供素材: ${asset.title}]`)} variant="outline" size="sm" className="w-full text-[10px] h-6">✅ 附加到回覆</Button>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </CardContent>
                     </Card>
                  </div>

                  {/* Panel 5: AI Generating Draft */}
                  <Card className="shadow-sm border-purple-200 bg-white w-full">
                     <CardHeader className="bg-[#F8F5FF] border-b border-purple-100 pb-4 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                           <span className="w-6 h-6 flex items-center justify-center bg-purple-600 text-white rounded text-xs font-bold shadow-sm">AI</span>
                           <CardTitle className="text-lg text-purple-900 font-bold tracking-tight">自動生成回覆草稿</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                           <Button onClick={handleRewrite} variant="outline" size="sm" className="bg-white text-purple-700 border-purple-200 hover:bg-purple-50">🔄 換個語氣重寫</Button>
                           <Button onClick={() => handleCopy(draftText)} size="sm" className="bg-gray-900 text-white hover:bg-gray-800 shadow-sm">📋 複製文字</Button>
                        </div>
                     </CardHeader>
                     <CardContent className="p-6">
                        <Textarea 
                           className="bg-gray-50 rounded-xl p-5 border border-gray-200 whitespace-pre-wrap text-gray-800 leading-relaxed font-medium h-64 resize-none"
                           value={draftText}
                           onChange={(e) => setDraftText(e.target.value)}
                        />

                        <div className="mt-6 flex justify-end">
                           <Button onClick={handleSaveDraft} className="font-bold shadow-sm bg-purple-600 hover:bg-purple-700 text-white">💾 將此草稿儲存為「情境案例」</Button>
                        </div>
                     </CardContent>
                  </Card>
               </div>
            )}
            
            {/* Empty state instruction when not analyzed */}
            {!isAnalyzed && (
               <div className="hidden lg:flex flex-1 items-center justify-center py-32 opacity-50">
                  <div className="text-center">
                     <div className="text-6xl mb-4">⚡</div>
                     <h3 className="text-lg font-bold text-gray-400">在左側貼上客訴或情境描述</h3>
                     <p className="text-sm text-gray-400 mt-2">AI 將為您推薦符合品牌 DNA 的產品與回覆素材</p>
                  </div>
               </div>
            )}

         </div>
      </main>
    </div>
  )
}
