import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const rootDir = resolve(process.cwd());
const distDir = resolve(rootDir, "dist");

recreateDirectory(distDir);

copyIntoDist("index.html");
copyIntoDist("src");
copyIntoDist("data");

console.log("NewsBox Pages build complete:", distDir);

function recreateDirectory(targetPath) {
  rmSync(targetPath, { force: true, recursive: true });
  mkdirSync(targetPath, { recursive: true });
}

function copyIntoDist(relativePath) {
  const sourcePath = resolve(rootDir, relativePath);
  const destinationPath = resolve(distDir, relativePath);

  if (!existsSync(sourcePath)) {
    throw new Error(`Missing required path for Pages build: ${relativePath}`);
  }

  cpSync(sourcePath, destinationPath, { recursive: true });
}
