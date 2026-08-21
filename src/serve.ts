/**
 * Minimal static server for local preview of dist/ (production is Cloudflare Pages).
 * Writes its own PID to .server.pid so `make stop` can kill the right process.
 */
import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const PORT = Number(process.env.PORT ?? 8788);

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
    let filePath = path.normalize(path.join(DIST, decodeURIComponent(url.pathname)));
    if (!filePath.startsWith(DIST)) {
      res.writeHead(403).end("Forbidden");
      return;
    }
    if (existsSync(filePath) && statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }
    if (!existsSync(filePath)) {
      res.writeHead(404, { "content-type": "text/html; charset=utf-8" });
      res.end("<h1>404</h1><p>This volume is not on the shelf. <a href=\"/\">Back to the shop</a>.</p>");
      return;
    }
    const body = await readFile(filePath);
    res.writeHead(200, {
      "content-type": MIME[path.extname(filePath).toLowerCase()] ?? "application/octet-stream",
      "cache-control": "no-cache",
    });
    res.end(body);
  } catch (err) {
    res.writeHead(500).end("Internal error");
    console.error(err);
  }
});

server.listen(PORT, async () => {
  await writeFile(path.join(ROOT, ".server.pid"), String(process.pid), "utf8");
  console.log(`Causeway Books open at http://localhost:${PORT}`);
});
