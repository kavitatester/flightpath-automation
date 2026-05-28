# 🎭 FlightPath Automation Framework

> **End-to-End Test Automation Framework** | Playwright + JavaScript | Portfolio Project

[![Playwright Tests](https://img.shields.io/badge/playwright-tested-green?logo=playwright)](https://playwright.dev)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-blue?logo=githubactions)](https://github.com/features/actions)
[![Allure Report](https://img.shields.io/badge/reports-Allure-orange)](https://docs.qameta.io/allure/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📌 Overview

FlightPath is a **production-grade test automation framework** built with Playwright and JavaScript. It demonstrates a complete QA strategy for a real-world web application — covering UI end-to-end flows, REST API testing, visual regression, and a fully automated CI/CD pipeline.

**Test Site:** [SauceDemo](https://www.saucedemo.com) (E2E) + [Restful Booker](https://restful-booker.herokuapp.com) (API)

---

## 🏗️ Architecture

```
flightpath-automation/
├── tests/
│   ├── e2e/                     # UI End-to-End Tests
│   │   ├── login.spec.js        # Auth flows
│   │   ├── inventory.spec.js    # Product listing & sorting
│   │   ├── checkout.spec.js     # Full purchase journey
│   │   └── data-driven.spec.js  # Parameterised test suites
│   ├── api/
│   │   └── booking.api.spec.js  # REST API CRUD tests
│   ├── visual/
│   │   └── visual.spec.js       # Screenshot regression
│   └── global.setup.js          # One-time auth state setup
│
├── pages/                       # Page Object Model (POM)
│   ├── BasePage.js              # Shared interactions & wait strategies
│   ├── LoginPage.js
│   ├── InventoryPage.js
│   └── CartCheckoutPage.js
│
├── fixtures/
│   ├── testData.js              # Centralised test data & constants
│   └── .auth/                   # Saved browser auth state (gitignored)
│
├── utils/
│   └── helpers.js               # Faker data generators, price utils, retry
│
├── .github/workflows/
│   └── playwright-ci.yml        # GitHub Actions CI/CD pipeline
│
├── playwright.config.js         # Multi-browser, multi-project config
└── .env.example                 # Environment variables template
```

---

## ✅ What's Tested

### 🌐 E2E Tests (UI)
| Suite | Scenarios | Tags |
|---|---|---|
| Login | Valid login, locked user, bad creds, empty fields, logout, auth guard | `@smoke` `@regression` |
| Inventory | Product count, sort (A-Z, Z-A, price), add/remove cart, product detail | `@smoke` `@regression` |
| Checkout | Full purchase flow, cart management, form validation, price accuracy | `@smoke` `@regression` |
| Data-Driven | 4 login scenarios × table, 4 user profiles × checkout, 4 sort validations | `@regression` |

### 🔌 API Tests (REST)
| Endpoint | Method | Scenarios |
|---|---|---|
| `/auth` | POST | Valid token, bad credentials |
| `/booking` | GET | All bookings, filter by name |
| `/booking` | POST | Create + full schema validation |
| `/booking/:id` | GET | Single booking, 404 for missing |
| `/booking/:id` | PUT | Full update with auth |
| `/booking/:id` | PATCH | Partial update |
| `/booking/:id` | DELETE | Delete + 404 verify |

### 👁️ Visual Regression
- Login page (default + error state)
- Inventory page (full page + product card)
- Cart with items
- Mobile viewport (390×844)

---

## 🛠️ Tech Stack

| Tool | Purpose |
|---|---|
| [Playwright](https://playwright.dev) | Browser automation (Chromium, Firefox, WebKit) |
| JavaScript (Node.js 20) | Test language |
| Page Object Model | Test architecture pattern |
| [Allure](https://docs.qameta.io/allure/) | Rich HTML reporting |
| [@faker-js/faker](https://fakerjs.dev) | Dynamic test data generation |
| GitHub Actions | CI/CD pipeline |
| dotenv | Environment config |

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### Installation
```bash
git clone https://github.com/YOUR_USERNAME/flightpath-automation.git
cd flightpath-automation

npm install
npx playwright install --with-deps

cp .env.example .env
```

### Run Tests

```bash
# All tests
npm test

# By suite
npm run test:e2e
npm run test:api
npm run test:visual

# By tag
npm run test:smoke        # Quick sanity check
npm run test:regression   # Full regression suite

# Specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Mobile
npx playwright test --project=mobile-chrome

# Headed mode (watch tests run)
npm run test:headed

# Debug mode
npm run test:debug
```

### View Reports

```bash
# Built-in Playwright HTML report
npm run test:report

# Allure (requires allure CLI: npm i -g allure-commandline)
npm run allure:serve
```

---

## ⚙️ CI/CD Pipeline

The GitHub Actions workflow runs on every push/PR and daily at **6:00 AM IST**.

```
Push → Install (cached) → ┌── E2E (Chromium)
                           ├── E2E (Firefox)
                           ├── E2E (WebKit)
                           ├── API Tests
                           └── Visual Regression
                                      │
                              Allure Report → GitHub Pages
```

**Features:**
- ✅ Parallel execution across 3 browsers
- ✅ Allure report auto-published to GitHub Pages
- ✅ Screenshot/video artifacts on failure
- ✅ `fail-fast: false` — all browsers complete even if one fails
- ✅ Manual trigger with browser/suite selection
- ✅ Daily scheduled regression run

---

## 🎯 Key Design Decisions

### Why Page Object Model?
Separates test logic from UI selectors. When the UI changes, only the Page Object needs updating — all tests stay intact.

### Why `storageState` for auth?
Running login once and reusing the saved session cuts test runtime by ~30%. The global setup logs in once; E2E tests start already authenticated.

### Why data-driven tests?
`test.each()` patterns eliminate copy-paste tests. One loop covers multiple user profiles, locales, and edge cases without duplicating assertions.

### Why separate API tests?
API tests bypass the UI and run in headless mode — they're 10× faster than UI tests. Catching backend bugs at the API layer means UI tests only validate UI behaviour.

---

## 📊 Sample Test Output

```
Running 47 tests using 4 workers

  ✓ Login › should login successfully with valid credentials @smoke (1.2s)
  ✓ Login › should block locked-out user with correct error message (0.8s)
  ✓ Inventory › should display 6 products on inventory page @smoke (0.9s)
  ✓ Inventory › should sort products A to Z (1.1s)
  ✓ Checkout › should complete full purchase flow successfully @smoke (3.4s)
  ✓ API › POST /booking — should create a new booking (0.6s)
  ✓ API › DELETE /booking/:id — should delete and verify 404 (1.2s)
  ...

  47 passed (38s)
```

---

## 👤 Author

**Your Name**  
QA Automation Engineer — 4 Years Experience  
📧 your.email@example.com  
🔗 [LinkedIn](https://linkedin.com/in/yourprofile) | [GitHub](https://github.com/yourusername)

---

## 📄 License

MIT — free to use as a portfolio reference or starting template.
