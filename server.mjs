import http from "node:http";
import { readFile, writeFile, access } from "node:fs/promises";
import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
import path from "node:path";

const PORT = process.env.PORT || 3000;
const TARGET = "https://api.samp.team/v1/messages";
const API_KEY = process.env.API_KEY;
const USERS_FILE = path.join(process.cwd(), "users.json");
const CHATS_FILE = path.join(process.cwd(), "chats.json");
const TITLE_MODEL = process.env.TITLE_MODEL || "qwen3.8-omni-flash";

let users = { "byra3k": { password: "lubitel_jivotnih", email: "", role: "admin", limit: 9999, blocked: false } };
let allChats = {};

// ---------- ПАРОЛИ ----------
function hashPass(p) {
  const salt = randomBytes(16).toString("hex");
  return salt + ":" + scryptSync(p, salt, 64).toString("hex");
}
function checkPass(p, stored) {
  if (typeof stored !== "string") return false;
  if (!stored.includes(":")) return stored === p;
  const [salt, key] = stored.split(":");
  try { return timingSafeEqual(Buffer.from(key, "hex"), scryptSync(p, salt, 64)); } catch { return false; }
}

// ---------- ДАННЫЕ ----------
async function loadData() {
  try { await access(USERS_FILE); users = JSON.parse(await readFile(USERS_FILE, "utf-8")); } catch { await saveUsers(); }
  try { await access(CHATS_FILE); allChats = JSON.parse(await readFile(CHATS_FILE, "utf-8")); } catch { await saveChats(); }
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

// ---------- TOOLS ----------
const TOOLS = [
  {
    name: "web_search",
    description: "Поиск в интернете через DuckDuckGo. Возвращает заголовки, URL и сниппеты топ-5 результатов. Используй для свежих данных, новостей, актуальных фактов, событий после обучения.",
    input_schema: {
      type: "object",
      properties: { query: { type: "string", description: "Поисковый запрос на естественном языке" } },
      required: ["query"]
    }
  },
  {
    name: "fetch_url",
    description: "Загружает и возвращает текст веб-страницы по URL. Используй для чтения полной версии после web_search или если пользователь дал ссылку.",
    input_schema: {
      type: "object",
      properties: { url: { type: "string", description: "Полный URL (http:// или https://)" } },
      required: ["url"]
    }
  }
];

async function webSearchRaw(query) {
  try {
    const u = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const res = await fetch(u, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" } });
    const html = await res.text();
    const results = [];
    const re = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
    let m;
    while ((m = re.exec(html)) !== null && results.length < 5) {
      let link = m[1];
      if (link.includes("uddg=")) { try { link = decodeURIComponent(link.split("uddg=")[1].split("&")[0]); } catch {} }
      const title = m[2].replace(/<[^>]+>/g, "").trim();
      const snippet = m[3].replace(/<[^>]+>/g, "").trim();
      results.push(`### ${title}\nURL: ${link}\n${snippet}`);
    }
    if (results.length === 0) {
      const lre = /<a class="result__a" href="(.*?)"/g;
      while ((m = lre.exec(html)) !== null && results.length < 5) {
        let link = m[1];
        if (link.includes("uddg=")) { try { link = decodeURIComponent(link.split("uddg=")[1].split("&")[0]); } catch {} }
        results.push(`URL: ${link}`);
      }
    }
    return results.length ? results.join("\n\n") : "Ничего не найдено.";
  } catch (e) { return "Ошибка поиска: " + e.message; }
}

async function fetchUrlRaw(url) {
  try {
    if (!/^https?:\/\//i.test(url)) return "URL должен начинаться с http:// или https://";
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 10000);
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }, signal: ctrl.signal });
    clearTimeout(t);
    let html = await res.text();
    html = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[\s\S]*?<\/nav>/gi, "")
      .replace(/<header[\s\S]*?<\/header>/gi, "")
      .replace(/<footer[\s\S]*?<\/footer>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return html.slice(0, 10000) || "(пустая страница)";
  } catch (e) { return "Ошибка загрузки: " + e.message; }
}

async function executeTool(name, input) {
  if (name === "web_search") return webSearchRaw(input.query || "");
  if (name === "fetch_url") return fetchUrlRaw(input.url || "");
  return "Unknown tool: " + name;
}

// ---------- HTTP UTILS ----------
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

// ---------- СЕРВЕР ----------
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  const pathname = url.pathname;

  // ----- AUTH -----
  if (req.method === "POST" && pathname === "/api/auth") {
    try {
      const { username, password, email, action } = await readBody(req);
      if (!username || !password) return json(res, 400, { error: "Введите логин и пароль" });

      if (action === "register") {
        if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) return json(res, 400, { error: "Имя: 3–20 символов, латиница/цифры/_" });
        if (Object.prototype.hasOwnProperty.call(users, username)) return json(res, 400, { error: "Этот Username уже занят" });
        users[username] = { password: hashPass(password), email: email || "", role: "user", limit: 10, blocked: false };
        await saveUsers();
        return json(res, 200, { username, role: "user", limit: 10, blocked: false });
      }
      if (action === "login") {
        const user = Object.prototype.hasOwnProperty.call(users, username) ? users[username] : null;
        if (!user || !checkPass(password, user.password)) return json(res, 401, { error: "Неверный логин или пароль" });
        if (!user.password.includes(":")) { user.password = hashPass(password); await saveUsers(); }
        return json(res, 200, { username, role: user.role, limit: user.limit, blocked: user.blocked });
      }
      return json(res, 400, { error: "Неизвестное действие" });
    } catch { return json(res, 400, { error: "Некорректный запрос" }); }
  }

  // ----- СВОИ ЧАТЫ -----
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
    } catch { return json(res, 400, { error: "Некорректный запрос" }); }
  }

  // ----- GEN-TITLE (AI-название чата) -----
  if (req.method === "POST" && pathname === "/api/gen-title") {
    const auth = requireAuth(req, res);
    if (!auth) return;
    try {
      const { messages } = await readBody(req);
      if (!Array.isArray(messages) || messages.length < 2) return json(res, 400, { error: "no messages" });

      const brief = messages.slice(0, 4).map(m => {
        const c = typeof m.content === "string" ? m.content : "";
        return `${m.role === "user" ? "U" : "A"}: ${c.slice(0, 400)}`;
      }).join("\n");

      const upstream = await fetch(TARGET, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": API_KEY, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: TITLE_MODEL,
          max_tokens: 40,
          system: "Ты — генератор названий чатов. Отвечай ТОЛЬКО коротким названием (2-5 слов), без кавычек, без точки в конце, на языке диалога.",
          messages: [{ role: "user", content: `Диалог:\n${brief}\n\nНазвание:` }]
        })
      });
      if (!upstream.ok) return json(res, 502, { error: "upstream error" });
      const data = await upstream.json();
      let title = (data.content || []).filter(c => c.type === "text").map(c => c.text).join("").trim();
      title = title.replace(/^["'«»\s]+|["'«»\s.]+$/g, "").slice(0, 60);
      return json(res, 200, { title: title || "Новый чат" });
    } catch (e) { return json(res, 500, { error: e.message }); }
  }

  // ----- ADMIN -----
  if (req.method === "GET" && pathname === "/api/admin/users") {
    const auth = requireAuth(req, res, ["admin"]);
    if (!auth) return;
    const safe = {};
    for (const [name, u] of Object.entries(users)) safe[name] = { role: u.role, limit: u.limit, blocked: u.blocked, email: u.email };
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
    } catch { return json(res, 400, { error: "bad request" }); }
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
    } catch { return json(res, 400, { error: "bad request" }); }
  }

  // ----- MESSAGES (tools loop + SSE) -----
  if (req.method === "POST" && pathname === "/api/messages") {
    const auth = requireAuth(req, res);
    if (!auth) return;
    const { user } = auth;
    if (user.role === "user" && user.limit <= 0) return json(res, 403, { error: { message: "Закончились сообщения." } });

    try {
      const payload = await readBody(req);
      const enableTools = payload.enableTools !== false;

      const messages = [...(payload.messages || [])];
      const controller = new AbortController();
      req.on("close", () => { try { controller.abort(); } catch {} });

      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      });

      let deducted = false;
      const MAX_ITER = 6;

      for (let iteration = 0; iteration < MAX_ITER; iteration++) {
        if (controller.signal.aborted) return;

        const reqBody = {
          model: payload.model,
          max_tokens: payload.max_tokens || 4096,
          messages,
          stream: true
        };
        if (payload.system) reqBody.system = payload.system;
        if (enableTools) reqBody.tools = TOOLS;

        const upstream = await fetch(TARGET, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": API_KEY,
            "anthropic-version": "2023-06-01"
          },
          body: JSON.stringify(reqBody),
          signal: controller.signal
        });

        if (!upstream.ok) {
          const text = await upstream.text();
          res.write(`data: ${JSON.stringify({ type: "error", message: text.slice(0, 500) || `Upstream ${upstream.status}` })}\n\n`);
          res.write("data: [DONE]\n\n");
          return res.end();
        }

        if (!deducted && user.role === "user") {
          user.limit -= 1;
          deducted = true;
          await saveUsers();
        }

        const reader = upstream.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        const toolBlocks = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (controller.signal.aborted) { try { reader.cancel(); } catch {} return; }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop();

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);

              if (parsed.type === "content_block_start" && parsed.content_block?.type === "tool_use") {
                toolBlocks.push({ index: parsed.index, id: parsed.content_block.id, name: parsed.content_block.name, inputJson: "" });
                continue;
              }
              if (parsed.type === "content_block_delta" && parsed.delta?.type === "input_json_delta") {
                const tb = toolBlocks.find(b => b.index === parsed.index);
                if (tb) { tb.inputJson += parsed.delta.partial_json || ""; continue; }
              }
              if (parsed.type === "content_block_delta" && parsed.delta?.text) {
                res.write(`data: ${JSON.stringify(parsed)}\n\n`);
              }
            } catch {}
          }
        }

        if (toolBlocks.length === 0) break;

        const assistantBlocks = [];
        const toolResults = [];
        for (const tb of toolBlocks) {
          let input = {};
          try { input = JSON.parse(tb.inputJson || "{}"); } catch {}
          assistantBlocks.push({ type: "tool_use", id: tb.id, name: tb.name, input });

          res.write(`data: ${JSON.stringify({ type: "tool_use_start", name: tb.name, input })}\n\n`);
          const result = await executeTool(tb.name, input);
          res.write(`data: ${JSON.stringify({ type: "tool_use_done", name: tb.name, preview: String(result).slice(0, 150) })}\n\n`);

          toolResults.push({ type: "tool_result", tool_use_id: tb.id, content: result });
        }

        messages.push({ role: "assistant", content: assistantBlocks });
        messages.push({ role: "user", content: toolResults });
      }

      res.write("data: [DONE]\n\n");
      res.end();
    } catch (err) {
      if (err.name === "AbortError") return;
      try {
        if (!res.headersSent) json(res, 502, { error: { message: "Proxy error: " + err.message } });
        else res.end();
      } catch {}
    }
    return;
  }

  // ----- STATIC -----
  if (req.method === "GET" && (pathname === "/" || pathname === "/index.html")) {
    try {
      const html = await readFile(path.join(process.cwd(), "index.html"));
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(html);
    } catch { res.writeHead(500); return res.end("index.html not found"); }
  }

  res.writeHead(404); res.end("Not found");
});

loadData().then(() => { server.listen(PORT, () => console.log(`Server on port ${PORT}`)); });
