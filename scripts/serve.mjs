import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { createServer } from "node:http";

const rootDir = resolve(process.cwd());
const port = Number(process.env.PORT || 4173);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
};

const server = createServer((request, response) => {
  const requestUrl = new URL(request.url || "/", `http://${request.headers.host}`);
  const pathname = decodeURIComponent(requestUrl.pathname);
  const candidatePath = pathname === "/" ? "/index.html" : pathname;
  const filePath = resolveSafePath(candidatePath);

  if (!filePath) {
    respondText(response, 403, "Forbidden");
    return;
  }

  let finalPath = filePath;

  if (!existsSync(finalPath)) {
    respondText(response, 404, "Not Found");
    return;
  }

  if (statSync(finalPath).isDirectory()) {
    finalPath = join(finalPath, "index.html");

    if (!existsSync(finalPath)) {
      respondText(response, 404, "Not Found");
      return;
    }
  }

  const extension = extname(finalPath).toLowerCase();
  response.writeHead(200, {
    "Cache-Control": "no-store",
    "Content-Type": mimeTypes[extension] || "application/octet-stream",
  });

  createReadStream(finalPath).pipe(response);
});

server.listen(port, () => {
  console.log(`NewsBox preview server is running at http://127.0.0.1:${port}`);
});

server.on("error", (error) => {
  console.error("Failed to start preview server:", error);
  process.exitCode = 1;
});

function resolveSafePath(pathname) {
  const normalized = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  const absolutePath = resolve(rootDir, `.${normalized}`);

  if (!absolutePath.startsWith(rootDir)) {
    return null;
  }

  return absolutePath;
}

function respondText(response, statusCode, message) {
  response.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
  });
  response.end(message);
}
