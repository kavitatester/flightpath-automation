// pages/BasePage.js
/**
 * BasePage — Parent class for all Page Objects
 * Encapsulates reusable Playwright interactions with built-in logging,
 * error handling, and wait strategies.
 */
class BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  // ── Navigation ─────────────────────────────────────────────────────────

  async navigate(path = '') {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async getTitle() {
    return this.page.title();
  }

  async getCurrentUrl() {
    return this.page.url();
  }

  // ── Interactions ────────────────────────────────────────────────────────

  async clickElement(locator) {
    await locator.waitFor({ state: 'visible' });
    await locator.click();
  }

  async fillInput(locator, value) {
    await locator.waitFor({ state: 'visible' });
    await locator.clear();
    await locator.fill(value);
  }

  async selectDropdown(locator, value) {
    await locator.selectOption(value);
  }

  async getText(locator) {
    await locator.waitFor({ state: 'visible' });
    return locator.innerText();
  }

  async isVisible(locator) {
    return locator.isVisible();
  }

  async isEnabled(locator) {
    return locator.isEnabled();
  }

  // ── Wait Strategies ─────────────────────────────────────────────────────

  async waitForSelector(selector, options = {}) {
    return this.page.waitForSelector(selector, {
      state: 'visible',
      timeout: 15000,
      ...options,
    });
  }

  async waitForURL(urlPattern, timeout = 15000) {
    await this.page.waitForURL(urlPattern, { timeout });
  }

  async waitForResponse(urlPattern) {
    return this.page.waitForResponse(
      res => res.url().includes(urlPattern) && res.status() === 200
    );
  }

  // ── Screenshot Helpers ──────────────────────────────────────────────────

  async takeScreenshot(name) {
    await this.page.screenshot({
      path: `reports/screenshots/${name}-${Date.now()}.png`,
      fullPage: true,
    });
  }

  // ── Scroll ──────────────────────────────────────────────────────────────

  async scrollToElement(locator) {
    await locator.scrollIntoViewIfNeeded();
  }

  async scrollToBottom() {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  // ── Alerts & Dialogs ────────────────────────────────────────────────────

  async acceptDialog() {
    this.page.once('dialog', dialog => dialog.accept());
  }

  async dismissDialog() {
    this.page.once('dialog', dialog => dialog.dismiss());
  }

  // ── Local Storage ───────────────────────────────────────────────────────

  async getLocalStorage(key) {
    return this.page.evaluate(k => localStorage.getItem(k), key);
  }

  async setLocalStorage(key, value) {
    await this.page.evaluate(([k, v]) => localStorage.setItem(k, v), [key, value]);
  }
}

module.exports = { BasePage };
