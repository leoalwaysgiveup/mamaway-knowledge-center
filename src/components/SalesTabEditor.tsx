"use client"

import { useState, useTransition } from "react"
import { updateProductSalesContent } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

type SalesTabEditorProps = {
  productId: string
  initialSalesTips: string
  initialBossNotes?: string | null
}

export function SalesTabEditor({ productId, initialSalesTips, initialBossNotes }: SalesTabEditorProps) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [salesTips, setSalesTips] = useState(initialSalesTips || "")
  const [bossNotes, setBossNotes] = useState(initialBossNotes || "")
  const [isPending, startTransition] = useTransition()

  const cancelEdit = () => {
    setSalesTips(initialSalesTips || "")
    setBossNotes(initialBossNotes || "")
    setIsEditMode(false)
  }

  const saveEdit = () => {
    startTransition(async () => {
      try {
        const result = await updateProductSalesContent(productId, { salesTips, bossNotes })
        setSalesTips(result.salesTips || "")
        setBossNotes(result.bossNotes || "")
        setIsEditMode(false)
      } catch (error) {
        console.error(error)
        alert("儲存失敗，請稍後再試")
      }
    })
  }

  return (
    <div className="space-y-4 focus-visible:outline-none focus-visible:ring-0">
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm flex items-center justify-end gap-2">
        {!isEditMode ? (
          <Button type="button" variant="outline" size="sm" onClick={() => setIsEditMode(true)}>
            編輯銷售內容
          </Button>
        ) : (
          <>
            <Button type="button" variant="ghost" size="sm" onClick={cancelEdit}>
              取消
            </Button>
            <Button type="button" size="sm" disabled={isPending} onClick={saveEdit} className="bg-gray-900 hover:bg-gray-800 text-white">
              儲存
            </Button>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Card className="shadow-sm border-orange-200 bg-[#FFF9F2]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-orange-900 flex items-center gap-2">💡 一線銷售指引 (Sales Tips)</CardTitle>
          </CardHeader>
          <CardContent>
            {!isEditMode ? (
              <p className="whitespace-pre-line text-gray-800 leading-relaxed font-bold block">{salesTips}</p>
            ) : (
              <Textarea
                className="min-h-36 bg-white border-orange-200"
                value={salesTips}
                onChange={(e) => setSalesTips(e.target.value)}
              />
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-green-200 bg-[#F2FCF5]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-green-900 flex items-center gap-2">♻️ 內部叮嚀 / 老闆筆記</CardTitle>
          </CardHeader>
          <CardContent>
            {!isEditMode ? (
              <p className="whitespace-pre-line text-gray-800 leading-relaxed font-bold block">{bossNotes || "尚未填寫"}</p>
            ) : (
              <Textarea
                className="min-h-28 bg-white border-green-200"
                value={bossNotes}
                onChange={(e) => setBossNotes(e.target.value)}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
