// UI screenshots via Chrome DevTools (no npm deps). Needs google-chrome and Node 22.
// usage: node scripts/qa/shot.mjs <outDir> <jwt|-> <light|dark> <width> <path>...
import { spawn } from "node:child_process";
import fs from "node:fs";

const [outDir, token, scheme, width, ...paths] = process.argv.slice(2);
const port = 9333 + Math.floor(Math.random() * 500);
const chrome = spawn("google-chrome", ["--headless=new", "--disable-gpu", "--hide-scrollbars", `--remote-debugging-port=${port}`, `--user-data-dir=/tmp/yt-cdp-${port}`, "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let target;
for (let i = 0; i < 50 && !target; i++) {
  try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === "page"); } catch {}
  await sleep(200);
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pending = new Map();
const logs = [];
ws.onmessage = (m) => {
  const d = JSON.parse(m.data);
  if (d.id && pending.has(d.id)) { pending.get(d.id)(d.result ?? d.error); pending.delete(d.id); }
  else if (d.method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(d.params.type)) logs.push(d.params.args.map((a) => a.value ?? a.description).join(" ").slice(0, 300));
  else if (d.method === "Runtime.exceptionThrown") logs.push("EXC " + (d.params.exceptionDetails.exception?.description ?? d.params.exceptionDetails.text).slice(0, 300));
};
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });

await send("Runtime.enable");
await send("Page.enable");
const w = Number(width);
const h = w < 600 ? 900 : 1000;
const metrics = (height) => send("Emulation.setDeviceMetricsOverride", { width: w, height, deviceScaleFactor: 1, mobile: w < 600 });
await metrics(h);
await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: scheme }] });
if (token !== "-") await send("Network.setCookie", { name: "yt_token", value: token, domain: "localhost", path: "/", httpOnly: true });

fs.mkdirSync(outDir, { recursive: true });
for (const p of paths) {
  logs.length = 0;
  await send("Page.navigate", { url: `http://localhost:3000${p}` });
  await sleep(4500);
  const { result } = await send("Runtime.evaluate", { expression: "Math.min(document.documentElement.scrollHeight, 4000)" });
  await metrics(Math.max(h, result.value));
  await sleep(500);
  const shot = await send("Page.captureScreenshot", { format: "png" });
  const name = `${outDir}/${scheme}-${w}-${p.replace(/[^a-z0-9]+/gi, "_") || "root"}.png`;
  fs.writeFileSync(name, Buffer.from(shot.data, "base64"));
  const { result: url } = await send("Runtime.evaluate", { expression: "location.pathname" });
  console.log(name.split("/").pop(), "→", url.value, logs.length ? "| console: " + logs.join(" || ") : "");
  await metrics(h);
}
chrome.kill();
process.exit(0);
