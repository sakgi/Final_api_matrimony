const Joi = require("joi");

const userSchema = Joi.object({
  // id: Joi.string().required(),
  userName: Joi.string(),
  birthDate: Joi.string().required(),
  education: Joi.string().required(),
  job: Joi.string().required(),
  jobtype: Joi.string().required(),
  height: Joi.string().required(),
  cast: Joi.string().required(),
  subCast: Joi.string().required(),
  devak: Joi.string().required(),
  ras: Joi.string().required(),
  gan: Joi.string().required(),
  address: Joi.string().required(),
  phoneNumber: Joi.number().required(),
  bloodGroup: Joi.string()
    .valid("A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-")
    .required(),
  demands: Joi.string().required(),
  email: Joi.string().email().required(),
  gender: Joi.string().valid("male", "female", "other").required(),
  profilePictureUrl: Joi.string().uri().allow(''), // Updated to single URL
  vip: Joi.boolean().required(),
});

module.exports = { userSchema };
