import http from "node:http";
import { readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";

const PORT = process.env.PORT || 3000;
const TARGET = "https://api.samp.team/v1/messages";
const API_KEY = process.env.API_KEY;
const USERS_FILE = path.join(process.cwd(), "users.json");
const CHATS_FILE = path.join(process.cwd(), "chats.json");

let users = {
  "byra3k": { password: "lubitel_jivotnih", email: "", role: "admin", limit: 9999, blocked: false }
};
let allChats = {}; // { username: { chatId: { title, messages } } }

async function loadData() {
  try { await access(USERS_FILE); users = JSON.parse(await readFile(USERS_FILE, "utf-8")); } catch (e) { await saveUsers(); }
  try { await access(CHATS_FILE); allChats = JSON.parse(await readFile(CHATS_FILE, "utf-8")); } catch (e) { await saveChats(); }
}
async function saveUsers() { await writeFile(USERS_FILE, JSON.stringify(users, null, 2)); }
async function saveChats() { await writeFile(CHATS_FILE, JSON.stringify(allChats, null, 2)); }

const server = http.createServer(async (req, res) => {
  // --- АВТОРИЗАЦИЯ ---
  if (req.method === "POST" && req.url === "/api/auth") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      const { username, password, email, action } = JSON.parse(body);
      if (!username || !password) { res.writeHead(400); return res.end(JSON.stringify({ error: "Введите логин и пароль" })); }

      if (action === "register") {
        if (users[username]) { res.writeHead(400); return res.end(JSON.stringify({ error: "Этот Username уже занят" })); }
        users[username] = { password, email: email || "", role: "user", limit: 10, blocked: false };
        await saveUsers();
        res.writeHead(200); return res.end(JSON.stringify({ username, role: "user", limit: 10, blocked: false }));
      } 
      if (action === "login") {
        const user = users[username];
        if (!user || user.password !== password) { res.writeHead(401); return res.end(JSON.stringify({ error: "Неверный логин или пароль" })); }
        res.writeHead(200); return res.end(JSON.stringify({ username, role: user.role, limit: user.limit, blocked: user.blocked }));
      }
    });
    return;
  }

  // --- СИНХРОНИЗАЦИЯ ЧАТОВ (Сохраняем переписку на сервере) ---
  if (req.method === "POST" && req.url === "/api/sync-chats") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      const { username, chats } = JSON.parse(body);
      allChats[username] = chats;
      await saveChats();
      res.writeHead(200); res.end(JSON.stringify({ success: true }));
    });
    return;
  }

  // --- АДМИН ПАНЕЛЬ ---
  if (req.method === "GET" && req.url === "/api/admin/users") {
    res.writeHead(200); return res.end(JSON.stringify(users));
  }
  
  if (req.method === "GET" && req.url.startsWith("/api/admin/chats/")) {
    const targetUser = req.url.split("/").pop();
    res.writeHead(200); return res.end(JSON.stringify(allChats[targetUser] || {}));
  }

  if (req.method === "POST" && req.url === "/api/admin/update") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      const { targetUser, action, value } = JSON.parse(body);
      if (users[targetUser]) {
        if (action === "setLimit") users[targetUser].limit = value;
        if (action === "block") users[targetUser].blocked = value;
        if (action === "role") users[targetUser].role = value;
        await saveUsers();
      }
      res.writeHead(200); res.end(JSON.stringify({ success: true }));
    });
    return;
  }

  // --- ПОДДЕЛКА СООБЩЕНИЙ (ФОРЖ) ---
  if (req.method === "POST" && req.url === "/api/admin/forge") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      const { targetUser, chatId, role, text } = JSON.parse(body);
      if (allChats[targetUser] && allChats[targetUser][chatId]) {
        allChats[targetUser][chatId].messages.push({ role, content: text, thought: null });
        await saveChats();
      }
      res.writeHead(200); res.end(JSON.stringify({ success: true }));
    });
    return;
  }

  // --- ПРОКСИ ЧАТА ---
  if (req.method === "POST" && req.url === "/api/messages") {
    const username = req.headers["x-user"];
    const user = users[username];

    if (!user || user.blocked) { res.writeHead(403); return res.end(JSON.stringify({ error: { message: "Доступ запрещен" } })); }
    if (user.role === "user" && user.limit <= 0) { res.writeHead(403); return res.end(JSON.stringify({ error: { message: "Закончились сообщения." } })); }

    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      try {
        if (user.role === "user") { user.limit -= 1; await saveUsers(); }

        const controller = new AbortController();
        req.on("close", () => controller.abort());

        const upstream = await fetch(TARGET, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-api-key": API_KEY, "anthropic-version": "2023-06-01" },
          body, signal: controller.signal
        });

        res.writeHead(upstream.status, { "Content-Type": upstream.headers.get("content-type") || "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" });
        for await (const chunk of upstream.body) { res.write(chunk); }
        res.end();
      } catch (err) {
        if (err.name === 'AbortError') return;
        res.writeHead(502); res.end(JSON.stringify({ error: { message: "Proxy error" } }));
      }
    });
    return;
  }

  // --- СТАТИКА ---
  if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
    try {
      const html = await readFile(path.join(process.cwd(), "index.html"));
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }); res.end(html);
    } catch (err) { res.writeHead(500); res.end("index.html not found"); }
    return;
  }
  
  res.writeHead(404); res.end("Not found");
});

loadData().then(() => { server.listen(PORT, () => console.log(`Server on port ${PORT}`)); });
