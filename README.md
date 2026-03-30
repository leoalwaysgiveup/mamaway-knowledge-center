# Mamaway Knowledge Center (Mamaway 商品資料與素材查詢中心) 🚀

這是一個專為 Mamaway 內部打造的高效率「商品知識庫」平台，旨在縮短門市人員查找商品資訊、客服回覆以及行銷素材管理的時間。系統具備豐富的視覺化介面、智慧化輸入助手以及完整的媒體素材管理能力。

![商品列表總覽](/Users/l.d/.gemini/antigravity/brain/af0c9cc7-0610-412b-96f0-1a972163fb40/product_list_verification_1774750708469.png)

## 🌟 核心功能亮點

### 1. 商品全方位管理 (Product CRM)
*   **全功能 CRUD**：完整的商品新增、編輯與刪除工作流，連結 MySQL 資料庫讀取即時內容。
*   **分頁式詳情展示**：
    *   **商品概覽**：成分、材質、核心賣點與痛點解決。
    *   **銷售 Tips**：一線人員專屬銷售指引與老闆/PM 內部叮嚀。
    *   **FAQ / 門市 Q&A**：結構化展示常見問題。
    *   **過往優質回覆**：收集神回覆紀錄，並預留 AI 改寫串接點。
    *   **素材資產庫**：分類展示官網 URL、產品圖、情境圖與影音。

### 2. 智慧輸入與排版優化
*   **SmartTextarea (智慧輔助輸入)**：在管理後台輸入核心賣點時，系統會智慧辨識符號（●, -, *, 1. 等）並在下一行自動補全，大幅提升打字效率。
*   **彈性格式渲染**：
    *   **舒適換行**：商品描述支持純換行，讓排版更靈活、留白更美觀。
    *   **混合渲染**：列表區域自動補全圓點符號，同時支持空行間距顯示。

### 3. 多媒體素材中心 (Media Asset Management)
*   **本機檔案上傳**：支持將圖片直接從電腦上傳至伺服器，自動儲存至 `public/uploads`。
*   **深層導航**：在商品頁點擊「更換相片」可自動跳轉至管理頁面的素材區並自動對齊，操作無縫銜接。

---

## 🛠️ 技術架構

*   **框架**: [Next.js 15+](https://nextjs.org/) (App Router + Turbopack)
*   **資料庫**: [MySQL (Local/Brew)](https://www.mysql.com/)
*   **ORM**: [Prisma](https://www.prisma.io/)
*   **UI 組件**: [Shadcn UI](https://ui.shadcn.com/) (Radix UI) + Tailwind CSS 4
*   **語言**: TypeScript

---

## 🚀 快速開始

### 1. 環境需求
*   Node.js 20+
*   MySQL 服務 (Mac 建議使用 `brew install mysql`)

### 2. 安裝與設定
```bash
# 安裝依賴
npm install

# 資料庫連線設定 (請確認 .env.local 中的 DATABASE_URL)
# 執行資料庫遷移
npx prisma db push

# (選填) 載入初始測試資料
npx prisma db seed

# (選填) 檢查舊資料格式（不會修改資料）
npm run normalize:data:dry

# (選填) 套用 tags / asset.type 格式修正
npm run normalize:data
```

### 3. 啟動開發環境
```bash
npm run dev
```
打開 [http://localhost:3000](http://localhost:3000) 即可使用。

---

## 📂 專案結構簡介
*   `src/app/`：Next.js 頁面與路由處理。
*   `src/app/manage/`：商品管理與編輯後台。
*   `src/components/`：複用組件（包含 `SmartTextarea.tsx`）。
*   `src/lib/`：Prisma 客戶端與通用工具函式。
*   `prisma/`：資料庫 Schema 定義與種子資料 (Seed data)。
*   `public/uploads/`：存放使用者上傳的商品圖片。

---

## 📸 介面預覽

![商品詳情頁展示](/Users/l.d/.gemini/antigravity/brain/af0c9cc7-0610-412b-96f0-1a972163fb40/product_verify_edit_1774670525752.png)
*圖：包含彈性排版與條列式顯示的商品詳情頁*

![管理後台介面](/Users/l.d/.gemini/antigravity/brain/af0c9cc7-0610-412b-96f0-1a972163fb40/manage_verify_edit_1774670568665.png)
*圖：具備智慧輸入提示與素材管理功能的後台*
