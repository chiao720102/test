# 日常選物 — Supabase 商品詢價網站

靜態 HTML/CSS/JavaScript 前台與管理後台，可部署至 GitHub Pages 或一般靜態網站主機。商品資料儲存於 Supabase Postgres，管理員使用 Supabase Auth Email／密碼登入。

## 一次性啟用

1. 在 Supabase **SQL Editor** 執行 [`supabase/schema.sql`](supabase/schema.sql)。這會建立 `catalog_products`、`catalog_settings`、`catalog_admins` 與 RLS 權限規則。
2. 想保留六件示範商品時，執行 [`supabase/seed.sql`](supabase/seed.sql)。這不覆蓋已有商品。
3. 在 **Authentication → Users → Add user** 建立管理員 Email／密碼帳號，完成 Email 驗證或使用管理介面的確認選項。複製該帳號 **User UID**，在 SQL Editor 執行：

   ```sql
   insert into public.catalog_admins(user_id)
   values ('請替換成管理員的實際 User UID')
   on conflict do nothing;
   ```

4. 開啟 `admin.html`，用上述帳號登入。登入 Supabase 控制台的帳號與此網站的 Supabase Auth 使用者是不同的帳號系統。
5. 在「商店設定」填入 LINE 官方帳號 ID（含 `@`）。以真正商品取代示範內容後，可關閉示範提示。

`config.js` 已放入指定專案 URL 與 **publishable key**。前端公開金鑰不是管理員金鑰；所有資料存取仍受 RLS 約束。**不要將 `.env.local`、service_role 或 secret key 放到網站或 GitHub**。SDK 固定為 `@supabase/supabase-js` 2.116.0，已存於 vendor/，避免執行時依賴 CDN。

## 功能

- 商品分類／搜尋／排序、規格詳情、庫存顯示、詢價數量與金額、複製清單與 LINE 預填訊息。
- 後台商品新增／編輯、庫存與價格、上架／下架、排序、商店名稱、LINE 帳號、示範模式。
- 圖片使用現有 images/ 路徑或 HTTPS 圖片網址；不包含上傳服務。
- 開啟前台時讀取最新資料；可按「更新商品」，頁面在背景以外每 30 秒更新。詢價清單開啟及複製前也會更新；庫存降低、下架或價格變更時提醒重新確認。
- 管理員修改使用版本比對，防止同時編輯時靜默覆蓋。一般帳號不具管理權限。
- 訪客只能讀取上架商品；未授權使用者無法修改商品、設定或管理員名單。商品採下架保留，不提供永久刪除。

## 目前限制

- 需要完成上述 Supabase 初始化才能使用後台。資料表未建立時，前台明確標示「資料庫尚未啟用」並顯示原本示範商品；其他連線失敗不冒充同步成功。
- 不收款、不建立訂單、不自動扣庫存。價格與庫存為詢價參考，以店家回覆為準。
- 詢價清單只保留在本次頁面；重新整理會清空。登入工作階段存在當前分頁的 sessionStorage，後台使用完可登出。
- 未加入訪客個資蒐集或瀏覽追蹤。
- 開發與登入請使用 HTTP localhost 或 HTTPS 靜態主機；不建議以 file:// 使用雲端後台。

## 驗證

`tests/` 包含本機 Postgres 相容的 RLS 測試（PGlite）及模擬後端的介面測試（jsdom）。在 `tests` 資料夾執行 `pnpm install`、`pnpm test`。測試不連接真實 Supabase，也不修改真實資料；正式專案初始化後仍需以實際管理員帳號驗證登入與寫入。

## 圖片與套件來源

- [Notebook — Wikimedia Commons, CC0](https://commons.wikimedia.org/wiki/File:A_notebook.jpg)
- [Mug — Unsplash](https://unsplash.com/photos/white-ceramic-mug-on-white-surface-oJ9CgpidOco)
- [Tote — Pexels](https://www.pexels.com/photo/canvas-tote-bag-with-books-and-dried-flowers-30382341/)
- Supabase JS：MIT License，見 `vendor/supabase-LICENSE`。
- [Supabase 公開金鑰說明](https://supabase.com/docs/guides/getting-started/api-keys)、[RLS 說明](https://supabase.com/docs/guides/database/postgres/row-level-security)。
