// Start backend/tests/advisor_browser_server.py, then pass a Chromium executable.
import assert from "node:assert/strict";
import { openBrowser, waitUntil } from "./cdp-browser.mjs";

const base = "http://127.0.0.1:8000";
const credentials = await (await fetch(base + "/__test/credentials/admin")).json();
const headers = { Authorization: `Bearer ${credentials.access_token}` };
const sessions = async () => (await (await fetch(base + "/api/live-chat/admin/sessions", { headers })).json()).sessions;
const browser = await openBrowser(process.argv[2], "node_modules/.cache/live-chat-tests");
const waitFor = (page, expression, label) => waitUntil(() => page.evaluate(expression), label);
const sendGuest = async (page, text) => {
  const count = await page.evaluate('document.querySelectorAll(".furniture-chat-message.user").length');
  await page.fill(".furniture-chat-form input", text);
  await page.click('.furniture-chat-form button[type="submit"]');
  await waitFor(page, `document.querySelectorAll('.furniture-chat-message.user').length > ${count}`, "guest message accepted");
};
const resetGuest = async (page) => {
  await page.click('button[aria-label="Cuộc trò chuyện mới"]');
  await waitFor(page, 'document.querySelectorAll(".furniture-chat-message").length === 1 && !document.querySelector(\'button[aria-label="Cuộc trò chuyện mới"]\').disabled', "guest reset");
  await waitUntil(async () => (await sessions()).length === 0, "server session erased");
};

try {
  const guest = await browser.page(base + "/products");
  await waitFor(guest, '!!document.querySelector(".furniture-chat-launcher")', "guest page");
  await guest.click(".furniture-chat-launcher");
  await sendGuest(guest, "Tư vấn phòng ngủ");
  await waitFor(guest, '!!document.querySelector(".furniture-chat-offer h3")', "offline bot response");
  await resetGuest(guest);
  console.log("PASS: guest bot support and reset removes server transcript");

  const admin = await browser.page(base);
  await waitFor(admin, '!!document.querySelector(".furniture-chat-launcher")', "admin origin");
  await admin.evaluate(`localStorage.setItem('access_token', ${JSON.stringify(credentials.access_token)}); localStorage.setItem('user', ${JSON.stringify(JSON.stringify(credentials.user))})`);
  await admin.call("Page.navigate", { url: base + "/admin/chat" });
  await waitFor(admin, '!!document.querySelector(".admin-chat-toggle")', "admin inbox");
  assert.equal(await admin.evaluate('document.querySelector(".admin-chat-toggle").getAttribute("aria-pressed")'), "false");
  await admin.click(".admin-chat-toggle");
  await waitFor(admin, 'document.querySelector(".admin-chat-toggle").classList.contains("online")', "admin presence");
  await sendGuest(guest, "Phòng ngủ của tôi rộng 15m2, cần tư vấn trực tiếp");
  await waitFor(guest, '[...document.querySelectorAll(".furniture-chat-working")].some(node => node.textContent.includes("Đã chuyển tin"))', "waiting for human");
  assert.equal(await guest.evaluate('document.querySelectorAll(".furniture-chat-message.assistant").length'), 1, "Bot must remain silent while admin is online");
  await waitFor(admin, 'document.querySelectorAll(".admin-chat-message.user").length === 1', "admin receives guest");
  await admin.fill(".admin-chat-composer textarea", "Chào bạn, tôi đang tư vấn trực tiếp. Phòng 15m2 nên ưu tiên giường gọn và tủ đứng.");
  await admin.click('.admin-chat-composer button[type="submit"]');
  await waitFor(guest, '[...document.querySelectorAll(".furniture-chat-bubble")].some(node => node.textContent.includes("Phòng 15m2"))', "human reply received");
  assert((await guest.evaluate('document.querySelectorAll(".furniture-chat-sender")[1].textContent')).includes("Tư vấn viên"));
  console.log("PASS: online routes exclusively to admin and human replies reach guest");

  await sendGuest(guest, "Bạn gợi ý cho tôi giường và tủ đầu giường nhé");
  await waitFor(admin, 'document.querySelectorAll(".admin-chat-message.user").length === 2', "second question");
  await admin.click(".admin-chat-composer-footer button");
  await waitFor(admin, 'document.querySelectorAll(".admin-chat-picker-list button").length > 1', "live products picker");
  await admin.evaluate(`(() => {
    const buttons = [...document.querySelectorAll('.admin-chat-picker-list button')];
    buttons.find(node => node.textContent.includes('Giường Ngủ Nhật Bản')).click();
    buttons.find(node => node.textContent.includes('Tủ Đầu Giường')).click();
  })()`);
  await waitFor(admin, 'document.querySelectorAll(".admin-chat-selected-products > span").length === 2', "two selected products");
  await admin.click('.admin-chat-composer button[type="submit"]');
  await waitFor(guest, '!!document.querySelector(".furniture-chat-offer h3")', "human bundle offer");
  await guest.click('.furniture-chat-offer > .furniture-chat-actions button.yes');
  await waitFor(guest, '!!document.querySelector(".furniture-chat-offer-status.added")', "human bundle confirmation");
  assert.equal((await guest.evaluate('JSON.parse(localStorage.getItem("furni_cart"))')).length, 2);
  await admin.screenshot("admin-desktop.png");
  console.log("PASS: admin product bundle reaches guest and adds only after Yes");

  await sendGuest(guest, "Còn phòng khách thì sao?");
  await waitFor(admin, 'document.querySelectorAll(".admin-chat-message.user").length === 3', "pending before leave");
  await admin.click(".admin-chat-toggle");
  await waitFor(guest, '[...document.querySelectorAll(".furniture-chat-sender")].at(-1)?.textContent.includes("Trợ lý tự động")', "bot takeover after toggle off");
  console.log("PASS: turning off presence immediately answers waiting message with bot");

  await admin.click(".admin-chat-toggle");
  await waitFor(admin, 'document.querySelector(".admin-chat-toggle").classList.contains("online")', "presence restored");
  const previousBots = await guest.evaluate('[...document.querySelectorAll(".furniture-chat-sender")].filter(node => node.textContent.includes("Trợ lý tự động")).length');
  await sendGuest(guest, "Tìm sofa dưới 15 triệu");
  await fetch(base + "/__test/expire-presence", { method: "POST" });
  await waitFor(guest, `[...document.querySelectorAll('.furniture-chat-sender')].filter(node => node.textContent.includes('Trợ lý tự động')).length > ${previousBots}`, "expired heartbeat takeover");
  console.log("PASS: heartbeat expiry transfers queued customer message to bot");

  await resetGuest(guest);
  await waitFor(admin, 'document.querySelectorAll(".admin-chat-session").length === 0', "admin copy deleted");
  await sendGuest(guest, "Xin chào");
  await guest.call("Page.reload");
  await waitFor(guest, '!!document.querySelector(".furniture-chat-launcher") && !document.querySelector(".furniture-chat-panel")', "page reload");
  await waitUntil(async () => (await sessions()).length === 0, "reload beacon deletion");
  console.log("PASS: refresh clears both browser and admin transcript");

  const customerCredentials = await (await fetch(base + "/__test/credentials/customer")).json();
  await guest.evaluate(`localStorage.setItem('access_token', ${JSON.stringify(customerCredentials.access_token)}); localStorage.setItem('user', ${JSON.stringify(JSON.stringify(customerCredentials.user))})`);
  await guest.call("Page.reload");
  await waitFor(guest, '!!document.querySelector(".user-button")', "signed customer");
  await guest.click(".furniture-chat-launcher");
  await sendGuest(guest, "Tôi cần tư vấn");
  await guest.click(".user-button");
  await guest.click(".dropdown-item.logout");
  await waitUntil(async () => (await sessions()).length === 0, "logout deletion");
  await waitFor(guest, '!!document.querySelector(".furniture-chat-launcher") && !document.querySelector(".furniture-chat-panel")', "logged out page");
  console.log("PASS: customer logout removes the entire live session");

  await guest.click(".furniture-chat-launcher");
  await sendGuest(guest, "Tư vấn phòng ngủ");
  await guest.call("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  const bounds = await guest.evaluate('(() => { const rect = document.querySelector(".furniture-chat-panel").getBoundingClientRect(); return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom }; })()');
  assert(bounds.left >= 0 && bounds.right <= 390 && bounds.top >= 0 && bounds.bottom <= 844, JSON.stringify(bounds));
  await guest.screenshot("customer-mobile.png");
  assert.deepEqual(await guest.evaluate('Object.keys(localStorage).filter(key => /chat/i.test(key))'), []);
  await guest.close();
  await waitUntil(async () => (await sessions()).length === 0, "closed tab deletion");
  console.log("PASS: mobile, no chat in localStorage and tab-close deletion");

  await admin.call("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await waitFor(admin, 'document.querySelector(".admin-sidebar").getBoundingClientRect().right <= 1', "mobile sidebar collapsed");
  const adminBounds = await admin.evaluate('(() => { const rect = document.querySelector(".admin-chat-workspace").getBoundingClientRect(); return { left: rect.left, right: rect.right }; })()');
  assert(adminBounds.left >= 0 && adminBounds.right <= 390, JSON.stringify(adminBounds));
  await admin.screenshot("admin-mobile.png");
  assert.deepEqual(browser.errors, [], "No uncaught browser exceptions");
  console.log("PASS: admin mobile and no uncaught browser errors");
} finally { await browser.close(); }
