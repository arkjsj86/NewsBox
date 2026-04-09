import { cpSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const rootDir = resolve(process.cwd());
const outputDirName = process.env.NEWSBOX_BUILD_DIR?.trim() || "dist";
const distDir = resolve(rootDir, outputDirName);

ensureDirectory(distDir);

copyIntoDist("index.html");
copyIntoDist("src");
copyIntoDist("data");

console.log("NewsBox Pages build complete:", distDir);

function ensureDirectory(targetPath) {
  mkdirSync(targetPath, { recursive: true });
}

function copyIntoDist(relativePath) {
  const sourcePath = resolve(rootDir, relativePath);
  const destinationPath = resolve(distDir, relativePath);

  if (!existsSync(sourcePath)) {
    throw new Error(`Missing required path for Pages build: ${relativePath}`);
  }

  cpSync(sourcePath, destinationPath, { force: true, recursive: true });
}
