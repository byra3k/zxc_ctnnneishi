import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";

const PORT = process.env.PORT || 3000;
const TARGET = "https://api.samp.team/v1/messages";
const API_KEY = process.env.API_KEY; 

const server = http.createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/api/messages") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      try {
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

server.listen(PORT, () => console.log(`Server on port ${PORT}`));
