import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

export async function waitUntil(check, label, timeout = 15000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await check()) return;
    await new Promise((done) => setTimeout(done, 100));
  }
  throw new Error(`Timed out: ${label}`);
}

export async function openBrowser(executable, output) {
  const artifacts = resolve(output);
  mkdirSync(artifacts, { recursive: true });
  const child = spawn(executable, ["--headless", "--disable-gpu", "--no-first-run", "--remote-debugging-port=9332",
    `--user-data-dir=${resolve(artifacts, `profile-${Date.now()}`)}`, "about:blank"], { windowsHide: true, stdio: "ignore" });
  await waitUntil(async () => { try { return (await fetch("http://127.0.0.1:9332/json/version")).ok; } catch { return false; } }, "Chromium startup");
  const info = await (await fetch("http://127.0.0.1:9332/json/version")).json();
  const socket = new WebSocket(info.webSocketDebuggerUrl);
  await new Promise((done) => socket.addEventListener("open", done, { once: true }));
  let id = 0;
  const pending = new Map();
  const errors = [];
  const call = (method, params = {}, sessionId) => new Promise((resolveCall, reject) => {
    const current = ++id;
    pending.set(current, { resolveCall, reject });
    socket.send(JSON.stringify({ id: current, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    if (message.id) {
      const request = pending.get(message.id); pending.delete(message.id);
      if (message.error) request?.reject(new Error(JSON.stringify(message.error)));
      else request?.resolveCall(message.result);
    } else if (message.method === "Runtime.exceptionThrown") errors.push(message.params.exceptionDetails);
  });
  return {
    errors,
    async page(url) {
      const { browserContextId } = await call("Target.createBrowserContext");
      const { targetId } = await call("Target.createTarget", { url: "about:blank", browserContextId });
      const { sessionId } = await call("Target.attachToTarget", { targetId, flatten: true });
      const pageCall = (method, params) => call(method, params, sessionId);
      const page = {
        call: pageCall,
        async evaluate(expression) {
          const result = await pageCall("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
          if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
          return result.result.value;
        },
        async click(selector) { return page.evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`); },
        async fill(selector, value) {
          await page.evaluate(`(() => {
            const element = document.querySelector(${JSON.stringify(selector)});
            Object.getOwnPropertyDescriptor(element.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, 'value').set.call(element, ${JSON.stringify(value)});
            element.dispatchEvent(new Event('input', { bubbles: true }));
          })()`);
        },
        async screenshot(name) {
          const result = await pageCall("Page.captureScreenshot", { format: "png" });
          writeFileSync(resolve(artifacts, name), Buffer.from(result.data, "base64"));
        },
        async close() { await call("Target.closeTarget", { targetId }); },
      };
      await pageCall("Runtime.enable"); await pageCall("Page.enable");
      await pageCall("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
      await pageCall("Page.navigate", { url });
      return page;
    },
    async close() { if (socket.readyState === WebSocket.OPEN) await call("Browser.close").catch(() => {}); socket.close(); child.kill(); },
  };
}
