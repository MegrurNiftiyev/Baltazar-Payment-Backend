const { z } = require('zod');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  CORS_ALLOWED_ORIGINS: z.string().default('*'),
  DISABLE_RANDOM_FAILURES: z.enum(['true', 'false']).default('false')
});

let parsedEnv = null;

const validateEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join(', ');

    throw new Error(`Invalid environment configuration: ${issues}`);
  }

  parsedEnv = result.data;
  return result.data;
};

const getEnv = () => {
  if (!parsedEnv) {
    return validateEnv();
  }
  return parsedEnv;
};

module.exports = { validateEnv, getEnv };
