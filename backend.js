(function () {
  'use strict';
  const config = window.SUPABASE_CONFIG;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function safeImage(value) {
    const image = String(value || '');
    if (/^images\/[a-zA-Z0-9._/-]+$/.test(image) && !image.includes('..')) return image;
    try { const url = new URL(image); if (url.protocol === 'https:' && !url.username && !url.password) return url.href; } catch {}
    return 'images/mug.jpg';
  }
  function problem(error) {
    if (error?.code === 'PGRST205' || error?.code === '42P01') return '資料庫尚未初始化，請先執行 supabase/schema.sql。';
    if (error?.code === '42501' || error?.status === 403) return '沒有管理權限，請確認管理員名單與資料庫權限設定。';
    if (error?.code === '23505') return '商品編號已存在，請換一個編號。';
    if (error?.code === '23514' || error?.code === '22003') return '欄位格式或數值超過允許範圍，請檢查後重試。';
    if (error?.code === 'invalid_credentials') return 'Email 或密碼不正確。';
    if (error?.code === 'email_not_confirmed') return '此帳號尚未完成 Email 驗證。';
    return '連線或操作失敗，請稍後重試。輸入內容已保留。';
  }
  let client = null;
  if (config?.url && config?.publishableKey && window.supabase) {
    client = window.supabase.createClient(config.url, config.publishableKey, {
      auth: { storage: window.sessionStorage, storageKey: 'catalog-admin-auth', persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
      global: { fetch: (url, options = {}) => fetch(url, { ...options, signal: options.signal || AbortSignal.timeout(15000) }) }
    });
  }
  window.CatalogBackend = {client, escape, safeImage, problem};
})();
