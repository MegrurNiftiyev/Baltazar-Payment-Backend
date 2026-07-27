const { z } = require('zod');

const chargeSchema = z.object({
  paymentMethodId: z
    .string({ message: 'paymentMethodId is required' })
    .min(1, 'paymentMethodId cannot be empty'),
  amount: z
    .number({ message: 'amount is required' })
    .positive('amount must be greater than zero'),
  currency: z
    .string()
    .length(3, 'currency must be a 3-letter ISO code')
    .default('AZN')
});

module.exports = chargeSchema;
