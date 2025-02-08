const Joi = require("joi");

const registerSchema = Joi.object({
  employeeName: Joi.string().required(),
  phoneNumber: Joi.string().required(),
  branch: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .pattern(
      new RegExp(
        "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{6,}$"
      )
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must have at least one uppercase letter, one lowercase letter, one digit, one special character, and be at least 6 characters long.",
      "string.empty": "Password cannot be empty.",
    }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
    .pattern(
      new RegExp(
        "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{6,}$"
      )
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must have at least one uppercase letter, one lowercase letter, one digit, one special character, and be at least 6 characters long.",
      "string.empty": "Password cannot be empty.",
    }),
});

module.exports = {
  registerSchema,
  loginSchema,
};
