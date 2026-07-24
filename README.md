# 💳 Payment Gateway Simulator — Backend API

A production-grade Node.js/Express card payment gateway simulator designed for integration testing without a real bank connection or real money.

It implements a layered architecture (`routes → controllers → services → models`), Zod request validation, PCI-DSS compliant logging, rate limiting, localization, OpenAPI/Swagger documentation, and centralized error handling matching enterprise payment gateway standards.

> **HTTPS Deployment Note:** This service is designed to sit behind a TLS reverse proxy (e.g. Nginx, Cloudflare, AWS ALB) in non-local environments. In local development, it runs over HTTP.

---

## 1. Setup & Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Run production server
npm start

# Run development mode (with --watch auto-reload)
npm run dev
```

The server defaults to `http://localhost:3001`.
Interactive Swagger UI is available at `http://localhost:3001/api-docs`.

---

## 2. Layered Architecture

```
Backend-Payment-Test/
├── server.js                  ← Server entry point (loads env, handles process errors)
├── .env.example               ← Environment configuration template
├── docs/
│   └── swagger.yaml           ← Static OpenAPI 3.0 specification
├── src/
│   ├── app.js                 ← Express app initialization & middleware stack
│   ├── config/
│   │   ├── env.js             ← Zod environment validator
│   │   ├── swagger.js         ← Swagger-jsdoc generator
│   │   └── locales.js         ← Internationalization dictionary loader
│   ├── controllers/
│   │   └── paymentController.js ← HTTP adapter (request parsing, response formatting)
│   ├── errors/
│   │   └── customErrors.js    ← Typed operational errors (statusCode + errorCode)
│   ├── middlewares/
│   │   ├── errorMiddleware.js ← Centralized error handling & translation
│   │   ├── validateRequest.js ← Zod request body validation factory
│   │   ├── localizeMiddleware.js ← Accept-Language header parser
│   │   ├── rateLimitMiddleware.js ← express-rate-limit guard
│   │   └── requestLogger.js   ← PCI-DSS compliant request logger (PAN masked)
│   ├── models/
│   │   ├── cardStore.js       ← Data access object for cards.json (write-locked)
│   │   └── schemas/
│   │       ├── tokenizeSchema.js ← Tokenize request Zod schema
│   │       └── chargeSchema.js   ← Charge request Zod schema
│   ├── routes/
│   │   └── paymentRoutes.js   ← Express router with inline Swagger annotations
│   ├── services/
│   │   ├── paymentService.js  ← Core business logic (Luhn, status, balance check)
│   │   └── transactionService.js ← Transaction ID & timestamp generator
│   ├── locales/
│   │   ├── en.json            ← English error messages
│   │   ├── az.json            ← Azerbaijani error messages
│   │   └── ru.json            ← Russian error messages
│   ├── data/
│   │   ├── cards.seed.json    ← Immutable 50 synthetic test cards
│   │   └── cards.json         ← Working copy (created dynamically on boot)
│   └── utils/
│       ├── catchAsync.js      ← Async error wrapper
│       ├── maskCardNumber.js  ← PCI-DSS card masking (•••• •••• •••• 6467)
│       ├── generateTransactionId.js ← Transaction ID generator (txn_...)
│       └── randomFailure.js   ← Simulated transient network failures (~5%)
```

---

## 3. Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/payments/methods` | Tokenize card details into reusable `paymentMethodId` |
| `POST` | `/api/payments/charges` | Charge a tokenized payment method (Rate limited) |
| `GET` | `/api/payments/methods/reference` | List all 50 reference cards (CVV excluded) |
| `POST` | `/api/payments/methods/:id/reset` | Restore card balance to original seed amount |
| `GET` | `/health` | Server health check |
| `GET` | `/api-docs` | Interactive Swagger UI API documentation |

---

## 4. Localization (`Accept-Language`)

Send the `Accept-Language` header to localize error messages:
- `Accept-Language: en` (English - Default)
- `Accept-Language: az` (Azerbaijani)
- `Accept-Language: ru` (Russian)

---

## 5. Error Codes & HTTP Status Mapping

| errorCode | HTTP Status | Meaning |
|---|---|---|
| `SUCCESS` | `200` | Charge completed successfully |
| `INSUFFICIENT_FUNDS` | `402` | Card balance is below charge amount |
| `CARD_EXPIRED` | `400` | Card expiry date has passed |
| `CARD_BLOCKED` | `403` | Card has been blocked |
| `CARD_DECLINED` | `403` | Generic bank decline (stolen/flagged) |
| `INVALID_CVV` | `400` | CVV code does not match card record |
| `INVALID_CARD_NUMBER` | `400` | Card number fails Luhn checksum or 16-digit format |
| `CARD_NOT_FOUND` | `404` | Card number not found in database |
| `PAYMENT_METHOD_NOT_FOUND` | `404` | `paymentMethodId` token not found |
| `NETWORK_TIMEOUT` | `504` | Simulated transient gateway failure (~5% roll) |
| `AMOUNT_INVALID` | `400` | Charge amount is zero or negative |
| `VALIDATION_ERROR` | `400` | Request body failed Zod schema validation |
| `RATE_LIMITED` | `429` | Exceeded rate limit for charges |

---

## 6. Manual Verification Checklist

- [ ] Tokenize healthy card (`4539148803436467`) → `200 OK` + `paymentMethodId`
- [ ] Charge healthy card below balance → `200 OK` + balance decreases
- [ ] Charge healthy card above balance → `402 Payment Required` (`INSUFFICIENT_FUNDS`)
- [ ] Tokenize expired card (`4000000000000069`) → `400 Bad Request` (`CARD_EXPIRED`)
- [ ] Tokenize blocked card (`4000000000000127`) → `403 Forbidden` (`CARD_BLOCKED`)
- [ ] Tokenize with wrong CVV → `400 Bad Request` (`INVALID_CVV`)
- [ ] Tokenize invalid Luhn number → `400 Bad Request` (`INVALID_CARD_NUMBER`)
- [ ] `Accept-Language: az` / `ru` → localized error message in response
- [ ] Reset balance endpoint → restores initial seed balance
- [ ] `GET /api/payments/methods/reference` → returns cards without CVV
- [ ] Swagger UI accessible at `/api-docs`
