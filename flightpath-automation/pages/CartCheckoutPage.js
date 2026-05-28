// pages/CartPage.js
const { BasePage } = require('./BasePage');

class CartPage extends BasePage {
  constructor(page) {
    super(page);

    this.cartItems        = page.locator('.cart_item');
    this.itemNames        = page.locator('.inventory_item_name');
    this.itemPrices       = page.locator('.inventory_item_price');
    this.checkoutButton   = page.locator('[data-test="checkout"]');
    this.continueShopBtn  = page.locator('[data-test="continue-shopping"]');
    this.removeButtons    = page.locator('[data-test^="remove"]');
    this.pageTitle        = page.locator('.title');
  }

  async goto() {
    await this.navigate('/cart.html');
    await this.pageTitle.waitFor({ state: 'visible' });
  }

  async checkout() {
    await this.clickElement(this.checkoutButton);
  }

  async removeItem(itemName) {
    const item      = this.page.locator('.cart_item', { hasText: itemName });
    const removeBtn = item.locator('[data-test^="remove"]');
    await this.clickElement(removeBtn);
  }

  async continueShopping() {
    await this.clickElement(this.continueShopBtn);
  }

  async getCartItemCount() {
    return this.cartItems.count();
  }

  async getItemNames() {
    return this.itemNames.allInnerTexts();
  }

  async getItemPrices() {
    const texts = await this.itemPrices.allInnerTexts();
    return texts.map(p => parseFloat(p.replace('$', '')));
  }
}

// ─────────────────────────────────────────────────────────────────────────────

// pages/CheckoutPage.js
class CheckoutPage extends BasePage {
  constructor(page) {
    super(page);

    // Step 1
    this.firstNameInput   = page.locator('[data-test="firstName"]');
    this.lastNameInput    = page.locator('[data-test="lastName"]');
    this.postalCodeInput  = page.locator('[data-test="postalCode"]');
    this.continueButton   = page.locator('[data-test="continue"]');
    this.cancelButton     = page.locator('[data-test="cancel"]');
    this.errorMessage     = page.locator('[data-test="error"]');

    // Step 2 — Overview
    this.finishButton     = page.locator('[data-test="finish"]');
    this.summaryItems     = page.locator('.cart_item');
    this.subtotalLabel    = page.locator('.summary_subtotal_label');
    this.taxLabel         = page.locator('.summary_tax_label');
    this.totalLabel       = page.locator('.summary_total_label');

    // Complete
    this.completeHeader   = page.locator('.complete-header');
    this.completeText     = page.locator('.complete-text');
    this.backHomeButton   = page.locator('[data-test="back-to-products"]');
  }

  async fillShippingInfo(firstName, lastName, postalCode) {
    await this.fillInput(this.firstNameInput, firstName);
    await this.fillInput(this.lastNameInput, lastName);
    await this.fillInput(this.postalCodeInput, postalCode);
  }

  async continue() {
    await this.clickElement(this.continueButton);
  }

  async finish() {
    await this.clickElement(this.finishButton);
  }

  async cancel() {
    await this.clickElement(this.cancelButton);
  }

  async getErrorMessage() {
    return this.getText(this.errorMessage);
  }

  async getSubtotal() {
    const text = await this.getText(this.subtotalLabel);
    return parseFloat(text.replace(/[^0-9.]/g, ''));
  }

  async getTax() {
    const text = await this.getText(this.taxLabel);
    return parseFloat(text.replace(/[^0-9.]/g, ''));
  }

  async getTotal() {
    const text = await this.getText(this.totalLabel);
    return parseFloat(text.replace(/[^0-9.]/g, ''));
  }

  async getConfirmationMessage() {
    return this.getText(this.completeHeader);
  }

  async backToHome() {
    await this.clickElement(this.backHomeButton);
  }
}

module.exports = { CartPage, CheckoutPage };
