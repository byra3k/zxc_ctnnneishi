import http from "node:http";
import { readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";

const PORT = process.env.PORT || 3000;
const TARGET = "https://api.samp.team/v1/messages";
const API_KEY = process.env.API_KEY;
const USERS_FILE = path.join(process.cwd(), "users.json");

// Начальный админ
let users = {
  "byra3k": { password: "lubitel_jivotnih", email: "", isAdmin: true, limit: 9999, blocked: false }
};

async function loadUsers() {
  try {
    await access(USERS_FILE);
    const data = await readFile(USERS_FILE, "utf-8");
    users = JSON.parse(data);
  } catch (e) {
    await saveUsers();
  }
}

async function saveUsers() {
  await writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

const server = http.createServer(async (req, res) => {
  // --- АВТОРИЗАЦИЯ И РЕГИСТРАЦИЯ ---
  if (req.method === "POST" && req.url === "/api/auth") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      const { username, password, email, action } = JSON.parse(body);
      
      if (!username || !password) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Введите логин и пароль" }));
      }

      if (action === "register") {
        if (users[username]) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "Этот Username уже занят" }));
        }
        // Создаем нового пользователя (по умолчанию 10 сообщений)
        users[username] = { password, email: email || "", isAdmin: false, limit: 10, blocked: false };
        await saveUsers();
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ 
          username, isAdmin: false, limit: 10, blocked: false 
        }));
      } 
      
      if (action === "login") {
        const user = users[username];
        if (!user || user.password !== password) {
          res.writeHead(401, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "Неверный логин или пароль" }));
        }
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ 
          username, isAdmin: user.isAdmin, limit: user.limit, blocked: user.blocked
        }));
      }
    });
    return;
  }

  // --- АДМИН ПАНЕЛЬ ---
  if (req.method === "GET" && req.url === "/api/admin/users") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(users));
  }

  if (req.method === "POST" && req.url === "/api/admin/update") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      const { targetUser, action, value } = JSON.parse(body);
      if (users[targetUser]) {
        if (action === "setLimit") users[targetUser].limit = value;
        if (action === "block") users[targetUser].blocked = value;
        await saveUsers();
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true }));
    });
    return;
  }

  // --- ПРОКСИ ЧАТА ---
  if (req.method === "POST" && req.url === "/api/messages") {
    const username = req.headers["x-user"];
    const user = users[username];

    if (!user) {
      res.writeHead(401); return res.end(JSON.stringify({ error: { message: "Пользователь не найден" } }));
    }
    if (user.blocked) {
      res.writeHead(403); return res.end(JSON.stringify({ error: { message: "Вы заблокированы администратором." } }));
    }
    if (!user.isAdmin && user.limit <= 0) {
      res.writeHead(403); return res.end(JSON.stringify({ error: { message: "У вас закончились сообщения. Обратитесь к админу." } }));
    }

    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      try {
        if (!user.isAdmin) {
          user.limit -= 1;
          await saveUsers();
        }

        const upstream = await fetch(TARGET, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json", 
            "x-api-key": API_KEY, 
            "anthropic-version": "2023-06-01" 
          },
          body
        });

        res.writeHead(upstream.status, { 
          "Content-Type": upstream.headers.get("content-type") || "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive"
        });

        for await (const chunk of upstream.body) {
          res.write(chunk);
        }
        res.end();
      } catch (err) {
        res.writeHead(502, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: { message: "Proxy error: " + err.message } }));
      }
    });
    return;
  }

  // --- СТАТИКА ---
  if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
    try {
      const html = await readFile(path.join(process.cwd(), "index.html"));
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
    } catch (err) { res.writeHead(500); res.end("index.html not found"); }
    return;
  }
  
  res.writeHead(404); res.end("Not found");
});

loadUsers().then(() => {
  server.listen(PORT, () => console.log(`Server on port ${PORT}`));
});
