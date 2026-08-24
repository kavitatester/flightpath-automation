// pages/LoginPage.js
const { BasePage } = require('./BasePage');

/**
 * LoginPage — Page Object for authentication flows
 * Covers: standard login, locked user, invalid credentials, logout
 */
class LoginPage extends BasePage {
  constructor(page) {
    super(page);

    // ── Locators ─────────────────────────────────────────────────────────
    this.usernameInput    = page.locator('[data-test="username"]');
    this.passwordInput    = page.locator('[data-test="password"]');
    this.loginButton      = page.locator('[data-test="login-button"]');
    this.errorMessage     = page.locator('[data-test="error"]');
    this.errorCloseButton = page.locator('.error-button');
    this.loginLogo        = page.locator('.login_logo');
  }

  // ── Actions ───────────────────────────────────────────────────────────

  async goto() {
    await this.navigate('/');
    await this.loginLogo.waitFor({ state: 'visible' });
  }

  async login(username, password) {
    await this.fillInput(this.usernameInput, username);
    await this.fillInput(this.passwordInput, password);
    await this.clickElement(this.loginButton);
  }

  async loginWithValidCredentials() {
    const { STANDARD_USER, PASSWORD } = require('../fixtures/testData');
    await this.login(STANDARD_USER, PASSWORD);
  }

  async clearError() {
    await this.clickElement(this.errorCloseButton);
  }

  // ── Assertions (return values, test file does the expect) ─────────────

  async getErrorMessage() {
    return this.getText(this.errorMessage);
  }

  async isErrorVisible() {
    return this.isVisible(this.errorMessage);
  }

  async isOnLoginPage() {
    return (await this.getCurrentUrl()).includes('/');
  }
}

module.exports = { LoginPage };
