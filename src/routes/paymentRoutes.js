const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const validate = require('../middlewares/validateRequest');
const rateLimitMiddleware = require('../middlewares/rateLimitMiddleware');
const tokenizeSchema = require('../models/schemas/tokenizeSchema');
const chargeSchema = require('../models/schemas/chargeSchema');

/**
 * @swagger
 * /api/payments/methods:
 *   post:
 *     summary: Tokenize a payment card
 *     description: Converts raw card credentials into a reusable paymentMethodId token after performing validation and status checks.
 *     tags:
 *       - Payment Methods
 *     parameters:
 *       - in: header
 *         name: Accept-Language
 *         schema:
 *           type: string
 *           enum: [en, az, ru]
 *           default: en
 *         description: Preferred language for error messages
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TokenizeRequest'
 *     responses:
 *       200:
 *         description: Token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenizeResponse'
 *       400:
 *         description: Validation error, invalid card number, invalid CVV, or card expired
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Card blocked or declined
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Card not found in data store
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/methods',
  validate(tokenizeSchema),
  paymentController.tokenize
);

/**
 * @swagger
 * /api/payments/charges:
 *   post:
 *     summary: Charge a tokenized payment method
 *     description: Charges a payment method token. Checks status, forced results, simulated network failures, and card balance.
 *     tags:
 *       - Charges
 *     parameters:
 *       - in: header
 *         name: Accept-Language
 *         schema:
 *           type: string
 *           enum: [en, az, ru]
 *           default: en
 *         description: Preferred language for error messages
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChargeRequest'
 *     responses:
 *       200:
 *         description: Transaction completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChargeSuccessResponse'
 *       400:
 *         description: Invalid amount or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChargeErrorResponse'
 *       402:
 *         description: Insufficient funds on card
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChargeErrorResponse'
 *       403:
 *         description: Card blocked or declined
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChargeErrorResponse'
 *       404:
 *         description: Payment method not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChargeErrorResponse'
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChargeErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChargeErrorResponse'
 *       504:
 *         description: Simulated random network timeout
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChargeErrorResponse'
 */
router.post(
  '/charges',
  rateLimitMiddleware,
  validate(chargeSchema),
  paymentController.charge
);

/**
 * @swagger
 * /api/payments/test-cards:
 *   get:
 *     summary: List all reference test cards (debug/development only)
 *     description: Returns the list of 50 synthetic test cards with balances and statuses. Excludes CVV for PCI compliance simulation.
 *     tags:
 *       - Reference Data
 *     responses:
 *       200:
 *         description: List of reference cards
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TestCardsResponse'
 */
router.get(
  '/test-cards',
  paymentController.listTestCards
);


/**
 * @swagger
 * /api/payments/test-cards/reset-all:
 *   post:
 *     summary: Reset all test cards to their seed values
 *     description: Restores every test card's balance and state to its original seed data in one call. Does not accept a target card — always resets the full dataset.
 *     tags:
 *       - Reference Data
 *     responses:
 *       200:
 *         description: All cards reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 resetCount:
 *                   type: integer
 *                   example: 50
 *                 message:
 *                   type: string
 *                   example: All test card balances restored to seed values
 */
router.post(
  '/test-cards/reset-all',
  paymentController.resetAllMethods
);

module.exports = router;

