// pages/InventoryPage.js
const { BasePage } = require('./BasePage');

/**
 * InventoryPage — Page Object for product listing / search / sort
 */
class InventoryPage extends BasePage {
  constructor(page) {
    super(page);

    // ── Locators ──────────────────────────────────────────────────────────
    this.pageTitle        = page.locator('.title');
    this.productList      = page.locator('.inventory_list');
    this.productItems     = page.locator('.inventory_item');
    this.productNames     = page.locator('.inventory_item_name');
    this.productPrices    = page.locator('.inventory_item_price');
    this.sortDropdown     = page.locator('[data-test="product-sort-container"]');
    this.cartIcon         = page.locator('.shopping_cart_link');
    this.cartBadge        = page.locator('.shopping_cart_badge');
    this.burgerMenu       = page.locator('#react-burger-menu-btn');
    this.logoutLink       = page.locator('#logout_sidebar_link');
    this.addToCartButtons = page.locator('[data-test^="add-to-cart"]');
    this.removeButtons    = page.locator('[data-test^="remove"]');
  }

  // ── Navigation ─────────────────────────────────────────────────────────

  async goto() {
    await this.navigate('/inventory.html');
    await this.productList.waitFor({ state: 'visible' });
  }

  // ── Actions ────────────────────────────────────────────────────────────

  async sortBy(option) {
    // option: 'az' | 'za' | 'lohi' | 'hilo'
    await this.selectDropdown(this.sortDropdown, option);
  }

  async addProductToCart(productName) {
    const product = this.page.locator('.inventory_item', { hasText: productName });
    const addBtn  = product.locator('[data-test^="add-to-cart"]');
    await this.clickElement(addBtn);
  }

  async removeProductFromCart(productName) {
    const product   = this.page.locator('.inventory_item', { hasText: productName });
    const removeBtn = product.locator('[data-test^="remove"]');
    await this.clickElement(removeBtn);
  }

  async addFirstNProductsToCart(n) {
    const buttons = await this.addToCartButtons.all();
    for (let i = 0; i < Math.min(n, buttons.length); i++) {
      await buttons[i].click();
    }
  }

  async openProductByName(name) {
    await this.page.locator('.inventory_item_name', { hasText: name }).click();
  }

  async logout() {
    await this.clickElement(this.burgerMenu);
    await this.page.waitForTimeout(300); // sidebar animation
    await this.clickElement(this.logoutLink);
  }

  async goToCart() {
    await this.clickElement(this.cartIcon);
  }

  // ── Getters ────────────────────────────────────────────────────────────

  async getProductCount() {
    return this.productItems.count();
  }

  async getAllProductNames() {
    return this.productNames.allInnerTexts();
  }

  async getAllProductPrices() {
    const priceTexts = await this.productPrices.allInnerTexts();
    return priceTexts.map(p => parseFloat(p.replace('$', '')));
  }

  async getCartCount() {
    const badge = this.cartBadge;
    if (await badge.isVisible()) return parseInt(await badge.innerText());
    return 0;
  }

  async getPageTitle() {
    return this.getText(this.pageTitle);
  }
}

module.exports = { InventoryPage };
