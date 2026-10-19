// Real Chromium integration checks without adding a package dependency.
// Run the isolated backend/tests/advisor_browser_server.py first on port 8000.
// node tests/furniture-chat.browser.mjs <absolute path to chrome.exe>
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const base = "http://127.0.0.1:8000";
const browserPath = process.argv[2];
assert(browserPath, "Pass the path to a local Chromium executable");
const artifacts = resolve("node_modules/.cache/furniture-chat-tests");
mkdirSync(artifacts, { recursive: true });
const browser = spawn(browserPath, ["--headless", "--disable-gpu", "--no-first-run", "--remote-debugging-port=9331",
  `--user-data-dir=${resolve(artifacts, `profile-${Date.now()}`)}`, "about:blank"], { windowsHide: true, stdio: "ignore" });
let socket;
let sequence = 0;
const pending = new Map();
const exceptions = [];
const wait = async (fn, label, timeout = 12000) => {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await fn()) return;
    await new Promise((done) => setTimeout(done, 100));
  }
  throw new Error(`Timed out: ${label}`);
};
const call = (method, params = {}) => new Promise((resolveCall, reject) => {
  const id = ++sequence;
  pending.set(id, { resolveCall, reject });
  socket.send(JSON.stringify({ id, method, params }));
});
const evaluate = async (expression) => {
  const result = await call("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
};
const click = (selector) => evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
const cart = () => evaluate('JSON.parse(localStorage.getItem("furni_cart") || "[]")');
const send = async (text) => {
  const count = await evaluate('document.querySelectorAll(".furniture-chat-message.assistant").length');
  await evaluate(`(() => {
    const input = document.querySelector('.furniture-chat-form input');
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, ${JSON.stringify(text)});
    input.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
  await click('.furniture-chat-form button[type="submit"]');
  await wait(() => evaluate(`document.querySelectorAll('.furniture-chat-message.assistant').length > ${count}`), "advisor response");
};
const clear = async () => {
  await evaluate('localStorage.removeItem("furni_cart")');
  await call("Page.navigate", { url: base + "/products" });
  await wait(() => evaluate('!!document.querySelector(".furniture-chat-launcher") && !document.querySelector(".furniture-chat-panel")'), "fresh page");
  await click(".furniture-chat-launcher");
};
const mainActions = '.furniture-chat-offer > .furniture-chat-actions:not(.compact)';
const changeProduct = (data) => fetch(base + "/__test/product", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });

try {
  await wait(async () => { try { return (await fetch("http://127.0.0.1:9331/json/version")).ok; } catch { return false; } }, "Chromium startup");
  const target = await (await fetch("http://127.0.0.1:9331/json/new?about:blank", { method: "PUT" })).json();
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((done) => socket.addEventListener("open", done, { once: true }));
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    if (message.id) {
      const request = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) request?.reject(new Error(JSON.stringify(message.error)));
      else request?.resolveCall(message.result);
    } else if (message.method === "Runtime.exceptionThrown") exceptions.push(message.params.exceptionDetails);
  });
  await call("Runtime.enable");
  await call("Page.enable");
  await call("Network.enable");
  await call("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await call("Page.navigate", { url: base });
  await wait(() => evaluate('!!document.querySelector(".furniture-chat-launcher")'), "storefront");
  await click(".furniture-chat-launcher");
  await send("Phòng ngủ nên có những món gì?");
  assert(await evaluate('!!document.querySelector(".furniture-chat-offer h3")'));
  await click(mainActions + ' button:not(.yes)');
  assert.deepEqual(await cart(), [], "No must never add products");
  console.log("PASS: decline bundle leaves cart unchanged");

  await click('button[aria-label="Cuộc trò chuyện mới"]');
  await wait(() => evaluate('document.querySelectorAll(".furniture-chat-message").length === 1 && !document.querySelector(\'button[aria-label="Cuộc trò chuyện mới"]\').disabled'), "chat reset");
  await send("Tư vấn phòng ngủ ngân sách 30 triệu");
  const expected = await evaluate('document.querySelectorAll(".furniture-chat-offer .furniture-chat-product").length');
  await evaluate(`(() => { const button = document.querySelector(${JSON.stringify(mainActions + " button.yes")}); button.click(); button.click(); })()`);
  await wait(() => evaluate('!!document.querySelector(".furniture-chat-offer-status.added")'), "bundle added");
  const added = await cart();
  assert.equal(added.length, expected);
  assert(added.every((item) => item.quantity === 1), "Double click must not duplicate products");
  assert(added.reduce((sum, item) => sum + item.quantity * item.product.price, 0) <= 30_000_000);
  console.log("PASS: entire bundle, budget and double-click protection");
  await click(".furniture-chat-product a");
  await wait(() => evaluate('location.pathname.startsWith("/products/")'), "product navigation");
  assert(await evaluate('document.querySelectorAll(".furniture-chat-message").length > 1'));
  await click(".furniture-chat-cart");
  await wait(() => evaluate('location.pathname === "/cart"'), "cart navigation");
  assert.equal((await cart()).length, expected);
  console.log("PASS: chat and cart persist across customer pages");

  await clear();
  await send("Tìm sofa dưới 15 triệu");
  await click(mainActions + " button:not(.yes)");
  assert.deepEqual(await cart(), []);
  const nextYes = await evaluate(`(() => { const buttons = [...document.querySelectorAll(${JSON.stringify(mainActions + " button.yes")})]; buttons[0].click(); return buttons.length; })()`);
  assert(nextYes > 0);
  await wait(() => evaluate('!!document.querySelector(".furniture-chat-offer-status.added")'), "single added");
  assert.equal((await cart()).length, 1);
  console.log("PASS: single-item Yes and No");

  await clear();
  await send("Tìm giường ngủ");
  const productId = await evaluate('Number(document.querySelector(".furniture-chat-product a").getAttribute("href").split("/").pop())');
  await changeProduct({ product_id: productId, price: 12345678 });
  await click(mainActions + " button.yes");
  await wait(() => evaluate('[...document.querySelectorAll(".furniture-chat-error")].some(node => node.textContent.includes("Giá vừa thay đổi"))'), "price reconfirmation");
  assert.deepEqual(await cart(), []);
  assert((await evaluate('document.querySelector(".furniture-chat-product strong").textContent')).includes("12.345.678"));
  await click(mainActions + " button.yes");
  await wait(() => evaluate('!!document.querySelector(".furniture-chat-offer-status.added")'), "new price accepted");
  assert.equal((await cart())[0].product.price, 12345678);
  console.log("PASS: changed price requires fresh confirmation");

  await clear();
  await send("Tư vấn phòng ngủ");
  const soldOutId = await evaluate('Number(document.querySelector(".furniture-chat-product a").getAttribute("href").split("/").pop())');
  await changeProduct({ product_id: soldOutId, stock_quantity: 0 });
  await click(mainActions + " button.yes");
  await wait(() => evaluate('[...document.querySelectorAll(".furniture-chat-error")].some(node => node.textContent.includes("Chưa thêm"))'), "stock rejection");
  assert.deepEqual(await cart(), [], "A failed bundle must not add any items");
  console.log("PASS: sold-out bundle is rejected atomically");

  await clear();
  await send("Tư vấn phòng khách");
  await click('.furniture-chat-actions.compact button.yes');
  await wait(() => evaluate('!!document.querySelector(".furniture-chat-actions.compact .added")'), "individual member added");
  assert.equal((await cart()).length, 1);
  assert(await evaluate(`!!document.querySelector(${JSON.stringify(mainActions + " .expired")})`));
  const screenshot = await call("Page.captureScreenshot", { format: "png" });
  writeFileSync(resolve(artifacts, "desktop.png"), Buffer.from(screenshot.data, "base64"));
  console.log("PASS: selecting a bundle member closes overlapping whole-bundle action");

  await call("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await clear();
  await send("Tư vấn phòng ngủ");
  const bounds = await evaluate('(() => { const r = document.querySelector(".furniture-chat-panel").getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: innerWidth, height: innerHeight }; })()');
  assert(bounds.left >= 0 && bounds.top >= 0 && bounds.right <= 390 && bounds.bottom <= 844, JSON.stringify(bounds));
  const mobile = await call("Page.captureScreenshot", { format: "png" });
  writeFileSync(resolve(artifacts, "mobile.png"), Buffer.from(mobile.data, "base64"));
  await evaluate('document.querySelector(".furniture-chat-form input").dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))');
  assert(!(await evaluate('!!document.querySelector(".furniture-chat-panel")')));
  assert.deepEqual(exceptions, [], "No uncaught browser errors");
  console.log("PASS: mobile layout, Escape and no runtime errors");
  console.log(`Screenshots: ${artifacts}`);
} finally {
  if (socket?.readyState === WebSocket.OPEN) await call("Browser.close").catch(() => {});
  socket?.close();
  browser.kill();
}
