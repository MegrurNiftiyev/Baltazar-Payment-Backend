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
 * /api/payments/methods/reference:
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
 *               type: object
 *               properties:
 *                 cards:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CardReference'
 */
router.get(
  '/methods/reference',
  paymentController.listMethods
);

/**
 * @swagger
 * /api/payments/methods/{paymentMethodId}/reset:
 *   post:
 *     summary: Reset a card balance to its seed value
 *     description: Restores a synthetic card's virtual balance to its initial seed amount for repeated testing.
 *     tags:
 *       - Reference Data
 *     parameters:
 *       - in: path
 *         name: paymentMethodId
 *         required: true
 *         schema:
 *           type: string
 *         description: The payment method ID to reset
 *     responses:
 *       200:
 *         description: Balance reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 paymentMethodId:
 *                   type: string
 *                   example: pm_7f3ab21c9e
 *                 balance:
 *                   type: number
 *                   example: 842.30
 *                 message:
 *                   type: string
 *                   example: Balance reset to original seed value
 *       404:
 *         description: Payment method not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/methods/:paymentMethodId/reset',
  paymentController.resetMethod
);

module.exports = router;
