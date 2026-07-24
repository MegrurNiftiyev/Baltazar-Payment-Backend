const { ValidationError } = require('../errors/customErrors');

/**
 * Middleware factory for Zod schema validation.
 * Validates request body before reaching controllers.
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join(', ');

    return next(new ValidationError(issues));
  }

  req.body = result.data;
  next();
};

module.exports = validate;
