# 🏦 Mock Bank Test API

A simulated payment provider API (like Stripe/Payriff) for testing payment flows without real cards or real money. Built with Node.js + Express.

## Quick Start

```bash
npm install
npm start        # production
npm run dev      # development (auto-restart on file changes)
```

Server runs on `http://localhost:3001` (configure with `PORT` env variable).

---

## Endpoints

### `POST /api/mock-bank/tokenize`

Converts card details into a reusable payment token.

**Request:**
```json
{
  "cardNumber": "4242424242424242",
  "cardHolder": "Test User",
  "expiryMonth": "12",
  "expiryYear": "2027",
  "cvv": "123"
}
```

**Success Response:**
```json
{
  "success": true,
  "paymentMethodId": "pm_test_0001",
  "brand": "VISA",
  "last4": "4242",
  "expiryMonth": "12",
  "expiryYear": "2027"
}
```

---

### `POST /api/mock-bank/charge`

Charges a tokenized card.

**Request:**
```json
{
  "paymentMethodId": "pm_test_0001",
  "amount": 45.50,
  "currency": "AZN"
}
```

**Success Response:**
```json
{
  "success": true,
  "transactionId": "txn_a1b2c3d4",
  "status": "SUCCESS",
  "amount": 45.50,
  "currency": "AZN",
  "remainingBalance": 54.50,
  "processedAt": "2026-07-24T14:32:00.000Z"
}
```

---

### `GET /api/mock-bank/cards`

Lists all 50 test cards with their current balances (CVV excluded).

---

### `POST /api/mock-bank/cards/:paymentMethodId/reset-balance`

Resets a card's balance back to its original seed value.

---

## Localization

Set the `Accept-Language` header to get messages in different languages:

| Header | Language |
|---|---|
| `en` | English (default) |
| `az` | Azerbaijani |
| `ru` | Russian |

---

## Test Cards Overview

| Cards | Type | Details |
|---|---|---|
| `pm_test_0001` – `pm_test_0015` | Normal (sufficient balance) | Balance 100–5000 AZN, real balance checking |
| `pm_test_0016` – `pm_test_0023` | Low balance | Balance 1–20 AZN |
| `pm_test_0024` – `pm_test_0028` | Zero balance | Balance 0 AZN |
| `pm_test_0029` – `pm_test_0033` | Forced: INSUFFICIENT_FUNDS | Always fails, regardless of balance |
| `pm_test_0034` – `pm_test_0038` | Expired | Status: EXPIRED |
| `pm_test_0039` – `pm_test_0042` | Blocked | Status: BLOCKED |
| `pm_test_0043` – `pm_test_0045` | Stolen / Declined | Status: STOLEN |
| `pm_test_0046` – `pm_test_0048` | Forced: SUCCESS | Always succeeds, regardless of balance |
| `pm_test_0049` – `pm_test_0050` | CVV mismatch testing | Normal cards with CVVs `999` and `777` |

---

## Error Codes

| errorCode | Description |
|---|---|
| `SUCCESS` | Successful transaction |
| `INSUFFICIENT_FUNDS` | Balance too low |
| `CARD_EXPIRED` | Card has expired |
| `CARD_BLOCKED` | Card is blocked |
| `CARD_DECLINED` | Declined by the bank |
| `INVALID_CVV` | Wrong CVV submitted |
| `INVALID_CARD_NUMBER` | Card number format invalid |
| `CARD_NOT_FOUND` | Card number not in database |
| `PAYMENT_METHOD_NOT_FOUND` | Token not found |
| `NETWORK_TIMEOUT` | Simulated network failure (~5% chance) |
| `AMOUNT_INVALID` | Amount is 0 or negative |

---

## Test Scenario Checklist

- [ ] Charge with a sufficiently funded card → `SUCCESS`
- [ ] Charge a low-balance card for more than its balance → `INSUFFICIENT_FUNDS`
- [ ] Expired card → `CARD_EXPIRED` (at the tokenize step)
- [ ] Blocked card → `CARD_BLOCKED`
- [ ] Wrong CVV → `INVALID_CVV`
- [ ] Non-existent card number → `CARD_NOT_FOUND`
- [ ] Card with `forcedResult` → deterministic outcome regardless of balance
- [ ] Charging the same card multiple times → balance decreases correctly
- [ ] `Accept-Language: en` / `ru` / `az` → messages change correctly
- [ ] Random `NETWORK_TIMEOUT` gets triggered (try several times)

---

## File Structure

```
Backend-Payment-Test/
├── server.js                  ← Express entry point
├── data/
│   ├── cards.seed.json        ← Original 50 test cards (never modified)
│   └── cards.json             ← Working copy (balances update here)
├── locales/
│   ├── az.json
│   ├── en.json
│   └── ru.json
├── routes/
│   └── mockBank.js            ← All API route handlers
├── utils/
│   ├── cardStore.js           ← JSON read/write helpers
│   └── localize.js            ← Accept-Language parsing
└── package.json
```
