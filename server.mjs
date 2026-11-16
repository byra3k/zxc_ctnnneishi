import http from "node:http";
import { readFile, writeFile, access } from "node:fs/promises";
import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
import path from "node:path";

const PORT = process.env.PORT || 3000;
const TARGET = "https://api.samp.team/v1/messages";
const API_KEY = process.env.API_KEY;
const USERS_FILE = path.join(process.cwd(), "users.json");
const CHATS_FILE = path.join(process.cwd(), "chats.json");

let users = { "byra3k": { password: "lubitel_jivotnih", email: "", role: "admin", limit: 9999, blocked: false } };
let allChats = {};

// ---------- ПАРОЛИ ----------
function hashPass(p) {
  const salt = randomBytes(16).toString("hex");
  return salt + ":" + scryptSync(p, salt, 64).toString("hex");
}
function checkPass(p, stored) {
  if (typeof stored !== "string") return false;
  if (!stored.includes(":")) return stored === p; // legacy plaintext
  const [salt, key] = stored.split(":");
  try {
    return timingSafeEqual(Buffer.from(key, "hex"), scryptSync(p, salt, 64));
  } catch { return false; }
}

// ---------- ДАННЫЕ ----------
async function loadData() {
  try { await access(USERS_FILE); users = JSON.parse(await readFile(USERS_FILE, "utf-8")); } catch (e) { await saveUsers(); }
  try { await access(CHATS_FILE); allChats = JSON.parse(await readFile(CHATS_FILE, "utf-8")); } catch (e) { await saveChats(); }
}
let saveChatsTimer = null;
async function saveUsers() { await writeFile(USERS_FILE, JSON.stringify(users, null, 2)); }
async function saveChats() {
  if (saveChatsTimer) clearTimeout(saveChatsTimer);
  saveChatsTimer = setTimeout(async () => {
    saveChatsTimer = null;
    try { await writeFile(CHATS_FILE, JSON.stringify(allChats, null, 2)); } catch (e) { console.error("saveChats", e); }
  }, 300);
}

// ---------- AUTH ----------
function requireAuth(req, res, roles = null) {
  const username = req.headers["x-user"];
  if (!username || !Object.prototype.hasOwnProperty.call(users, username)) {
    res.writeHead(403, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: { message: "Требуется авторизация" } }));
    return null;
  }
  const user = users[username];
  if (user.blocked) {
    res.writeHead(403, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: { message: "Аккаунт заблокирован" } }));
    return null;
  }
  if (roles && !roles.includes(user.role)) {
    res.writeHead(403, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: { message: "Недостаточно прав" } }));
    return null;
  }
  return { username, user };
}

// ---------- WEB SEARCH ----------
async function webSearch(query) {
  try {
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const res = await fetch(searchUrl, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" } });
    const html = await res.text();

    const links = [];
    const regex = /<a class="result__a" href="(.*?)"/g;
    let match;
    while ((match = regex.exec(html)) !== null && links.length < 3) {
      let link = match[1];
      if (link.includes("uddg=")) link = decodeURIComponent(link.split("uddg=")[1].split("&")[0]);
      links.push(link);
    }

    if (links.length === 0) return "Поиск не дал результатов.";

    let context = "Информация из интернета:\n\n";
    for (const link of links) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const siteRes = await fetch(link, { headers: { "User-Agent": "Mozilla/5.0" }, signal: controller.signal });
        clearTimeout(timeoutId);
        let siteHtml = await siteRes.text();
        siteHtml = siteHtml.replace(/<script[\s\S]*?<\/script>/gi, '')
                           .replace(/<style[\s\S]*?<\/style>/gi, '')
                           .replace(/<[^>]+>/g, ' ')
                           .replace(/\s+/g, ' ')
                           .trim();
        context += `Источник (${link}):\n${siteHtml.slice(0, 2000)}...\n\n`;
      } catch (e) { /* ignore */ }
    }
    return context;
  } catch (e) {
    return "Ошибка при поиске: " + e.message;
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", c => body += c);
    req.on("end", () => { try { resolve(JSON.parse(body || "{}")); } catch (e) { reject(e); } });
    req.on("error", reject);
  });
}
function json(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  const pathname = url.pathname;

  // ---------- AUTH ----------
  if (req.method === "POST" && pathname === "/api/auth") {
    try {
      const { username, password, email, action } = await readBody(req);
      if (!username || !password) return json(res, 400, { error: "Введите логин и пароль" });

      if (action === "register") {
        if (!/^[a-zA-Z0-9_]{3,20}$/.test(username))
          return json(res, 400, { error: "Имя: 3–20 символов, латиница/цифры/_" });
        if (Object.prototype.hasOwnProperty.call(users, username))
          return json(res, 400, { error: "Этот Username уже занят" });
        users[username] = { password: hashPass(password), email: email || "", role: "user", limit: 10, blocked: false };
        await saveUsers();
        return json(res, 200, { username, role: "user", limit: 10, blocked: false });
      }

      if (action === "login") {
        const user = Object.prototype.hasOwnProperty.call(users, username) ? users[username] : null;
        if (!user || !checkPass(password, user.password))
          return json(res, 401, { error: "Неверный логин или пароль" });
        // Миграция legacy plaintext
        if (!user.password.includes(":")) {
          user.password = hashPass(password);
          await saveUsers();
        }
        return json(res, 200, { username, role: user.role, limit: user.limit, blocked: user.blocked });
      }
      return json(res, 400, { error: "Неизвестное действие" });
    } catch (e) { return json(res, 400, { error: "Некорректный запрос" }); }
  }

  // ---------- СВОИ ЧАТЫ ----------
  if (req.method === "GET" && pathname === "/api/chats") {
    const auth = requireAuth(req, res);
    if (!auth) return;
    return json(res, 200, allChats[auth.username] || {});
  }

  if (req.method === "POST" && pathname === "/api/sync-chats") {
    const auth = requireAuth(req, res);
    if (!auth) return;
    try {
      const { username, chats } = await readBody(req);
      if (username !== auth.username) return json(res, 403, { error: "Нельзя перезаписать чужие чаты" });
      if (typeof chats !== "object" || chats === null) return json(res, 400, { error: "chats должен быть объектом" });
      allChats[auth.username] = chats;
      await saveChats();
      return json(res, 200, { success: true });
    } catch (e) { return json(res, 400, { error: "Некорректный запрос" }); }
  }

  // ---------- ADMIN ----------
  if (req.method === "GET" && pathname === "/api/admin/users") {
    const auth = requireAuth(req, res, ["admin"]);
    if (!auth) return;
    const safe = {};
    for (const [name, u] of Object.entries(users)) {
      safe[name] = { role: u.role, limit: u.limit, blocked: u.blocked, email: u.email };
    }
    return json(res, 200, safe);
  }

  if (req.method === "GET" && pathname.startsWith("/api/admin/chats/")) {
    const auth = requireAuth(req, res, ["admin"]);
    if (!auth) return;
    const targetUser = decodeURIComponent(pathname.split("/").pop());
    return json(res, 200, allChats[targetUser] || {});
  }

  if (req.method === "POST" && pathname === "/api/admin/update") {
    const auth = requireAuth(req, res, ["admin"]);
    if (!auth) return;
    try {
      const { targetUser, action, value } = await readBody(req);
      if (!Object.prototype.hasOwnProperty.call(users, targetUser)) return json(res, 404, { error: "not found" });
      if (action === "setLimit") users[targetUser].limit = Number(value) || 0;
      if (action === "block") users[targetUser].blocked = !!value;
      if (action === "role" && ["user", "helper", "moderator", "admin"].includes(value)) users[targetUser].role = value;
      await saveUsers();
      return json(res, 200, { success: true });
    } catch (e) { return json(res, 400, { error: "bad request" }); }
  }

  if (req.method === "POST" && pathname === "/api/admin/forge") {
    const auth = requireAuth(req, res, ["admin"]);
    if (!auth) return;
    try {
      const { targetUser, chatId, role, text } = await readBody(req);
      if (!["user", "assistant"].includes(role)) return json(res, 400, { error: "bad role" });
      if (allChats[targetUser] && allChats[targetUser][chatId]) {
        allChats[targetUser][chatId].messages.push({ role, content: String(text || ""), thought: null });
        await saveChats();
      }
      return json(res, 200, { success: true });
    } catch (e) { return json(res, 400, { error: "bad request" }); }
  }

  // ---------- PROXY ----------
  if (req.method === "POST" && pathname === "/api/messages") {
    const auth = requireAuth(req, res);
    if (!auth) return;
    const { user } = auth;
    if (user.role === "user" && user.limit <= 0)
      return json(res, 403, { error: { message: "Закончились сообщения." } });

    try {
      const payload = await readBody(req);

      if (payload.system && payload.system.includes("Поиск в интернете")) {
        const lastMsg = payload.messages?.[payload.messages.length - 1];
        const userMessage = typeof lastMsg?.content === "string"
          ? lastMsg.content
          : (lastMsg?.content?.find?.(c => c.type === "text")?.text || "");
        if (userMessage) {
          const searchContext = await webSearch(userMessage);
          payload.system += `\n\nИспользуй эту информацию для ответа:\n${searchContext}`;
        }
      }

      const controller = new AbortController();
      req.on("close", () => controller.abort());

      const upstream = await fetch(TARGET, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": API_KEY, "anthropic-version": "2023-06-01" },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      if (!upstream.ok) {
        const text = await upstream.text();
        res.writeHead(upstream.status, { "Content-Type": upstream.headers.get("content-type") || "application/json" });
        return res.end(text);
      }

      // Списываем только после успешного старта
      if (user.role === "user") { user.limit -= 1; await saveUsers(); }

      res.writeHead(200, {
        "Content-Type": upstream.headers.get("content-type") || "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      });
      for await (const chunk of upstream.body) { res.write(chunk); }
      res.end();
    } catch (err) {
      if (err.name === "AbortError") return;
      if (!res.headersSent) json(res, 502, { error: { message: "Proxy error: " + err.message } });
      else { try { res.end(); } catch (e) {} }
    }
    return;
  }

  // ---------- STATIC ----------
  if (req.method === "GET" && (pathname === "/" || pathname === "/index.html")) {
    try {
      const html = await readFile(path.join(process.cwd(), "index.html"));
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(html);
    } catch (err) { res.writeHead(500); return res.end("index.html not found"); }
  }

  res.writeHead(404); res.end("Not found");
});

loadData().then(() => { server.listen(PORT, () => console.log(`Server on port ${PORT}`)); });
