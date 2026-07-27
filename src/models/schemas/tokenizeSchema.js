const { z } = require('zod');

const tokenizeSchema = z.object({
  cardNumber: z
    .string({ message: 'cardNumber is required' })
    .regex(/^\d{16}$/, 'cardNumber must be exactly 16 digits'),
  cardHolder: z
    .string({ message: 'cardHolder is required' })
    .min(1, 'cardHolder cannot be empty'),
  expiryMonth: z
    .string({ message: 'expiryMonth is required' })
    .regex(/^(0[1-9]|1[0-2])$/, 'expiryMonth must be 2 digits (01-12)'),
  expiryYear: z
    .string({ message: 'expiryYear is required' })
    .regex(/^\d{4}$/, 'expiryYear must be 4 digits'),
  cvv: z
    .string({ message: 'cvv is required' })
    .regex(/^\d{3}$/, 'cvv must be exactly 3 digits')
});

module.exports = tokenizeSchema;
