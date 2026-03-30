"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SmartTextarea } from "@/components/SmartTextarea";
import {
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  listCategoryOptions,
} from "@/app/actions";
import { problemShortcutsToInputValue, tagsToInputValue } from "@/lib/product-contracts";

type ProductFormData = {
  id: string;
  name: string;
  pitch: string | null;
  tags: unknown;
  category: string | null;
  problemShortcuts: unknown;
  description: string | null;
  ingredients: string | null;
  coreSellingPoints: string;
  problemsSolved: string;
  targetAudience: string;
  salesTips: string;
  bossNotes: string;
};

function ManageForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [product, setProduct] = useState<ProductFormData | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([
    "孕期穿著",
    "哺乳用品",
    "洗沐護理",
    "抗菌清潔",
  ]);

  useEffect(() => {
    if (!id) return;
    getProduct(id)
      .then((data) => {
        if (data) {
          setProduct(data as ProductFormData);
        }
      });
  }, [id]);

  useEffect(() => {
    listCategoryOptions()
      .then((options) => {
        if (options.length > 0) {
          setCategoryOptions(options);
        }
      })
      .catch(() => {
        // Keep default suggestions if loading options fails.
      });
  }, []);

  async function handleSubmit(formData: FormData) {
    try {
      if (id) {
        await updateProduct(id, formData);
        alert("商品更新成功");
        router.push(`/product/${id}`);
      } else {
        await createProduct(formData);
      }
    } catch (error) {
      console.error(error);
      alert("儲存失敗，請檢查欄位");
    }
  }

  async function handleDeleteProduct() {
    if (!id) return;
    if (!confirm("確定要刪除此商品？此操作無法還原。")) return;
    try {
      await deleteProduct(id);
    } catch (error) {
      console.error(error);
      alert("刪除失敗");
    }
  }

  if (id && !product) {
    return <div className="p-20 text-center font-bold text-gray-400">載入商品資料中...</div>;
  }

  return (
    <form id="product-form" action={handleSubmit} key={product?.id || "new"} className="space-y-8">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 -mx-4 px-4 sm:-mx-0 sm:px-0">
        <div className="container mx-auto px-4 max-w-4xl py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={id ? `/product/${id}` : "/"}>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900 px-2 -ml-2 font-medium">
                &larr; 返回
              </Button>
            </Link>
            <h1 className="text-lg font-bold text-gray-900 border-l border-gray-300 pl-4">
              {id ? `編輯：${product?.name || "載入中"}` : "新增商品"}
            </h1>
          </div>
          <div className="flex gap-3">
            {id && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleDeleteProduct}
                className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 font-bold border border-rose-100 mr-2"
              >
                刪除商品
              </Button>
            )}
            <Button variant="outline" type="button" className="font-semibold shadow-sm bg-white" onClick={() => router.back()}>
              取消
            </Button>
            <Button type="submit" form="product-form" className="font-bold shadow-sm bg-rose-600 hover:bg-rose-700 text-white">
              {id ? "儲存變更" : "確認發布"}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl mt-8 pb-24">
        <div className="space-y-8">
          <input type="hidden" name="salesTips" defaultValue={product?.salesTips || ""} />
          <input type="hidden" name="bossNotes" defaultValue={product?.bossNotes || ""} />

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
                  <label className="text-sm font-bold text-gray-700">
                    商品名稱 <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    name="name"
                    required
                    defaultValue={product?.name}
                    placeholder="例如：超彈力無縫托腹帶"
                    className="border-gray-300 focus-visible:ring-rose-500 font-medium"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-bold text-gray-700">一句話定位 (Pitch)</label>
                  <Input
                    name="pitch"
                    defaultValue={product?.pitch || ""}
                    placeholder="例如：從孕期到產後，完美支撐不勒肚"
                    className="border-gray-300 focus-visible:ring-rose-500 font-medium"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-bold text-gray-700">搜尋關鍵字 (Tags)</label>
                  <Input
                    name="tags"
                    defaultValue={tagsToInputValue(product?.tags)}
                    placeholder="請用逗號分隔，例如：托腹帶, 恥骨痛, 孕晚期"
                    className="border-gray-300 focus-visible:ring-rose-500 font-medium"
                  />
                  <p className="text-xs text-gray-500">系統會自動排除與商品名稱重複的 tags。</p>
                </div>
                <div className="grid gap-2 md:grid-cols-2 md:gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-bold text-gray-700">商品類別</label>
                    <Input
                      list="category-suggestions"
                      name="category"
                      defaultValue={product?.category || ""}
                      placeholder="例如：哺乳用品"
                      className="border-gray-300 focus-visible:ring-rose-500 font-medium"
                    />
                    <p className="text-xs text-gray-500">
                      分類只看這個欄位；若留空，商品只會出現在「全部商品」。
                    </p>
                    <datalist id="category-suggestions">
                      {categoryOptions.map((option) => (
                        <option key={option} value={option} />
                      ))}
                    </datalist>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-bold text-gray-700">問題捷徑</label>
                    <Input
                      name="problemShortcuts"
                      defaultValue={problemShortcutsToInputValue(product?.problemShortcuts)}
                      placeholder="用逗號分隔，例如：紅屁屁, 溢乳困擾"
                      className="border-gray-300 focus-visible:ring-rose-500 font-medium"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-bold text-gray-700">商品描述</label>
                  <Textarea
                    name="description"
                    defaultValue={product?.description || ""}
                    placeholder="輸入完整的商品描述..."
                    className="h-20 border-gray-300 focus-visible:ring-rose-500 font-medium text-sm resize-none"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-bold text-gray-700">成分 / 材質</label>
                  <Input
                    name="ingredients"
                    defaultValue={product?.ingredients || ""}
                    placeholder="例如：純水、檸檬酸銀離子"
                    className="border-gray-300 focus-visible:ring-rose-500 font-medium"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200 overflow-hidden">
            <CardHeader className="bg-gray-50 border-b border-gray-200 py-4">
              <CardTitle className="text-base text-gray-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-gray-200 text-gray-600 flex items-center justify-center text-xs">2</span>
                商品概覽內容
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="coreSellingPoints" className="text-gray-700 font-bold">
                  核心賣點 (Core Selling Points)
                </Label>
                <SmartTextarea
                  id="coreSellingPoints"
                  name="coreSellingPoints"
                  defaultValue={product?.coreSellingPoints || ""}
                  rows={4}
                  className="bg-white border-gray-300 focus-visible:ring-rose-500 font-mono"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                <div className="grid gap-3">
                  <Label htmlFor="problemsSolved" className="text-gray-700 font-bold">
                    適合解決的問題
                  </Label>
                  <SmartTextarea
                    id="problemsSolved"
                    name="problemsSolved"
                    defaultValue={product?.problemsSolved || ""}
                    rows={4}
                    className="bg-white border-gray-300 focus-visible:ring-blue-500 font-mono"
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="targetAudience" className="text-gray-700 font-bold">
                    精準推薦對象
                  </Label>
                  <SmartTextarea
                    id="targetAudience"
                    name="targetAudience"
                    defaultValue={product?.targetAudience || ""}
                    rows={4}
                    className="bg-white border-gray-300 focus-visible:ring-orange-500 font-mono"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}

export default function ManagePage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Suspense fallback={<div className="p-20 text-center">Loading...</div>}>
        <ManageForm />
      </Suspense>
    </div>
  );
}
