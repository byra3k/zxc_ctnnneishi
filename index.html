<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<title>SAMP Chat</title>
<style>
  :root {
    --bg-main: #0b0f19; --bg-sidebar: #0f1423; --bg-panel: #151c2c; --bg-input: #1a2235;
    --text-main: #e2e8f0; --text-muted: #94a3b8; --border: #1e293b;
    --accent: #3b82f6; --accent-hover: #2563eb; --user-bubble: #1e293b;
    --code-bg: #0f172a; --success: #10b981; --error: #ef4444;
  }
  * { box-sizing: border-box; }
  html, body { width: 100%; height: 100%; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; background: var(--bg-main); color: var(--text-main); display: flex; overflow: hidden; }

  /* ЭКРАН ВХОДА */
  #authScreen { position: fixed; inset: 0; background: var(--bg-main); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px; }
  .auth-box { background: var(--bg-panel); padding: 24px; border-radius: 16px; border: 1px solid var(--border); width: 100%; max-width: 360px; text-align: center; }
  .auth-tabs { display: flex; margin-bottom: 20px; border-bottom: 1px solid var(--border); }
  .auth-tab { flex: 1; padding: 10px; background: none; border: none; color: var(--text-muted); cursor: pointer; border-bottom: 2px solid transparent; }
  .auth-tab.active { color: var(--accent); border-bottom-color: var(--accent); font-weight: 600; }
  .auth-box input { width: 100%; padding: 12px; margin-bottom: 12px; background: var(--bg-input); border: 1px solid var(--border); border-radius: 8px; color: white; outline: none; }
  .btn-login { width: 100%; padding: 12px; background: var(--accent); color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; }

  /* МОБИЛЬНАЯ ШТОРКА */
  #mobileOverlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 90; display: none; opacity: 0; transition: opacity 0.3s; }
  #mobileOverlay.open { display: block; opacity: 1; }

  /* САЙДБАР */
  .sidebar { width: 260px; flex-shrink: 0; background: var(--bg-sidebar); display: flex; flex-direction: column; border-right: 1px solid var(--border); transition: transform 0.3s ease; z-index: 100; }
  .mobile-header { display: none; background: var(--bg-sidebar); padding: 12px 16px; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border); position: absolute; top:0; left:0; right:0; z-index: 50; }
  .hamburger { background: none; border: none; color: white; cursor: pointer; font-size: 20px; }
  .close-sidebar-btn { display: none; background: none; border: none; color: var(--text-muted); font-size: 20px; cursor: pointer; align-self: flex-end; margin-bottom: -10px; padding: 10px; }
  
  @media (max-width: 768px) {
    .sidebar { position: absolute; height: 100%; transform: translateX(-100%); }
    .sidebar.open { transform: translateX(0); }
    .mobile-header { display: flex; }
    .close-sidebar-btn { display: block; }
    .main-content { width: 100%; }
    .chat-inner { padding: 10px; }
  }

  .new-chat-btn { margin: 16px; padding: 12px; background: transparent; border: 1px solid var(--border); border-radius: 8px; color: var(--text-main); cursor: pointer; }
  .chat-history { flex: 1; overflow-y: auto; padding: 0 16px; }
  .history-item { padding: 10px; border-radius: 6px; color: var(--text-main); cursor: pointer; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .history-item:hover, .history-item.active { background: var(--bg-input); }
  .sidebar-footer { padding: 16px; font-size: 12px; color: var(--text-muted); border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 8px; }
  .btn-admin { background: rgba(16, 185, 129, 0.1); color: var(--success); border: 1px solid var(--success); padding: 8px; border-radius: 6px; cursor: pointer; width: 100%; }

  /* ОСНОВНАЯ ЧАСТЬ */
  .main-content { flex: 1; display: flex; flex-direction: column; min-width: 0; height: 100%; position: relative; }
  .chat-container { flex: 1; overflow-y: auto; display: flex; flex-direction: column; padding-bottom: 20px; }
  .chat-inner { width: 100%; max-width: 800px; margin: 0 auto; padding: 20px; display: flex; flex-direction: column; gap: 20px; }

  .message { display: flex; flex-direction: column; font-size: 15px; line-height: 1.6; }
  .message.user { align-items: flex-end; }
  .message.user .bubble { background: var(--user-bubble); padding: 12px 18px; border-radius: 20px; border-bottom-right-radius: 4px; max-width: 90%; white-space: pre-wrap; }
  .message.assistant { align-items: flex-start; }
  .message.assistant .bubble { width: 100%; word-wrap: break-word; }

  details.thought-box { background: var(--bg-panel); border: 1px solid var(--border); border-radius: 8px; margin-bottom: 12px; overflow: hidden; }
  details.thought-box summary { padding: 10px 14px; font-size: 13px; color: var(--text-muted); cursor: pointer; }
  details.thought-box .thought-content { padding: 14px; font-size: 13px; color: var(--text-muted); border-top: 1px solid var(--border); font-family: monospace; white-space: pre-wrap; }
  
  .code-block { background: var(--code-bg); border-radius: 8px; overflow: hidden; margin: 12px 0; border: 1px solid var(--border); }
  .code-header { display: flex; justify-content: space-between; background: #1e293b; padding: 8px 14px; font-size: 12px; color: var(--text-muted); }
  .copy-btn { background: transparent; border: none; color: var(--text-muted); cursor: pointer; font-size: 12px; }
  .code-block pre { margin: 0; padding: 14px; overflow-x: auto; color: #e2e8f0; font-family: monospace; font-size: 13px; }

  /* ВВОД */
  .input-wrapper { padding: 16px; background: linear-gradient(transparent, var(--bg-main) 20%); }
  .input-box { width: 100%; max-width: 800px; margin: 0 auto; background: var(--bg-input); border: 1px solid var(--border); border-radius: 16px; padding: 12px; }
  .input-box:focus-within { border-color: var(--accent); }
  .input-row { display: flex; gap: 10px; align-items: flex-end; }
  textarea { flex: 1; background: transparent; border: none; color: var(--text-main); font-size: 16px; resize: none; outline: none; max-height: 150px; }
  .tools { display: flex; justify-content: space-between; margin-top: 10px; align-items: center; flex-wrap: wrap; gap: 8px; }
  
  .left-tools { display: flex; gap: 8px; flex-wrap: wrap; }
  .toggle-btn { background: none; border: 1px solid var(--border); color: var(--text-muted); border-radius: 20px; padding: 4px 10px; cursor: pointer; font-size: 13px; transition: 0.2s; }
  .toggle-btn.active { color: var(--accent); border-color: var(--accent); }
  
  .send-btn { background: var(--accent); color: white; border: none; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; transition: 0.2s; }
  .send-btn:hover:not(:disabled) { background: var(--accent-hover); }
  .send-btn:disabled { background: #1e293b; color: #475569; }
  .send-btn.stop-mode { background: var(--error); }

  /* МОДЕЛИ */
  .model-selector { position: relative; }
  .model-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 13px; }
  .model-menu { position: absolute; bottom: 100%; right: 0; margin-bottom: 8px; width: 280px; max-height: 300px; overflow-y: auto; background: var(--bg-panel); border: 1px solid var(--border); border-radius: 12px; display: none; flex-direction: column; padding: 8px; z-index: 100; }
  .model-menu.show { display: flex; }
  .model-group-title { font-size: 11px; color: var(--text-muted); padding: 8px 10px 4px; }
  .model-item { padding: 8px 10px; border-radius: 6px; cursor: pointer; font-size: 13px; display: flex; justify-content: space-between; }
  .model-item:hover { background: var(--bg-input); }
  .model-item.active { background: rgba(59, 130, 246, 0.1); color: var(--accent); }
  .spinner { display: inline-block; width: 12px; height: 12px; border: 2px solid var(--text-muted); border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; }

  /* АДМИНКА */
  .modal { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: none; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
  .modal-content { background: var(--bg-panel); width: 100%; max-width: 800px; border-radius: 12px; padding: 20px; max-height: 90vh; display: flex; flex-direction: column; }
  
  .admin-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 10px; }
  .admin-table th, .admin-table td { padding: 8px; border-bottom: 1px solid var(--border); text-align: left; }
  .admin-table th { cursor: pointer; user-select: none; transition: 0.2s; }
  .admin-table th:hover { color: var(--accent); }
  .admin-table th span { font-size: 10px; margin-left: 4px; color: var(--text-muted); }
  
  .admin-btn { padding: 4px 8px; border-radius: 4px; border: none; cursor: pointer; font-size: 12px; color: white; margin-right: 4px; }
  .btn-save { background: var(--accent); }
  .btn-block { background: var(--error); }

  /* ПРОСМОТР И ПОДДЕЛКА ЧАТОВ */
  #chatViewerModal .modal-content { max-width: 600px; height: 80vh; }
  .chat-view-box { flex: 1; overflow-y: auto; background: var(--bg-main); border: 1px solid var(--border); border-radius: 8px; padding: 10px; margin: 10px 0; display: flex; flex-direction: column; gap: 10px; }
  .forge-input { display: flex; gap: 5px; margin-top: 10px; }
  .forge-input select { width: 120px; background: var(--bg-input); color: white; border: 1px solid var(--border); border-radius: 4px; padding: 5px; }
  .forge-input input { flex: 1; background: var(--bg-input); color: white; border: 1px solid var(--border); border-radius: 4px; padding: 5px; }

  @keyframes spin { 100% { transform: rotate(360deg); } }
  .typing-cursor::after { content: "▋"; animation: blink 1s infinite; color: var(--accent); }
  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
</style>
</head>
<body>

  <div id="mobileOverlay" onclick="toggleSidebar()"></div>

  <div id="authScreen">
    <div class="auth-box">
      <div class="auth-tabs">
        <button class="auth-tab active" id="tabLogin" onclick="switchAuth('login')">Вход</button>
        <button class="auth-tab" id="tabRegister" onclick="switchAuth('register')">Регистрация</button>
      </div>
      <div id="loginForm">
        <h2>Вход</h2>
        <input type="text" id="loginUser" placeholder="Username">
        <input type="password" id="loginPass" placeholder="Пароль">
        <button class="btn-login" onclick="doLogin()">Войти</button>
      </div>
      <div id="registerForm" style="display: none;">
        <h2>Регистрация</h2>
        <input type="text" id="regUser" placeholder="Username">
        <input type="password" id="regPass" placeholder="Пароль">
        <input type="email" id="regEmail" placeholder="Email (необязательно)">
        <button class="btn-login" onclick="doRegister()">Зарегистрироваться</button>
      </div>
    </div>
  </div>

  <header class="mobile-header" id="mobileHeader">
    <button class="hamburger" onclick="toggleSidebar()">☰</button>
    <span>SAMP AI</span>
    <div style="width:24px;"></div>
  </header>

  <aside class="sidebar" id="sidebar">
    <button class="close-sidebar-btn" onclick="toggleSidebar()">✕</button>
    <button class="new-chat-btn" id="newChatBtn" style="margin-top: 10px;">+ Новый чат</button>
    <div class="chat-history" id="chatHistory"></div>
    <div class="sidebar-footer">
      <div id="userDisplay" style="font-weight:bold; color:var(--accent);">Гость</div>
      <div id="limitDisplay">Сообщений: -</div>
      <button class="btn-admin" id="adminBtn" style="display:none" onclick="openAdminPanel()">⚙️ Админ-панель</button>
      <button onclick="logout()" style="background:none; border:none; color:var(--error); cursor:pointer; margin-top:5px;">Выйти</button>
    </div>
  </aside>

  <main class="main-content">
    <div class="chat-container" id="chatContainer" style="margin-top: 50px;">
      <div class="chat-inner" id="chatInner">
        <div style="text-align: center; margin-top: 15vh;" id="welcomeScreen">
          <h1>Чем помочь?</h1>
        </div>
      </div>
    </div>

    <div class="input-wrapper">
      <div class="input-box">
        <div class="input-row">
          <textarea id="input" rows="1" placeholder="Сообщение..."></textarea>
          <button class="send-btn" id="sendBtn" disabled>➤</button>
        </div>
        <div class="tools">
          <div class="left-tools">
            <button class="toggle-btn" id="thinkToggle">Раздумие</button>
            <button class="toggle-btn" id="searchToggle">Поиск</button>
          </div>
          
          <div class="model-selector" id="modelSelector">
            <button id="modelBtn" class="model-btn">qwen3.8-omni-flash ▼</button>
            <div class="model-menu" id="modelMenu"></div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <!-- АДМИН ПАНЕЛЬ -->
  <div id="adminModal" class="modal">
    <div class="modal-content">
      <h2 style="margin-top:0;">Управление пользователями</h2>
      <div style="overflow-y:auto;">
        <table class="admin-table">
          <thead>
            <tr>
              <th onclick="sortAdminTable('name')">Юзер <span id="sort-name"></span></th>
              <th onclick="sortAdminTable('role')">Роль <span id="sort-role"></span></th>
              <th onclick="sortAdminTable('limit')">Лимит <span id="sort-limit"></span></th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody id="adminUserList"></tbody>
        </table>
      </div>
      <button onclick="closeAdminPanel()" style="margin-top:15px; background:var(--border); color:white; border:none; padding:10px; border-radius:6px; cursor:pointer;">Закрыть</button>
    </div>
  </div>

  <!-- ПРОСМОТР И ПОДДЕЛКА ЧАТОВ -->
  <div id="chatViewerModal" class="modal">
    <div class="modal-content">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h3 style="margin:0;">Чаты пользователя: <span id="viewerUsername" style="color:var(--accent)"></span></h3>
        <button onclick="closeChatViewer()" style="background:none; border:none; color:white; cursor:pointer; font-size:18px;">✕</button>
      </div>
      
      <select id="viewerChatSelect" onchange="loadSpecificChat()" style="margin-top:10px; padding:8px; background:var(--bg-input); color:white; border:1px solid var(--border); border-radius:4px;"></select>
      
      <div class="chat-view-box" id="viewerMessages"></div>

      <div class="forge-input">
        <select id="forgeRole">
          <option value="user">От Юзера</option>
          <option value="assistant">От ИИ</option>
        </select>
        <input type="text" id="forgeText" placeholder="Текст сообщения...">
        <button class="admin-btn btn-save" onclick="forgeMessage()">Внедрить</button>
      </div>
    </div>
  </div>

<script>
  const API_URL = "/api/messages";
  let currentUser = JSON.parse(localStorage.getItem("samp_user") || "null");
  let currentChatId = Date.now().toString();
  let chats = JSON.parse(localStorage.getItem("samp_chats") || "{}");
  let currentMessages = [];
  let isBusy = false;
  let abortController = null;
  let useThink = false, useSearch = false, selectedModel = "qwen3.8-omni-flash";
  let modelStatuses = {}; 
  
  // Переменные для сортировки админки
  let adminUsersData = {};
  let adminSortField = 'name';
  let adminSortAsc = true;

  const MODELS = {
    "Tier C": ["qwen3.8-omni-flash", "deepseek-v4-pro", "deepseek-v4.1-flash", "glm-5.3", "glm-5.3-flash", "glm-5.3-prime", "kimi-k3", "deepseek-v4.1-flash-1017"],
    "Tier B": ["gemini-4-argon", "gemini-4-carbon", "gpt-6-luna", "gpt-6.1-sol", "gpt-6-sol", "kimi-k3.1-pro", "deepseek-v4.1-flash-uncensored", "glm-5.3-uncensored", "glm-5.3-flash-uncensored"],
    "Tier A": ["claude-opus-5-5", "claude-opus-5", "gpt-6-astra"]
  };

  const $ = id => document.getElementById(id);
  const chatContainer = $("chatContainer"), chatInner = $("chatInner"), input = $("input"), sendBtn = $("sendBtn");

  // --- АВТОРИЗАЦИЯ ---
  function switchAuth(type) {
    if (type === 'login') { $("tabLogin").classList.add("active"); $("tabRegister").classList.remove("active"); $("loginForm").style.display = "block"; $("registerForm").style.display = "none"; }
    else { $("tabLogin").classList.remove("active"); $("tabRegister").classList.add("active"); $("loginForm").style.display = "none"; $("registerForm").style.display = "block"; }
  }

  async function doLogin() {
    const res = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: $("loginUser").value.trim(), password: $("loginPass").value, action: "login" }) });
    const data = await res.json(); if (!res.ok) return alert(data.error);
    finishLogin(data);
  }

  async function doRegister() {
    const res = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: $("regUser").value.trim(), password: $("regPass").value, email: $("regEmail").value.trim(), action: "register" }) });
    const data = await res.json(); if (!res.ok) return alert(data.error);
    finishLogin(data);
  }

  function finishLogin(data) {
    currentUser = data; localStorage.setItem("samp_user", JSON.stringify(currentUser));
    $("authScreen").style.display = "none"; $("userDisplay").textContent = currentUser.username;
    $("limitDisplay").textContent = currentUser.role === "user" ? `Сообщений: ${currentUser.limit}` : `Роль: ${currentUser.role}`;
    if (currentUser.role === "admin") $("adminBtn").style.display = "block";
    renderHistory();
  }

  function logout() { localStorage.removeItem("samp_user"); location.reload(); }

  // --- МОБИЛЬНАЯ ШТОРКА ---
  function toggleSidebar() {
    const sidebar = $("sidebar"), overlay = $("mobileOverlay");
    if (sidebar.classList.contains("open")) { sidebar.classList.remove("open"); overlay.classList.remove("open"); }
    else { sidebar.classList.add("open"); overlay.classList.add("open"); }
  }

  // --- СИНХРОНИЗАЦИЯ ЧАТОВ ---
  async function syncChats() {
    localStorage.setItem("samp_chats", JSON.stringify(chats));
    if (currentUser) {
      await fetch("/api/sync-chats", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: currentUser.username, chats }) });
    }
  }

  // --- РАБОТА С МОДЕЛЯМИ ---
  function renderModelsMenu() {
    $("modelMenu").innerHTML = "";
    for (const [tier, models] of Object.entries(MODELS)) {
      let hasVisible = false;
      const groupDiv = document.createElement("div"); groupDiv.className = "model-group-title"; groupDiv.textContent = tier;
      
      models.forEach(m => {
        if (currentUser.role === 'user' && modelStatuses[m] === 'error') return;
        if (!hasVisible) { $("modelMenu").appendChild(groupDiv); hasVisible = true; }
        
        const item = document.createElement("div"); item.className = `model-item ${m === selectedModel ? 'active' : ''}`;
        let status = modelStatuses[m] === 'ok' ? '✅' : modelStatuses[m] === 'error' ? '❌' : '';
        item.innerHTML = `<span>${m}</span> <span>${status}</span>`;
        item.onclick = () => { selectedModel = m; $("modelBtn").textContent = m + " ▼"; $("modelMenu").classList.remove("show"); };
        $("modelMenu").appendChild(item);
      });
    }
  }

  async function pingAllModels() {
    modelStatuses = {}; renderModelsMenu();
    const allModels = Object.values(MODELS).flat();
    await Promise.allSettled(allModels.map(async (m, i) => {
      return new Promise(resolve => setTimeout(async () => {
        try {
          const res = await fetch(API_URL, { method: "POST", headers: { "Content-Type": "application/json", "x-user": currentUser.username }, body: JSON.stringify({ model: m, max_tokens: 1, messages: [{ role: "user", content: "ping" }] }) });
          modelStatuses[m] = res.ok ? 'ok' : 'error';
        } catch { modelStatuses[m] = 'error'; }
        renderModelsMenu(); resolve();
      }, i * 100));
    }));
  }

  $("modelBtn").onclick = (e) => { e.stopPropagation(); const isOpening = !$("modelMenu").classList.contains("show"); $("modelMenu").classList.toggle("show"); if (isOpening) pingAllModels(); };
  document.addEventListener("click", (e) => { if (!$("modelBtn").contains(e.target)) $("modelMenu").classList.remove("show"); });

  // --- АДМИН ПАНЕЛЬ И СОРТИРОВКА ---
  async function openAdminPanel() {
    const res = await fetch("/api/admin/users"); 
    adminUsersData = await res.json();
    renderAdminTable();
    $("adminModal").style.display = "flex";
  }

  function sortAdminTable(field) {
    if (adminSortField === field) adminSortAsc = !adminSortAsc;
    else { adminSortField = field; adminSortAsc = true; }
    renderAdminTable();
  }

  function renderAdminTable() {
    const tbody = $("adminUserList"); tbody.innerHTML = "";
    
    // Обновляем стрелочки в заголовках
    ['name', 'role', 'limit'].forEach(f => {
      $(`sort-${f}`).textContent = adminSortField === f ? (adminSortAsc ? '▲' : '▼') : '';
    });

    // Сортируем ключи (имена пользователей)
    let sortedNames = Object.keys(adminUsersData).sort((a, b) => {
      let valA, valB;
      if (adminSortField === 'name') { valA = a.toLowerCase(); valB = b.toLowerCase(); }
      else if (adminSortField === 'role') { valA = adminUsersData[a].role; valB = adminUsersData[b].role; }
      else if (adminSortField === 'limit') { valA = adminUsersData[a].limit; valB = adminUsersData[b].limit; }
      
      if (valA < valB) return adminSortAsc ? -1 : 1;
      if (valA > valB) return adminSortAsc ? 1 : -1;
      return 0;
    });

    for (const name of sortedNames) {
      const data = adminUsersData[name];
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${name}</td>
        <td>
          <select onchange="updateUser('${name}', 'role', this.value)" style="background:var(--bg-input); color:white; border:none; border-radius:4px; padding:4px;">
            <option value="user" ${data.role==='user'?'selected':''}>User</option>
            <option value="helper" ${data.role==='helper'?'selected':''}>Helper</option>
            <option value="moderator" ${data.role==='moderator'?'selected':''}>Moderator</option>
            <option value="admin" ${data.role==='admin'?'selected':''}>Admin</option>
          </select>
        </td>
        <td><input type="number" value="${data.limit}" onchange="updateUser('${name}', 'setLimit', this.value)" style="width:60px; background:var(--bg-input); color:white; border:none; border-radius:4px; padding:4px;"></td>
        <td>
          <button class="admin-btn btn-save" onclick="viewUserChats('${name}')">Чаты</button>
          <button class="admin-btn btn-block" onclick="updateUser('${name}', 'block', ${!data.blocked})">${data.blocked ? 'Разблок' : 'Блок'}</button>
        </td>`;
      tbody.appendChild(tr);
    }
  }

  async function updateUser(u, a, v) {
    await fetch("/api/admin/update", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ targetUser: u, action: a, value: v }) });
    // Обновляем данные и перерисовываем без сброса сортировки
    const res = await fetch("/api/admin/users"); 
    adminUsersData = await res.json();
    renderAdminTable();
  }
  
  function closeAdminPanel() { $("adminModal").style.display = "none"; }

  // --- ПРОСМОТР И ПОДДЕЛКА ЧАТОВ ---
  let currentViewUser = null;
  let currentViewChatId = null;

  async function viewUserChats(username) {
    currentViewUser = username;
    $("viewerUsername").textContent = username;
    const res = await fetch(`/api/admin/chats/${username}`);
    const userChats = await res.json();
    
    const select = $("viewerChatSelect"); select.innerHTML = "";
    
    // Сортируем чаты по времени (ID) - новые сверху
    const sortedChatIds = Object.keys(userChats).sort((a, b) => b - a);
    
    for (const id of sortedChatIds) {
      const opt = document.createElement("option"); opt.value = id; opt.textContent = userChats[id].title;
      select.appendChild(opt);
    }
    
    if (sortedChatIds.length === 0) {
      $("viewerMessages").innerHTML = "<div style='color:gray;'>У пользователя нет сохраненных чатов.</div>";
      currentViewChatId = null;
    } else {
      currentViewChatId = sortedChatIds[0];
      select.value = currentViewChatId;
      loadSpecificChat();
    }
    
    $("adminModal").style.display = "none";
    $("chatViewerModal").style.display = "flex";
  }

  async function loadSpecificChat() {
    currentViewChatId = $("viewerChatSelect").value;
    const res = await fetch(`/api/admin/chats/${currentViewUser}`);
    const userChats = await res.json();
    const msgs = userChats[currentViewChatId]?.messages || [];
    
    const box = $("viewerMessages"); box.innerHTML = "";
    msgs.forEach(m => {
      let div = document.createElement("div");
      div.style.cssText = `padding:8px; border-radius:8px; max-width:80%; word-break:break-word; ${m.role === 'user' ? 'align-self:flex-end; background:#2563eb;' : 'align-self:flex-start; background:#374151;'}`;
      div.textContent = `[${m.role === 'user' ? 'Юзер' : 'ИИ'}]: ${m.content}`;
      box.appendChild(div);
    });
    box.scrollTop = box.scrollHeight;
  }

  async function forgeMessage() {
    if (!currentViewChatId) return alert("Нет чата для внедрения");
    const role = $("forgeRole").value;
    const text = $("forgeText").value.trim();
    if (!text) return;
    
    await fetch("/api/admin/forge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ targetUser: currentViewUser, chatId: currentViewChatId, role, text }) });
    $("forgeText").value = "";
    loadSpecificChat();
  }
  function closeChatViewer() { $("chatViewerModal").style.display = "none"; $("adminModal").style.display = "flex"; }

  // --- ОТПРАВКА СООБЩЕНИЙ ---
  function renderHistory() {
    $("chatHistory").innerHTML = "";
    Object.keys(chats).sort((a,b) => b - a).forEach(id => {
      const div = document.createElement("div"); div.className = `history-item ${id === currentChatId ? "active" : ""}`;
      div.textContent = chats[id].title || "Новый чат";
      div.onclick = () => { 
        if (isBusy) return; 
        currentChatId = id; 
        currentMessages = [...chats[id].messages]; 
        chatInner.innerHTML = ""; 
        $("welcomeScreen").style.display = "none";
        currentMessages.forEach(msg => renderMessage(msg.role, msg.content, msg.thought, false, true)); 
        renderHistory(); 
        if (window.innerWidth <= 768 && $("sidebar").classList.contains("open")) toggleSidebar(); 
      };
      $("chatHistory").appendChild(div);
    });
  }

  function parseMarkdown(text) {
    if (!text) return "";
    let safe = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    safe = safe.replace(/```(\w*)\n([\s\S]*?)(?:```|$)/g, (match, lang, code) => `<div class="code-block"><div class="code-header"><span>${lang || 'code'}</span><button class="copy-btn" onclick="navigator.clipboard.writeText(this.parentElement.nextElementSibling.innerText); this.innerText='Copied!'">Copy</button></div><pre><code>${code}</code></pre></div>`);
    safe = safe.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/`([^`]+)`/g, "<code>$1</code>");
    return safe.replace(/\n/g, "<br>");
  }

  function renderMessage(role, content, thought = null, isError = false, isHistory = false) {
    $("welcomeScreen").style.display = "none";
    const msgDiv = document.createElement("div"); msgDiv.className = `message ${role}`;
    let html = "";
    if (thought) html += `<details class="thought-box"><summary>🤔 Размышления...</summary><div class="thought-content">${thought}</div></details>`;
    const bubble = document.createElement("div"); bubble.className = "bubble";
    bubble.innerHTML = parseMarkdown(content);
    if (isError) bubble.style.color = "var(--error)";
    html += bubble.outerHTML;
    msgDiv.innerHTML = html; chatInner.appendChild(msgDiv);
    if (!isHistory) chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  function setBusyUI(busy) {
    isBusy = busy;
    if (busy) { sendBtn.disabled = false; sendBtn.classList.add("stop-mode"); sendBtn.textContent = "■"; }
    else { sendBtn.disabled = input.value.trim() === ""; sendBtn.classList.remove("stop-mode"); sendBtn.textContent = "➤"; }
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text || isBusy || !currentUser) return;
    if (currentUser.role === "user" && currentUser.limit <= 0) return alert("Лимит исчерпан.");

    setBusyUI(true);
    currentMessages.push({ role: "user", content: text });
    renderMessage("user", text);
    input.value = ""; 
    
    const msgDiv = document.createElement("div"); msgDiv.className = "message assistant";
    const bubble = document.createElement("div"); bubble.className = "bubble"; bubble.innerHTML = '<span class="typing-cursor"></span>';
    msgDiv.appendChild(bubble); chatInner.appendChild(msgDiv); chatContainer.scrollTop = chatContainer.scrollHeight;

    let systemPrompt = "";
    if (useThink) systemPrompt += "Оберни размышления в теги <thought>...</thought>. ";

    const payload = { model: selectedModel, max_tokens: 4096, messages: currentMessages, stream: true };
    if (systemPrompt) payload.system = systemPrompt;

    abortController = new AbortController();
    let fullText = "";

    try {
      const res = await fetch(API_URL, { method: "POST", headers: { "Content-Type": "application/json", "x-user": currentUser.username }, body: JSON.stringify(payload), signal: abortController.signal });
      if (!res.ok) throw new Error((await res.json()).error?.message || "Ошибка");
      
      if (currentUser.role === "user") { currentUser.limit--; $("limitDisplay").textContent = `Сообщений: ${currentUser.limit}`; localStorage.setItem("samp_user", JSON.stringify(currentUser)); }

      const reader = res.body.getReader(); const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n"); buffer = lines.pop();

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dStr = line.slice(6).trim(); if (dStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(dStr);
              if (parsed.type === "content_block_delta" && parsed.delta?.text) {
                fullText += parsed.delta.text;
                let thought = null, answer = fullText;
                const match = fullText.match(/<thought>([\s\S]*?)(?:<\/thought>|$)/);
                if (match) { thought = match[1].trim(); answer = fullText.replace(match[0], "").trim(); }
                bubble.innerHTML = (thought ? `<details class="thought-box" open><summary>🤔 Размышляет...</summary><div class="thought-content">${thought}</div></details>` : "") + parseMarkdown(answer) + '<span class="typing-cursor"></span>';
                chatContainer.scrollTop = chatContainer.scrollHeight;
              }
            } catch(e) {}
          }
        }
      }

      bubble.innerHTML = bubble.innerHTML.replace('<span class="typing-cursor"></span>', '');
      currentMessages.push({ role: "assistant", content: fullText });
      if (!chats[currentChatId]) chats[currentChatId] = { title: text.slice(0, 30), messages: [] };
      chats[currentChatId].messages = currentMessages;
      await syncChats(); renderHistory();

    } catch (err) {
      if (abortController.signal.aborted) {
        bubble.innerHTML = bubble.innerHTML.replace('<span class="typing-cursor"></span>', '') + ' <span style="color:gray;font-size:12px;">[Остановлено]</span>';
        if (fullText) { currentMessages.push({ role: "assistant", content: fullText }); if (!chats[currentChatId]) chats[currentChatId] = { title: text.slice(0, 30), messages: [] }; chats[currentChatId].messages = currentMessages; await syncChats(); renderHistory(); }
        else msgDiv.remove();
      } else {
        bubble.innerHTML = `<span style="color:var(--error)">Ошибка: ${err.message}</span>`;
      }
    } finally { setBusyUI(false); abortController = null; }
  }

  input.addEventListener("input", () => { input.style.height = "auto"; input.style.height = Math.min(input.scrollHeight, 150) + "px"; if(!isBusy) sendBtn.disabled = input.value.trim() === ""; });
  input.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (isBusy) abortController?.abort(); else if (!sendBtn.disabled) sendMessage(); } });
  sendBtn.onclick = () => { if (isBusy) abortController?.abort(); else sendMessage(); };
  
  $("thinkToggle").onclick = (e) => { useThink = !useThink; e.currentTarget.classList.toggle("active", useThink); };
  $("searchToggle").onclick = (e) => { useSearch = !useSearch; e.currentTarget.classList.toggle("active", useSearch); };

  $("newChatBtn").onclick = () => {
    if (isBusy) return;
    currentChatId = Date.now().toString(); currentMessages = [];
    chatInner.innerHTML = ""; chatInner.appendChild($("welcomeScreen")); $("welcomeScreen").style.display = "block";
    input.value = ""; setBusyUI(false); renderHistory();
    if (window.innerWidth <= 768 && $("sidebar").classList.contains("open")) toggleSidebar();
  };

  if (currentUser) finishLogin(currentUser);
</script>
</body>
</html>
