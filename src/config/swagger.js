const swaggerJsdoc = require('swagger-jsdoc');

const port = process.env.PORT || 3001;

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Payment Gateway Simulator API',
    version: '1.0.0',
    description: 'Production-like card payment gateway simulator API (tokenize, charge, reference lookup, balance reset).'
  },
  servers: [
    {
      url: '/',
      description: 'Current server'
    },
    {
      url: `http://localhost:${port}`,
      description: 'Local development server'
    }
  ],
  tags: [
    {
      name: 'Payment Methods',
      description: 'Card tokenization endpoints'
    },
    {
      name: 'Charges',
      description: 'Payment authorization and charge processing'
    },
    {
      name: 'Reference Data',
      description: 'Test card lookup and balance reset utilities'
    }
  ],
  components: {
    schemas: {
      TokenizeRequest: {
        type: 'object',
        required: ['cardNumber', 'cardHolder', 'expiryMonth', 'expiryYear', 'cvv'],
        properties: {
          cardNumber: { type: 'string', example: '4539148803436467' },
          cardHolder: { type: 'string', example: 'DAVID MORENO' },
          expiryMonth: { type: 'string', example: '11' },
          expiryYear: { type: 'string', example: '2028' },
          cvv: { type: 'string', example: '417' }
        }
      },
      TokenizeResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          paymentMethodId: { type: 'string', example: 'pm_7f3ab21c9e' },
          brand: { type: 'string', example: 'VISA' },
          last4: { type: 'string', example: '6467' },
          expiryMonth: { type: 'string', example: '11' },
          expiryYear: { type: 'string', example: '2028' }
        }
      },
      ChargeRequest: {
        type: 'object',
        required: ['paymentMethodId', 'amount'],
        properties: {
          paymentMethodId: { type: 'string', example: 'pm_7f3ab21c9e' },
          amount: { type: 'number', example: 45.50 },
          currency: { type: 'string', example: 'AZN' }
        }
      },
      ChargeSuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          transactionId: { type: 'string', example: 'txn_c92f1a08e4' },
          status: { type: 'string', example: 'SUCCESS' },
          amount: { type: 'number', example: 45.50 },
          currency: { type: 'string', example: 'AZN' },
          remainingBalance: { type: 'number', example: 796.80 },
          processedAt: { type: 'string', format: 'date-time' }
        }
      },
      ChargeErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          errorCode: { type: 'string', example: 'INSUFFICIENT_FUNDS' },
          message: { type: 'string', example: 'Insufficient funds on the card' },
          transactionId: { type: 'string', example: 'txn_c92f1a08e5' },
          status: { type: 'string', example: 'FAILED' },
          processedAt: { type: 'string', format: 'date-time' }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          errorCode: { type: 'string', example: 'CARD_EXPIRED' },
          message: { type: 'string', example: 'This card has expired' }
        }
      },
      CardReference: {
        type: 'object',
        properties: {
          cardNumber: { type: 'string', example: '4539148803436467' },
          paymentMethodId: { type: 'string', example: 'pm_7f3ab21c9e' },
          cardHolder: { type: 'string', example: 'DAVID MORENO' },
          brand: { type: 'string', example: 'VISA' },
          last4: { type: 'string', example: '6467' },
          expiryMonth: { type: 'string', example: '11' },
          expiryYear: { type: 'string', example: '2028' },
          balance: { type: 'number', example: 842.30 },
          currency: { type: 'string', example: 'AZN' },
          status: { type: 'string', example: 'ACTIVE' },
          forcedResult: { type: 'string', nullable: true, example: null }
        }
      }
    }
  }
};

const options = {
  definition: swaggerDefinition,
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
