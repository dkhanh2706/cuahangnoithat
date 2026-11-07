// Build with VITE_API_URL=http://127.0.0.1:8011 and run the isolated fixture server on 8011.
import assert from "node:assert/strict";
import { openBrowser, waitUntil } from "./cdp-browser.mjs";

const base = "http://127.0.0.1:8011";
const browser = await openBrowser(process.argv[2], "node_modules/.cache/store-completion-tests");
const wait = (page, expression, label) => waitUntil(() => page.evaluate(expression), label);
const credentials = async role => (await fetch(`${base}/__test/credentials/${role}`)).json();
const adminCredentials = await credentials("admin");
const customerCredentials = await credentials("customer");
const request = async (path, options = {}, token = adminCredentials.access_token) => {
  const response = await fetch(base + path, { ...options, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...options.headers } });
  assert.ok(response.ok, `${path}: ${response.status} ${await response.clone().text()}`);
  return response.status === 204 ? null : response.json();
};
const signIn = async (page, auth) => page.evaluate(`localStorage.setItem('access_token', ${JSON.stringify(auth.access_token)}); localStorage.setItem('user', ${JSON.stringify(JSON.stringify(auth.user))});`);
const chooseAction = async (page, text) => {
  await page.evaluate(`[...document.querySelectorAll('.order-admin-actions button')].find(button => button.textContent.includes(${JSON.stringify(text)})).click()`);
  await wait(page, "!!document.querySelector('.store-admin-confirm')", "confirmation shown");
  await page.click(".store-admin-confirm button");
  await wait(page, "!document.querySelector('.store-admin-confirm')", "status saved");
};

try {
  const customer = await browser.page(base);
  await wait(customer, "!!document.querySelector('.brand')", "store loaded");
  await signIn(customer, customerCredentials);
  await customer.call("Page.navigate", { url: base + "/collections/phong-khach-bac-au" });
  await wait(customer, "document.querySelectorAll('.coll-product-card').length > 0", "real collection products loaded");
  const firstId = await customer.evaluate("Number(document.querySelector('.coll-product-card a').getAttribute('href').split('/').pop())");
  assert.ok(firstId >= 101, "collection must use fixture database IDs, not mock IDs");
  const before = await request(`/__test/product-state/${firstId}`);
  await customer.click(".coll-product-card .quick-cart-btn");
  await wait(customer, "JSON.parse(localStorage.getItem('furni_cart') || '[]').length === 1", "collection selection added");
  await customer.call("Page.navigate", { url: base + "/cart" });
  await wait(customer, "!!document.querySelector('.checkout-shipping-form')", "checkout ready");
  await customer.fill('input[autocomplete="name"]', "Khach bao cao");
  await customer.fill('input[autocomplete="tel"]', "0901234567");
  await customer.fill('textarea[autocomplete="street-address"]', "123 Nguyen Trai, Ha Noi");
  await customer.click('.checkout-shipping-form button[type="submit"]');
  await wait(customer, "location.pathname === '/orders' && !!document.querySelector('.order-card')", "COD order saved and history displayed");
  const code = await customer.evaluate("document.querySelector('.order-card strong').textContent");
  assert.ok(code.startsWith("CHNT-"));
  assert.equal((await request(`/__test/product-state/${firstId}`)).stock_quantity, before.stock_quantity - 1);
  assert.equal(await customer.evaluate("!!document.querySelector('.order-comment')"), false);
  console.log("PASS: real collection ID → cart → COD order → database stock decreases → pending history");

  const admin = await browser.page(base);
  await wait(admin, "!!document.querySelector('.brand')", "admin context ready");
  await signIn(admin, adminCredentials);
  await admin.call("Page.navigate", { url: base + "/admin/orders" });
  await wait(admin, "document.querySelectorAll('.store-admin-table tbody tr button').length > 0", "admin order list");
  assert.ok(await admin.evaluate(`document.body.textContent.includes(${JSON.stringify(code)})`));
  await admin.click(".store-admin-table tbody tr button");
  await wait(admin, "!!document.querySelector('.order-admin-detail')", "order details");
  await chooseAction(admin, "Xác nhận đơn");
  await chooseAction(admin, "Bắt đầu giao hàng");
  await chooseAction(admin, "Hoàn tất");
  await wait(admin, "document.querySelector('.order-admin-detail').textContent.includes('Đã thanh toán')", "delivery and COD collection recorded");
  await admin.screenshot("orders-desktop.png");
  await customer.evaluate("[...document.querySelectorAll('button')].find(button=>button.textContent.includes('Cập nhật trạng thái')).click()");
  await wait(customer, "!!document.querySelector('.order-comment')", "customer receives completed order status");
  await customer.click(".order-comment");
  await customer.fill(".order-review-form textarea", "San pham dung mo ta, giao hang tot.");
  await customer.click('.order-review-form button:not([type="button"])');
  await wait(customer, "!!document.querySelector('.order-existing-review')", "customer review persisted");
  console.log("PASS: admin confirms → ships → completes COD → customer sees paid order and posts review");

  const guest = await browser.page(base + "/policies/shipping");
  await wait(guest, "!!document.querySelector('.policy-page h1')", "shipping policy page");
  await guest.fill(".newsletter-form input[type=email]", "browser-report@example.com");
  assert.equal(await guest.evaluate("document.querySelector('.newsletter-submit-btn').disabled"), true);
  await guest.click(".newsletter-consent input");
  await guest.click(".newsletter-submit-btn");
  await wait(guest, "!!document.querySelector('.newsletter-feedback[role=status]')", "newsletter persisted");
  await admin.call("Page.navigate", { url: base + "/admin/subscribers" });
  await wait(admin, "document.body.textContent.includes('browser-report@example.com')", "admin sees persisted subscription");
  await guest.click('a[href="/policies/returns"]');
  await wait(guest, "location.pathname === '/policies/returns' && !!document.querySelector('.policy-page article')", "policy navigation works");
  console.log("PASS: newsletter requires consent, persists email, appears for admin; footer policy links work");

  const stockBeforeCancel = (await request(`/__test/product-state/${firstId}`)).stock_quantity;
  const cancellable = await request("/api/orders", { method: "POST", body: JSON.stringify({ items: [{ product_id: firstId, quantity: 1 }], receiver_name: "Cancel test", receiver_phone: "0901234567", shipping_address: "Ha Noi" }) }, customerCredentials.access_token);
  for (let i = 0; i < 2; i++) await request(`/api/admin/orders/${cancellable.id}/status`, { method: "PATCH", body: JSON.stringify({ status: "CANCELLED" }) });
  assert.equal((await request(`/__test/product-state/${firstId}`)).stock_quantity, stockBeforeCancel);
  console.log("PASS: repeated cancellation restores stock exactly once");

  await customer.call("Page.navigate", { url: base + "/collections/phong-khach-bac-au" });
  await wait(customer, "document.querySelectorAll('.coll-product-card').length > 0", "collection ready for price change");
  await request("/__test/product", { method: "POST", body: JSON.stringify({ product_id: firstId, price: Number(before.price) + 12345 }) });
  await customer.click(".coll-product-card .quick-cart-btn");
  await wait(customer, `document.querySelector('.coll-product-card .current-price')?.textContent.replace(/[^0-9]/g, '') === '${Number(before.price) + 12345}'`, "changed price refreshed");
  assert.equal(await customer.evaluate("JSON.parse(localStorage.getItem('furni_cart') || '[]').length"), 0, "changed price requires a second explicit click");
  await customer.click(".coll-product-card .quick-cart-btn");
  await wait(customer, "JSON.parse(localStorage.getItem('furni_cart') || '[]').length === 1", "new price accepted");
  assert.equal(await customer.evaluate("Number(JSON.parse(localStorage.getItem('furni_cart'))[0].product.price)"), Number(before.price) + 12345);
  await customer.evaluate("localStorage.removeItem('furni_cart')");
  await customer.call("Page.navigate", { url: base + "/collections/phong-khach-bac-au" });
  await wait(customer, "document.querySelectorAll('.coll-product-card').length > 0", "bundle ready");
  const membership = (await request("/api/collections/products"))["phong-khach-bac-au"];
  const secondProduct = membership.products[1];
  await request("/__test/product", { method: "POST", body: JSON.stringify({ product_id: secondProduct.id, stock_quantity: 0 }) });
  await customer.click(".add-bundle-cart-btn");
  await wait(customer, "document.querySelector('.add-bundle-cart-btn').disabled && [...document.querySelectorAll('.quick-cart-btn')].some(button => button.textContent.includes('Hết hàng'))", "whole bundle disabled after availability refresh");
  assert.equal(await customer.evaluate("JSON.parse(localStorage.getItem('furni_cart') || '[]').length"), 0, "a sold out bundle must not add any partial selection");
  await request("/__test/product", { method: "POST", body: JSON.stringify({ product_id: secondProduct.id, stock_quantity: secondProduct.stock_quantity }) });
  await customer.call("Page.navigate", { url: base + "/collections/phong-khach-bac-au" });
  await wait(customer, "!!document.querySelector('.add-bundle-cart-btn') && !document.querySelector('.add-bundle-cart-btn').disabled", "bundle available again");
  await customer.click(".add-bundle-cart-btn");
  await wait(customer, `JSON.parse(localStorage.getItem('furni_cart') || '[]').length === ${membership.products.length}`, "entire real collection added");
  console.log("PASS: price changes require reconfirmation; unavailable bundles add nothing; available bundles add all real products");

  await admin.call("Page.navigate", { url: base + "/admin/orders" });
  await wait(admin, "!!document.querySelector('.store-admin-table')", "mobile admin ready");
  await admin.call("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await wait(admin, "document.querySelector('.admin-sidebar').getBoundingClientRect().right <= 1", "mobile sidebar transition finished");
  await admin.screenshot("orders-mobile.png");
  assert.ok(await admin.evaluate("document.documentElement.scrollWidth <= innerWidth + 1"), "admin must not overflow on mobile");
  assert.ok(await admin.evaluate("document.querySelector('.store-admin-filters').getBoundingClientRect().right <= innerWidth + 1 && document.querySelector('.store-admin-table-wrap').getBoundingClientRect().right <= innerWidth + 1"), "mobile filters and table container must fit within the visible page");
  await guest.call("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await guest.screenshot("policy-mobile.png");
  assert.ok(await guest.evaluate("document.documentElement.scrollWidth <= innerWidth + 1"), "policy page must not overflow on mobile");
  assert.equal(browser.errors.length, 0, JSON.stringify(browser.errors));
  console.log("PASS: desktop/mobile layouts and zero uncaught browser errors");
} finally { await browser.close(); }
