"use client"

import { useRef, useState, useTransition } from "react"
import { addAsset, deleteAsset, updateAsset, uploadFile } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ASSET_TYPE_OPTIONS,
  getAssetTypeLabel,
  isImageAssetType,
  normalizeAssetType,
} from "@/lib/product-contracts"
import { Input } from "@/components/ui/input"

type AssetItem = {
  id: string
  type: string
  title: string
  url: string
  note?: string | null
}

type AssetTabEditorProps = {
  productId: string
  initialAssets: AssetItem[]
}

export function AssetTabEditor({ productId, initialAssets }: AssetTabEditorProps) {
  const [assets, setAssets] = useState<AssetItem[]>(initialAssets)
  const [isEditMode, setIsEditMode] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [newAsset, setNewAsset] = useState({
    title: "",
    type: "product_detail_img",
    url: "",
    note: "",
  })

  const visibleAssets = assets

  const resetAddForm = () => {
    setNewAsset({ title: "", type: "product_detail_img", url: "", note: "" })
    setShowAddForm(false)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const url = await uploadFile(formData)
      if (url) {
        setNewAsset((prev) => ({
          ...prev,
          url,
          title: prev.title || file.name,
        }))
      }
    } catch (error) {
      console.error(error)
      alert("上傳失敗，請稍後再試")
    } finally {
      setIsUploading(false)
    }
  }

  const handleAdd = () => {
    if (!newAsset.title.trim() || !newAsset.url.trim()) {
      alert("請先填寫素材名稱與網址")
      return
    }

    startTransition(async () => {
      try {
        const created = await addAsset(productId, {
          title: newAsset.title.trim(),
          type: newAsset.type,
          url: newAsset.url.trim(),
          note: newAsset.note.trim(),
        })
        setAssets((prev) => [
          {
            ...created,
            type: normalizeAssetType(created.type),
          },
          ...prev,
        ])
        resetAddForm()
      } catch (error) {
        console.error(error)
        alert("新增素材失敗")
      }
    })
  }

  const handleEdit = (asset: AssetItem) => {
    const title = prompt("素材名稱", asset.title) || asset.title
    const url = prompt("素材網址", asset.url) || asset.url
    const typeInput =
      prompt(
        "素材類型（product_img=主視覺 / product_detail_img=商品圖片 / testimonial_url / video_link / official_url）",
        asset.type
      ) || asset.type
    const noteInput = prompt("素材備註（可留空）", asset.note || "")
    const type = normalizeAssetType(typeInput)
    const note = noteInput === null ? asset.note || "" : noteInput

    startTransition(async () => {
      try {
        const updated = await updateAsset(asset.id, { title, url, type, note })
        setAssets((prev) =>
          prev.map((item) =>
            item.id === asset.id
              ? {
                  ...item,
                  title: updated.title,
                  url: updated.url,
                  type: normalizeAssetType(updated.type),
                  note: updated.note,
                }
              : item
          )
        )
      } catch (error) {
        console.error(error)
        alert("更新素材失敗")
      }
    })
  }

  const handleDelete = (assetId: string) => {
    if (!confirm("確定刪除此素材？")) return

    startTransition(async () => {
      try {
        await deleteAsset(assetId)
        setAssets((prev) => prev.filter((item) => item.id !== assetId))
      } catch (error) {
        console.error(error)
        alert("刪除素材失敗")
      }
    })
  }

  return (
    <div className="space-y-4 focus-visible:outline-none focus-visible:ring-0">
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm flex items-center justify-end gap-2">
        {!isEditMode ? (
          <Button type="button" variant="outline" size="sm" onClick={() => setIsEditMode(true)}>
            編輯素材
          </Button>
        ) : (
          <>
            <Button type="button" variant="ghost" size="sm" onClick={() => { setIsEditMode(false); setShowAddForm(false); }}>
              完成
            </Button>
            <Button type="button" size="sm" onClick={() => setShowAddForm((prev) => !prev)} className="bg-gray-900 hover:bg-gray-800 text-white">
              {showAddForm ? "取消新增" : "+ 新增素材"}
            </Button>
          </>
        )}
      </div>

      {isEditMode && showAddForm && (
        <div className="bg-white p-4 border border-rose-200 rounded-lg shadow-sm grid gap-3">
          <div className="grid md:grid-cols-2 gap-3">
            <Input
              placeholder="素材名稱"
              value={newAsset.title}
              onChange={(e) => setNewAsset((prev) => ({ ...prev, title: e.target.value }))}
            />
            <select
              value={newAsset.type}
              onChange={(e) => setNewAsset((prev) => ({ ...prev, type: e.target.value }))}
              className="h-8 rounded-lg border border-gray-300 px-2 text-sm bg-white"
            >
              {ASSET_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} ({option.value})
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="素材網址 https://..."
              value={newAsset.url}
              onChange={(e) => setNewAsset((prev) => ({ ...prev, url: e.target.value }))}
            />
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
              {isUploading ? "上傳中..." : "上傳"}
            </Button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
          </div>
          <Input
            placeholder="素材備註（選填）"
            value={newAsset.note}
            onChange={(e) => setNewAsset((prev) => ({ ...prev, note: e.target.value }))}
          />
          <div className="flex justify-end">
            <Button type="button" onClick={handleAdd} disabled={isPending} className="bg-rose-600 hover:bg-rose-700 text-white">
              確認新增
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleAssets.map((asset) => (
          <Card key={asset.id} className="shadow-sm border-gray-200 overflow-hidden flex flex-col bg-white">
            {isImageAssetType(asset.type) ? (
              <div className="bg-white p-4 h-48 w-full border-b border-gray-100 relative group cursor-pointer flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset.url} alt={asset.title} className="max-w-full max-h-full object-contain" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 flex items-center justify-center transition-all">
                  <span className="opacity-0 group-hover:opacity-100 bg-white/95 text-gray-900 text-xs font-bold px-3 py-1.5 rounded shadow-sm border border-gray-200">
                    放大檢視
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 flex-1 aspect-video flex flex-col items-center justify-center text-center border-b border-gray-200 px-4 group">
                <a href={asset.url} target="_blank" rel="noreferrer">
                  <Button variant="secondary" size="sm" className="shadow-sm bg-white border border-gray-200 group-hover:bg-gray-50">
                    ▶️ 開啟 {asset.type}
                  </Button>
                </a>
              </div>
            )}

            <CardContent className="p-3 bg-white flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1 py-0">
                  {getAssetTypeLabel(asset.type)}
                </Badge>
                <h3 className="font-bold text-gray-900 text-sm truncate">{asset.title}</h3>
              </div>
              {asset.note && <p className="text-[11px] text-gray-500 font-medium truncate">{asset.note}</p>}
              <div className="mt-2 pt-2 border-t border-gray-50 flex gap-1">
                <Button variant="ghost" size="sm" className="h-6 text-[10px] flex-1 text-gray-600 border border-gray-100 font-bold bg-gray-50">
                  下載 / 儲存
                </Button>
                <Button variant="ghost" size="sm" className="h-6 text-[10px] flex-1 text-gray-600 border border-gray-100 font-bold bg-gray-50">
                  複製網址
                </Button>
              </div>
              {isEditMode && (
                <div className="mt-2 pt-2 border-t border-gray-100 flex justify-end gap-2">
                  <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-gray-500 hover:text-blue-600" onClick={() => handleEdit(asset)}>
                    ✏️
                  </Button>
                  <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-gray-500 hover:text-rose-600" onClick={() => handleDelete(asset.id)}>
                    🗑️
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
