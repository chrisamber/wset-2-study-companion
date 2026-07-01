#!/usr/bin/env node
// Captures a screenshot of one tab of the running app via the Chrome
// DevTools Protocol — no browser-automation dependency, just Node's built-in
// fetch/WebSocket driving a headless Chrome the script launches itself.
//
// Usage: node scripts/capture-screenshot.mjs <url> <tabButtonText|""> <outPath>
// Example: node scripts/capture-screenshot.mjs http://localhost:4123 quiz public/screenshots/quiz.png
// Pass "" for tabButtonText to screenshot the default (Study) tab.
//
// Requires Google Chrome installed at the default macOS path below, and the
// app already served at <url> (e.g. `npm run build && npx next start -p 4123`).

const [, , url, buttonText, outPath] = process.argv;
if (!url || outPath === undefined) {
  console.error('Usage: node scripts/capture-screenshot.mjs <url> <tabButtonText|""> <outPath>');
  process.exit(1);
}

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const DEBUG_PORT = 9333;

const { spawn } = await import("node:child_process");
const fs = await import("node:fs/promises");

const chrome = spawn(CHROME, [
  "--headless=new",
  "--disable-gpu",
  `--remote-debugging-port=${DEBUG_PORT}`,
  "--window-size=1280,832",
  "--hide-scrollbars",
  "about:blank",
]);

async function waitForDebugger() {
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(`http://localhost:${DEBUG_PORT}/json/version`);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error("Chrome debugger never came up");
}

function send(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 1e9);
    const onMessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id === id) {
        ws.removeEventListener("message", onMessage);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      }
    };
    ws.addEventListener("message", onMessage);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

try {
  await waitForDebugger();

  const putRes = await fetch(
    `http://localhost:${DEBUG_PORT}/json/new?${new URLSearchParams({ url })}`,
    { method: "PUT" }
  );
  const target = await putRes.json();

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve);
    ws.addEventListener("error", reject);
  });

  await send(ws, "Page.enable");
  await send(ws, "Runtime.enable");

  const loadFired = new Promise((resolve) => {
    const onMessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === "Page.loadEventFired") {
        ws.removeEventListener("message", onMessage);
        resolve();
      }
    };
    ws.addEventListener("message", onMessage);
  });
  await send(ws, "Page.navigate", { url });
  await loadFired;

  if (buttonText) {
    const clickExpr = `
      (function() {
        const btn = Array.from(document.querySelectorAll("button"))
          .find(b => b.textContent.trim().toLowerCase() === ${JSON.stringify(buttonText)});
        if (!btn) return "not-found";
        btn.click();
        return "clicked";
      })()
    `;

    let clickResult = "not-found";
    for (let i = 0; i < 25; i++) {
      const evalRes = await send(ws, "Runtime.evaluate", { expression: clickExpr });
      clickResult = evalRes.result.value;
      if (clickResult === "clicked") break;
      await new Promise((r) => setTimeout(r, 200));
    }
    if (clickResult !== "clicked") {
      throw new Error("Button never appeared: " + buttonText);
    }
  }

  // Give React a moment to re-render after the click.
  await new Promise((r) => setTimeout(r, 300));

  // The app's root div uses min-h-screen (and the panel wrapper uses
  // flex-1), so both stretch to fill the viewport regardless of content.
  // The last ".max-w-3xl" block (the tab panel itself) isn't stretched, so
  // its bottom reflects actual rendered content height.
  const heightRes = await send(ws, "Runtime.evaluate", {
    expression: `(() => {
      const blocks = document.querySelectorAll(".max-w-3xl");
      const last = blocks[blocks.length - 1];
      return Math.min(900, 20 + last.getBoundingClientRect().bottom);
    })()`,
  });
  const height = heightRes.result.value;

  const { data } = await send(ws, "Page.captureScreenshot", {
    format: "png",
    clip: { x: 0, y: 0, width: 1280, height, scale: 1 },
  });
  await fs.writeFile(outPath, Buffer.from(data, "base64"));
  console.log("wrote", outPath);

  ws.close();
} finally {
  chrome.kill();
}
