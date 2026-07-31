import fs from "node:fs";
import path from "node:path";

const root = path.join(process.cwd(), "content");

export function readJson(name, fallback = []) {
  const file = path.join(root, name);
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function writeJson(name, data) {
  const file = path.join(root, name);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}
