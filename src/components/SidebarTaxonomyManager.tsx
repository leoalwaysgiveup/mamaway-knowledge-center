"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import {
  addCategoryOption,
  addProblemShortcutOption,
  batchRenameCategory,
  batchRenameProblemShortcut,
  deleteCategoryOption,
  deleteProblemShortcutOption,
} from "@/app/actions"
import { normalizeSearchInput } from "@/lib/product-matching"
import { Input } from "@/components/ui/input"

type CategoryItem = {
  label: string
  count: number
  canDelete?: boolean
}

type ProblemShortcutItem = {
  label: string
  query: string
  count: number
  canDelete?: boolean
}

type SidebarTaxonomyManagerProps = {
  textQuery: string
  activeCategory: string
  activeProblem: string
  totalProducts: number
  productsWithProblemCount: number
  categoryItems: CategoryItem[]
  problemShortcutItems: ProblemShortcutItem[]
}

export function SidebarTaxonomyManager({
  textQuery,
  activeCategory,
  activeProblem,
  totalProducts,
  productsWithProblemCount,
  categoryItems,
  problemShortcutItems,
}: SidebarTaxonomyManagerProps) {
  const router = useRouter()
  const [manageMode, setManageMode] = useState(false)
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [isAddingProblem, setIsAddingProblem] = useState(false)
  const [newProblemName, setNewProblemName] = useState("")
  const [editingCategoryName, setEditingCategoryName] = useState<string | null>(null)
  const [editingCategoryDraft, setEditingCategoryDraft] = useState("")
  const [editingProblemName, setEditingProblemName] = useState<string | null>(null)
  const [editingProblemDraft, setEditingProblemDraft] = useState("")
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [isPending, startTransition] = useTransition()
  const normalizedActiveCategory = normalizeSearchInput(activeCategory)
  const normalizedActiveProblem = normalizeSearchInput(activeProblem)

  const buildHref = (nextCategory?: string, nextProblem?: string, keepTextQuery: boolean = true) => {
    const params = new URLSearchParams()
    const trimmedQ = textQuery.trim()
    if (keepTextQuery && trimmedQ) params.set("q", trimmedQ)
    if (nextCategory) params.set("category", nextCategory)
    if (nextProblem) params.set("problem", nextProblem)
    const queryString = params.toString()
    return queryString ? `/?${queryString}` : "/"
  }

  const isActiveCategory = (value: string) =>
    normalizedActiveCategory !== "" && normalizedActiveCategory === normalizeSearchInput(value)

  const isActiveProblem = (value: string) =>
    normalizedActiveProblem !== "" && normalizedActiveProblem === normalizeSearchInput(value)

  const startEditCategory = (name: string) => {
    setEditingCategoryName(name)
    setEditingCategoryDraft(name)
    setNotice(null)
  }

  const cancelEditCategory = () => {
    setEditingCategoryName(null)
    setEditingCategoryDraft("")
  }

  const handleRenameCategory = (oldName: string, nextNameRaw: string) => {
    const nextName = nextNameRaw.trim()
    if (!nextName || nextName === oldName) {
      cancelEditCategory()
      return
    }

    startTransition(async () => {
      try {
        const result = await batchRenameCategory(oldName, nextName)
        setNotice({ type: "success", message: `已更新 ${result.updatedProducts} 筆商品類別` })
        cancelEditCategory()
        router.refresh()
      } catch (error) {
        const message = error instanceof Error ? error.message : "批次改名失敗，請稍後再試"
        setNotice({ type: "error", message })
      }
    })
  }

  const handleAddCategory = () => {
    const nextName = newCategoryName.trim()
    if (!nextName) return

    startTransition(async () => {
      try {
        await addCategoryOption(nextName)
        setNewCategoryName("")
        setIsAddingCategory(false)
        setNotice({ type: "success", message: `已新增類別：${nextName}（0 筆），請到商品編輯頁指定商品類別` })
        router.refresh()
      } catch (error) {
        const message = error instanceof Error ? error.message : "新增類別失敗，請稍後再試"
        setNotice({ type: "error", message })
      }
    })
  }

  const handleAddProblem = () => {
    const nextName = newProblemName.trim()
    if (!nextName) return

    startTransition(async () => {
      try {
        await addProblemShortcutOption(nextName)
        setNewProblemName("")
        setIsAddingProblem(false)
        setNotice({ type: "success", message: `已新增問題捷徑：${nextName}（0 筆）` })
        router.refresh()
      } catch (error) {
        const message = error instanceof Error ? error.message : "新增問題捷徑失敗，請稍後再試"
        setNotice({ type: "error", message })
      }
    })
  }

  const startEditProblem = (name: string) => {
    setEditingProblemName(name)
    setEditingProblemDraft(name)
    setNotice(null)
  }

  const cancelEditProblem = () => {
    setEditingProblemName(null)
    setEditingProblemDraft("")
  }

  const handleRenameProblem = (oldName: string, nextNameRaw: string) => {
    const nextName = nextNameRaw.trim()
    if (!nextName || nextName === oldName) {
      cancelEditProblem()
      return
    }

    startTransition(async () => {
      try {
        const result = await batchRenameProblemShortcut(oldName, nextName)
        setNotice({
          type: "success",
          message: `已更新 ${result.updatedProducts} 筆商品、共 ${result.replacedEntries} 個捷徑`,
        })
        cancelEditProblem()
        router.refresh()
      } catch (error) {
        const message = error instanceof Error ? error.message : "批次改名失敗，請稍後再試"
        setNotice({ type: "error", message })
      }
    })
  }

  const handleDeleteCategory = (name: string, count: number) => {
    const shouldDelete = window.confirm(
      count > 0
        ? `確定刪除「${name}」？會同步清空 ${count} 筆商品的類別。`
        : `確定刪除「${name}」？`
    )
    if (!shouldDelete) return

    startTransition(async () => {
      try {
        const result = await deleteCategoryOption(name)
        setNotice({
          type: "success",
          message:
            result.clearedProducts > 0
              ? `已刪除「${result.name}」，並清空 ${result.clearedProducts} 筆商品類別`
              : `已刪除「${result.name}」`,
        })
        if (activeCategory && normalizeSearchInput(activeCategory) === normalizeSearchInput(name)) {
          router.push(buildHref(undefined, activeProblem || undefined, false))
          return
        }
        router.refresh()
      } catch (error) {
        const message = error instanceof Error ? error.message : "刪除類別失敗，請稍後再試"
        setNotice({ type: "error", message })
      }
    })
  }

  const handleDeleteProblem = (name: string, count: number) => {
    const shouldDelete = window.confirm(
      count > 0
        ? `確定刪除「${name}」？會同步從 ${count} 筆商品移除這個問題捷徑。`
        : `確定刪除「${name}」？`
    )
    if (!shouldDelete) return

    startTransition(async () => {
      try {
        const result = await deleteProblemShortcutOption(name)
        setNotice({
          type: "success",
          message:
            result.removedEntries > 0
              ? `已刪除「${result.name}」，共移除 ${result.removedEntries} 個捷徑`
              : `已刪除「${result.name}」`,
        })
        if (activeProblem && normalizeSearchInput(activeProblem) === normalizeSearchInput(name)) {
          router.push(buildHref(activeCategory || undefined, undefined, false))
          return
        }
        router.refresh()
      } catch (error) {
        const message = error instanceof Error ? error.message : "刪除問題捷徑失敗，請稍後再試"
        setNotice({ type: "error", message })
      }
    })
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col p-6 overflow-y-auto">
      <div className="mb-2 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            setIsAddingCategory((prev) => !prev)
            if (isAddingCategory) setNewCategoryName("")
          }}
          disabled={isPending}
          className="text-[11px] font-semibold text-gray-400 hover:text-gray-600 disabled:opacity-50"
        >
          {isAddingCategory ? "取消新增" : "新增類別"}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsAddingProblem((prev) => !prev)
            if (isAddingProblem) setNewProblemName("")
          }}
          disabled={isPending}
          className="text-[11px] font-semibold text-gray-400 hover:text-gray-600 disabled:opacity-50"
        >
          {isAddingProblem ? "取消新增" : "新增問題"}
        </button>
        <button
          type="button"
          onClick={() => setManageMode((prev) => !prev)}
          className={`text-[11px] font-semibold transition-colors ${manageMode ? "text-amber-700" : "text-gray-400 hover:text-gray-600"}`}
        >
          {manageMode ? "完成編輯" : "編輯分類"}
        </button>
      </div>

      {isAddingCategory && (
        <form
          className="mb-3 flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            handleAddCategory()
          }}
        >
          <Input
            value={newCategoryName}
            onChange={(event) => setNewCategoryName(event.target.value)}
            placeholder="輸入新類別名稱"
            className="h-8 text-xs bg-gray-50 border-gray-200 focus-visible:ring-rose-400"
            disabled={isPending}
          />
          <button
            type="submit"
            disabled={isPending || !newCategoryName.trim()}
            className="h-8 shrink-0 rounded-md border border-rose-200 bg-rose-50 px-2 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
          >
            儲存
          </button>
        </form>
      )}

      {isAddingProblem && (
        <form
          className="mb-3 flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            handleAddProblem()
          }}
        >
          <Input
            value={newProblemName}
            onChange={(event) => setNewProblemName(event.target.value)}
            placeholder="輸入新問題捷徑"
            className="h-8 text-xs bg-gray-50 border-gray-200 focus-visible:ring-rose-400"
            disabled={isPending}
          />
          <button
            type="submit"
            disabled={isPending || !newProblemName.trim()}
            className="h-8 shrink-0 rounded-md border border-rose-200 bg-rose-50 px-2 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
          >
            儲存
          </button>
        </form>
      )}

      {notice && (
        <div
          className={`mb-3 rounded-md border px-2 py-1.5 text-[11px] font-medium ${
            notice.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {notice.message}
        </div>
      )}

      <details className="group border border-gray-200 rounded-lg p-2 bg-gray-50/40" open>
        <summary className="list-none cursor-pointer text-xs font-bold text-gray-500 uppercase tracking-wider px-2 py-1 flex items-center justify-between">
          商品類別
          <span className="text-gray-400 transition-transform group-open:rotate-180">⌄</span>
        </summary>
        <div className="space-y-1 mt-2">
          <Link
            href={buildHref(undefined, activeProblem || undefined, false)}
            className={`w-full flex items-center justify-between text-sm font-bold px-3 py-2.5 rounded-lg transition-colors ${normalizedActiveCategory === "" ? "text-rose-700 bg-rose-50 border border-rose-100" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent"}`}
          >
            全部商品
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full tracking-wide ${normalizedActiveCategory === "" ? "bg-rose-200 text-rose-800" : "bg-gray-100 text-gray-500"}`}>{totalProducts}</span>
          </Link>

          {categoryItems.map((category) => {
            const isEditing = manageMode && editingCategoryName === category.label
            if (isEditing) {
              return (
                <form
                  key={category.label}
                  className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1.5"
                  onSubmit={(event) => {
                    event.preventDefault()
                    handleRenameCategory(category.label, editingCategoryDraft)
                  }}
                >
                  <Input
                    value={editingCategoryDraft}
                    onChange={(event) => setEditingCategoryDraft(event.target.value)}
                    className="h-7 text-xs bg-white border-rose-200"
                    disabled={isPending}
                  />
                  <button
                    type="submit"
                    className="h-7 shrink-0 rounded border border-rose-200 bg-white px-2 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                    disabled={isPending || !editingCategoryDraft.trim()}
                  >
                    存
                  </button>
                  <button
                    type="button"
                    className="h-7 shrink-0 rounded border border-gray-200 bg-white px-2 text-[11px] font-semibold text-gray-500 hover:bg-gray-100"
                    onClick={cancelEditCategory}
                    disabled={isPending}
                  >
                    取消
                  </button>
                </form>
              )
            }

            return (
              <div
                key={category.label}
                className={`w-full flex items-center gap-1 text-sm font-bold px-3 py-2.5 rounded-lg border transition-colors ${isActiveCategory(category.label) ? "text-rose-700 bg-rose-50 border-rose-100" : "text-gray-600 border-transparent hover:bg-gray-50"}`}
              >
                <Link href={buildHref(category.label, activeProblem || undefined, false)} className="flex-1">
                  {category.label}
                </Link>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full tracking-wide ${isActiveCategory(category.label) ? "bg-rose-200 text-rose-800" : "bg-gray-100 text-gray-500"}`}>{category.count}</span>
                {manageMode && (
                  <>
                    <button
                      type="button"
                      onClick={() => startEditCategory(category.label)}
                      disabled={isPending}
                      className="text-xs text-gray-500 hover:text-rose-700 disabled:opacity-50"
                      title={`改名：${category.label}`}
                    >
                      ✏️
                    </button>
                    {category.canDelete !== false && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(category.label, category.count)}
                        disabled={isPending}
                        className="text-xs text-gray-400 hover:text-rose-700 disabled:opacity-50"
                        title={`刪除：${category.label}`}
                      >
                        🗑️
                      </button>
                    )}
                  </>
                )}
              </div>
            )
          })}

          {categoryItems.length === 0 && <p className="text-xs text-gray-400 px-3 py-2">尚未設定商品類別</p>}
        </div>
      </details>

      <details className="group border border-gray-200 rounded-lg p-2 bg-gray-50/40 mt-3">
        <summary className="list-none cursor-pointer text-xs font-bold text-gray-500 uppercase tracking-wider px-2 py-1 flex items-center justify-between">
          問題捷徑
          <span className="text-gray-400 transition-transform group-open:rotate-180">⌄</span>
        </summary>
        <div className="space-y-1 mt-2">
          <Link
            href={buildHref(activeCategory || undefined, undefined, false)}
            className={`w-full flex items-center justify-between text-sm font-bold px-3 py-2.5 rounded-lg transition-colors ${normalizedActiveProblem === "" ? "text-rose-700 bg-rose-50 border border-rose-100" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent"}`}
          >
            全部問題
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full tracking-wide ${normalizedActiveProblem === "" ? "bg-rose-200 text-rose-800" : "bg-gray-100 text-gray-500"}`}>{productsWithProblemCount}</span>
          </Link>

          {problemShortcutItems.map((shortcut) => {
            const isEditing = manageMode && editingProblemName === shortcut.label
            if (isEditing) {
              return (
                <form
                  key={`${shortcut.query}-${shortcut.label}`}
                  className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1.5"
                  onSubmit={(event) => {
                    event.preventDefault()
                    handleRenameProblem(shortcut.label, editingProblemDraft)
                  }}
                >
                  <Input
                    value={editingProblemDraft}
                    onChange={(event) => setEditingProblemDraft(event.target.value)}
                    className="h-7 text-xs bg-white border-rose-200"
                    disabled={isPending}
                  />
                  <button
                    type="submit"
                    className="h-7 shrink-0 rounded border border-rose-200 bg-white px-2 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                    disabled={isPending || !editingProblemDraft.trim()}
                  >
                    存
                  </button>
                  <button
                    type="button"
                    className="h-7 shrink-0 rounded border border-gray-200 bg-white px-2 text-[11px] font-semibold text-gray-500 hover:bg-gray-100"
                    onClick={cancelEditProblem}
                    disabled={isPending}
                  >
                    取消
                  </button>
                </form>
              )
            }

            return (
              <div
                key={`${shortcut.query}-${shortcut.label}`}
                className={`w-full flex items-center gap-1 text-sm font-bold px-3 py-2.5 rounded-lg border transition-colors ${isActiveProblem(shortcut.query) ? "text-rose-700 bg-rose-50 border-rose-100" : "text-gray-600 border-transparent hover:bg-gray-50"}`}
              >
                <Link href={buildHref(activeCategory || undefined, shortcut.query, false)} className="flex-1">
                  {shortcut.label}
                </Link>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full tracking-wide ${isActiveProblem(shortcut.query) ? "bg-rose-200 text-rose-800" : "bg-gray-100 text-gray-500"}`}>{shortcut.count}</span>
                {manageMode && (
                  <>
                    <button
                      type="button"
                      onClick={() => startEditProblem(shortcut.label)}
                      disabled={isPending}
                      className="text-xs text-gray-500 hover:text-rose-700 disabled:opacity-50"
                      title={`改名：${shortcut.label}`}
                    >
                      ✏️
                    </button>
                    {shortcut.canDelete !== false && (
                      <button
                        type="button"
                        onClick={() => handleDeleteProblem(shortcut.label, shortcut.count)}
                        disabled={isPending}
                        className="text-xs text-gray-400 hover:text-rose-700 disabled:opacity-50"
                        title={`刪除：${shortcut.label}`}
                      >
                        🗑️
                      </button>
                    )}
                  </>
                )}
              </div>
            )
          })}
          {problemShortcutItems.length === 0 && <p className="text-xs text-gray-400 px-3 py-2">尚未設定問題捷徑</p>}
        </div>
      </details>

      {manageMode && (
        <p className="text-[11px] text-gray-500 mt-3 leading-relaxed">
          點 ✏️ 直接在列內改名，🗑️ 可刪除，Enter 或「存」即套用。
        </p>
      )}
    </aside>
  )
}
