(async function () {
  'use strict';
  const $ = s => document.querySelector(s), { client, escape: esc, safeImage, problem } = window.CatalogBackend;
  let rows = [], settings = null, editing = null, currentUser = null, busy = false;
  const money = n => 'NT$ ' + Number(n).toLocaleString('zh-TW');
  function status(message, error = false) { $('#admin-status').textContent = message; $('#admin-status').classList.toggle('error', error); }
  function lockForm(form, locked) { form.querySelectorAll('button,input,textarea').forEach(el => el.disabled = locked); }
  function hideWorkspace() { $('#workspace').hidden = true; rows = []; settings = null; $('#admin-products').replaceChildren(); $('#editor').close(); }
  function setup(error) { $('#setup-panel').hidden = !(error?.code === 'PGRST205' || error?.code === '42P01'); }
  async function checkConnection() {
    const { error } = await client.from('catalog_settings').select('id').eq('id', 1).single();
    setup(error); if (error) status(problem(error), true);
    return !error;
  }
  async function enter(user) {
    currentUser = user; $('#logout').hidden = !user; hideWorkspace(); $('#login-panel').hidden = !!user;
    if (!user) { status('請使用已授權的管理員帳號登入。'); await checkConnection(); return; }
    status('正在確認管理員權限…');
    const { data, error } = await client.from('catalog_admins').select('user_id').eq('user_id', user.id).maybeSingle();
    if (error) { setup(error); status(problem(error), true); return; }
    if (!data) { status('此帳號尚未取得管理權限。請將 Supabase Authentication 中此帳號的 User UID 加入 catalog_admins，完成後重新登入。', true); return; }
    if (!await loadAll()) return;
    $('#setup-panel').hidden = true; $('#workspace').hidden = false; $('#signed-in').textContent = user.email || '管理員';
    status('已連線 Supabase。修改儲存後，訪客頁會讀取最新商品資料。');
  }
  async function loadAll() {
    const [productsResult, settingsResult] = await Promise.all([
      client.from('catalog_products').select('*').order('sort_order').order('id'),
      client.from('catalog_settings').select('*').eq('id', 1).single()
    ]);
    const error = productsResult.error || settingsResult.error;
    if (error) { setup(error); status(problem(error), true); return false; }
    rows = productsResult.data; settings = settingsResult.data; render();
    const f = $('#settings-form'); f.elements.shop_name.value = settings.shop_name; f.elements.line_id.value = settings.line_id; f.elements.demo_mode.checked = settings.demo_mode;
    return true;
  }
  function render() {
    $('#stat-total').textContent = rows.length; $('#stat-active').textContent = rows.filter(p => p.is_active).length; $('#stat-out').textContent = rows.filter(p => p.is_active && !p.stock).length;
    const query = $('#admin-search').value.toLowerCase().trim(), filter = $('#admin-filter').value;
    const list = rows.filter(p => (p.name + ' ' + p.id + ' ' + p.category).toLowerCase().includes(query) && (filter === 'all' || p.is_active === (filter === 'active')));
    $('#admin-empty').hidden = !!list.length;
    $('#admin-products').innerHTML = list.map(p => `<tr><td><img src="${esc(safeImage(p.image))}" alt=""><div><strong>${esc(p.name)}</strong><span class="small">${esc(p.spec)}</span></div></td><td>${esc(p.id)}<span class="small">${esc(p.category)}</span></td><td>${money(p.price)}</td><td class="${!p.stock ? 'stock-zero' : ''}">${p.stock}</td><td><span class="badge ${p.is_active ? '' : 'off'}">${p.is_active ? '上架中' : '已下架'}</span></td><td><button class="outline" data-edit="${esc(p.id)}">編輯</button></td></tr>`).join('');
    $('#admin-products').querySelectorAll('[data-edit]').forEach(button => button.onclick = () => edit(rows.find(p => p.id === button.dataset.edit)));
    $('#category-options').innerHTML = [...new Set(rows.map(p => p.category))].map(c => `<option value="${esc(c)}"></option>`).join('');
  }
  function edit(product = null) {
    editing = product ? { ...product } : null; const f = $('#product-form'); f.reset(); $('#editor-status').textContent = '';
    $('#editor-title').textContent = product ? '編輯商品' : '新增商品';
    const values = product || { id: '', name: '', category: '', spec: '', price: 0, stock: 0, image: 'images/mug.jpg', tag: '', description: '', sort_order: rows.length + 1 };
    for (const name of ['id','name','category','spec','price','stock','image','tag','description','sort_order']) f.elements[name].value = values[name];
    f.elements.id.readOnly = !!product; f.elements.is_active.checked = product?.is_active || false; $('#editor').showModal();
  }
  $('#product-form').onsubmit = async event => {
    event.preventDefault(); if (busy) return; const f = event.currentTarget;
    const payload = {}; for (const k of ['id','name','category','spec','image','tag','description']) payload[k] = f.elements[k].value.trim();
    for (const k of ['price','stock','sort_order']) payload[k] = Number(f.elements[k].value);
    payload.is_active = f.elements.is_active.checked;
    if (!payload.name || !payload.category || safeImage(payload.image) !== payload.image) { $('#editor-status').textContent = '請填寫商品名稱、分類與有效的 HTTPS 圖片網址或 images/ 路徑。'; return; }
    if (['price','stock','sort_order'].some(k => !Number.isInteger(payload[k]))) { $('#editor-status').textContent = '價格、庫存與排序請使用整數。'; return; }
    busy = true; lockForm(f, true); $('#editor-status').textContent = '正在儲存…';
    try {
      const query = editing ? client.from('catalog_products').update(payload).eq('id', editing.id).eq('version', editing.version) : client.from('catalog_products').insert(payload);
      const { data, error } = await query.select();
      if (error) { $('#editor-status').textContent = problem(error); return; }
      if (!data?.length) { $('#editor-status').textContent = '儲存未生效：商品可能已被其他管理員更新，或你的權限已變更。請保留修改內容、關閉視窗並重新整理後再試。'; return; }
      $('#editor').close(); await loadAll(); status('商品已儲存至 Supabase。');
    } catch { $('#editor-status').textContent = '儲存失敗，請確認連線後重試。輸入內容已保留。'; }
    finally { busy = false; lockForm(f, false); }
  };
  $('#settings-form').onsubmit = async event => {
    event.preventDefault(); if (busy || !settings) return; const f = event.currentTarget;
    const payload = { shop_name: f.elements.shop_name.value.trim(), line_id: f.elements.line_id.value.trim(), demo_mode: f.elements.demo_mode.checked };
    if (!payload.shop_name) { $('#settings-status').textContent = '請填寫商店名稱。'; return; }
    busy = true; lockForm(f, true); $('#settings-status').textContent = '正在儲存…';
    try {
      const { data, error } = await client.from('catalog_settings').update(payload).eq('id', 1).eq('version', settings.version).select();
      if (error) { $('#settings-status').textContent = problem(error); return; }
      if (!data?.length) { $('#settings-status').textContent = '設定已被其他管理員變更或權限不足，請重新整理後再試。'; return; }
      settings = data[0]; $('#settings-status').textContent = '商店設定已儲存。';
    } catch { $('#settings-status').textContent = '儲存失敗，請確認連線後重試。'; }
    finally { busy = false; lockForm(f, false); }
  };
  $('#login-form').onsubmit = async event => {
    event.preventDefault(); const f = event.currentTarget; lockForm(f, true); status('正在登入…');
    try {
      const { data, error } = await client.auth.signInWithPassword({ email: f.elements.email.value.trim(), password: f.elements.password.value });
      if (error) { status(problem(error), true); return; }
      f.elements.password.value = ''; await enter(data.user);
    } catch { status('登入失敗，請確認網路後重試。', true); }
    finally { lockForm(f, false); }
  };
  $('#logout').onclick = async () => { await client.auth.signOut({ scope: 'local' }); currentUser = null; await enter(null); };
  $('#close-editor').onclick = () => { if (!busy) $('#editor').close(); };
  $('#editor').addEventListener('cancel', event => { if (busy) event.preventDefault(); });
  $('#new-product').onclick = () => edit(); $('#admin-search').oninput = render; $('#admin-filter').onchange = render;
  $('#reload').onclick = async () => { if (busy) return; if (await loadAll()) status('商品與設定已更新。'); };
  $('#retry-setup').onclick = () => enter(currentUser);
  if (!client) { status('尚未設定 Supabase 連線，請確認 config.js。', true); return; }
  client.auth.onAuthStateChange(event => { if (event === 'SIGNED_OUT') { hideWorkspace(); $('#logout').hidden = true; $('#login-panel').hidden = false; status('已登出，請重新登入。'); } });
  try { const { data, error } = await client.auth.getSession(); if (error) throw error; await enter(data.session?.user || null); }
  catch (error) { $('#login-panel').hidden = false; status(problem(error), true); }
})();
