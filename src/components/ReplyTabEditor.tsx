"use client"

import { useMemo, useState, useTransition } from "react"
import { addReply, deleteReply, updateReply } from "@/app/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type ReplyItem = {
  id: string
  scenario: string
  content: string
  note?: string | null
  isFAQ: boolean
  isPremium: boolean
  createdAt?: string | Date
  updatedAt?: string | Date
}

type ReplyTabEditorProps = {
  productId: string
  mode: "faq" | "replies"
  initialReplies: ReplyItem[]
}

type ReplyDraft = {
  scenario: string
  content: string
  note: string
  isFAQ: boolean
  isPremium: boolean
}

function sortReplies(items: ReplyItem[]): ReplyItem[] {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime()
    const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime()
    return bTime - aTime
  })
}

export function ReplyTabEditor({ productId, mode, initialReplies }: ReplyTabEditorProps) {
  const [replies, setReplies] = useState<ReplyItem[]>(() => sortReplies(initialReplies))
  const [query, setQuery] = useState("")
  const [onlyPremium, setOnlyPremium] = useState(mode === "replies")
  const [isEditMode, setIsEditMode] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [draft, setDraft] = useState<ReplyDraft>({
    scenario: "",
    content: "",
    note: "",
    isFAQ: mode === "faq",
    isPremium: false,
  })

  const title = mode === "faq" ? "FAQ" : "過往回覆"
  const searchPlaceholder = mode === "faq" ? "搜尋常見問題..." : "搜尋回覆紀錄..."

  const filteredReplies = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    const source = replies.filter((item) => (mode === "faq" ? item.isFAQ : !item.isFAQ))

    return source.filter((item) => {
      if (mode === "replies" && onlyPremium && !item.isPremium) return false
      if (!keyword) return true
      return [item.scenario, item.content, item.note ?? ""].join(" ").toLowerCase().includes(keyword)
    })
  }, [mode, onlyPremium, query, replies])

  const resetDraft = () =>
    setDraft({
      scenario: "",
      content: "",
      note: "",
      isFAQ: mode === "faq",
      isPremium: false,
    })

  const openEdit = (reply: ReplyItem) => {
    setEditingId(reply.id)
    setDraft({
      scenario: reply.scenario,
      content: reply.content,
      note: reply.note || "",
      isFAQ: reply.isFAQ,
      isPremium: reply.isPremium,
    })
  }

  const handleCreate = () => {
    if (!draft.scenario.trim() || !draft.content.trim()) {
      alert("請先填寫情境與回覆內容")
      return
    }

    startTransition(async () => {
      try {
        const created = await addReply(productId, draft)
        setReplies((prev) => sortReplies([created as ReplyItem, ...prev]))
        setIsAdding(false)
        resetDraft()
      } catch (error) {
        console.error(error)
        alert("新增失敗，請稍後再試")
      }
    })
  }

  const handleSave = () => {
    if (!editingId) return
    if (!draft.scenario.trim() || !draft.content.trim()) {
      alert("請先填寫情境與回覆內容")
      return
    }

    startTransition(async () => {
      try {
        const updated = await updateReply(editingId, draft)
        setReplies((prev) => sortReplies(prev.map((item) => (item.id === editingId ? (updated as ReplyItem) : item))))
        setEditingId(null)
        resetDraft()
      } catch (error) {
        console.error(error)
        alert("更新失敗，請稍後再試")
      }
    })
  }

  const handleDelete = (replyId: string) => {
    if (!confirm("確定刪除此回覆？")) return

    startTransition(async () => {
      try {
        await deleteReply(replyId)
        setReplies((prev) => prev.filter((item) => item.id !== replyId))
      } catch (error) {
        console.error(error)
        alert("刪除失敗，請稍後再試")
      }
    })
  }

  return (
    <div className="mt-6">
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm mb-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <Input
            type="search"
            placeholder={searchPlaceholder}
            className="pl-9 bg-gray-50 max-w-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {mode === "replies" && (
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 accent-rose-600 rounded"
              checked={onlyPremium}
              onChange={(e) => setOnlyPremium(e.target.checked)}
            />
            <span>僅顯示優質回覆</span>
          </label>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setIsEditMode((prev) => !prev)
            setIsAdding(false)
            setEditingId(null)
            resetDraft()
          }}
        >
          {isEditMode ? "完成編輯" : `編輯${title}`}
        </Button>
      </div>

      {isEditMode && (
        <div className="bg-white p-4 border border-rose-200 rounded-lg shadow-sm mb-4">
          {!isAdding ? (
            <Button type="button" onClick={() => setIsAdding(true)} className="bg-rose-600 hover:bg-rose-700 text-white">
              + 新增{title}
            </Button>
          ) : (
            <div className="grid gap-3">
              <Input
                placeholder="對應情境（Q）"
                value={draft.scenario}
                onChange={(e) => setDraft((prev) => ({ ...prev, scenario: e.target.value }))}
              />
              <Textarea
                placeholder="回覆內容（A）"
                className="min-h-24"
                value={draft.content}
                onChange={(e) => setDraft((prev) => ({ ...prev, content: e.target.value }))}
              />
              <Input
                placeholder="內部備註（選填）"
                value={draft.note}
                onChange={(e) => setDraft((prev) => ({ ...prev, note: e.target.value }))}
              />
              <div className="flex flex-wrap gap-4">
                <label className="text-sm text-gray-700 flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.isFAQ}
                    onChange={(e) => setDraft((prev) => ({ ...prev, isFAQ: e.target.checked }))}
                  />
                  FAQ
                </label>
                <label className="text-sm text-gray-700 flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.isPremium}
                    onChange={(e) => setDraft((prev) => ({ ...prev, isPremium: e.target.checked }))}
                  />
                  優質回覆
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => { setIsAdding(false); resetDraft(); }}>
                  取消
                </Button>
                <Button type="button" onClick={handleCreate} disabled={isPending} className="bg-rose-600 hover:bg-rose-700 text-white">
                  新增
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4">
        {filteredReplies.length > 0 ? (
          filteredReplies.map((reply) => {
            const isEditingThis = editingId === reply.id

            return (
              <div key={reply.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                {!isEditingThis ? (
                  <>
                    <div className="p-4 pb-2 border-b border-gray-50 bg-rose-50/20 flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="bg-rose-100 text-rose-700 border-rose-200">Q: {reply.scenario}</Badge>
                        {reply.isPremium && <Badge className="bg-amber-100 text-amber-800 border-none">優質回覆</Badge>}
                        {reply.isFAQ && <Badge variant="secondary">FAQ</Badge>}
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">ID: {reply.id.slice(0, 8)}</span>
                    </div>
                    <div className="p-4">
                      <div className="text-gray-900 whitespace-pre-wrap leading-relaxed font-medium">A: {reply.content}</div>
                      {reply.note && (
                        <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-500 italic border-l-2 border-gray-200">
                          💡 叮嚀：{reply.note}
                        </div>
                      )}
                      {isEditMode && (
                        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end gap-2">
                          <Button type="button" variant="ghost" size="sm" onClick={() => openEdit(reply)} className="text-gray-500 hover:text-blue-600">
                            ✏️ 編輯
                          </Button>
                          <Button type="button" variant="ghost" size="sm" onClick={() => handleDelete(reply.id)} className="text-gray-500 hover:text-rose-600">
                            🗑️ 刪除
                          </Button>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="p-4 space-y-3">
                    <Input value={draft.scenario} onChange={(e) => setDraft((prev) => ({ ...prev, scenario: e.target.value }))} />
                    <Textarea className="min-h-24" value={draft.content} onChange={(e) => setDraft((prev) => ({ ...prev, content: e.target.value }))} />
                    <Input value={draft.note} onChange={(e) => setDraft((prev) => ({ ...prev, note: e.target.value }))} placeholder="內部備註（選填）" />
                    <div className="flex flex-wrap gap-4">
                      <label className="text-sm text-gray-700 flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={draft.isFAQ} onChange={(e) => setDraft((prev) => ({ ...prev, isFAQ: e.target.checked }))} />
                        FAQ
                      </label>
                      <label className="text-sm text-gray-700 flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={draft.isPremium} onChange={(e) => setDraft((prev) => ({ ...prev, isPremium: e.target.checked }))} />
                        優質回覆
                      </label>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="ghost" onClick={() => { setEditingId(null); resetDraft(); }}>
                        取消
                      </Button>
                      <Button type="button" onClick={handleSave} disabled={isPending} className="bg-gray-900 hover:bg-gray-800 text-white">
                        儲存
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300 text-gray-400">
            目前尚無{title}
          </div>
        )}
      </div>
    </div>
  )
}
