const joi = require("joi");

const successStoriesSchema = joi.object({
  maleName: joi.string().required(),
  femaleName: joi.string().required(),
  // maleEducation: joi.string().required(),
  // femaleEducation: joi.string().required(),
  // maleAge: joi.string().required(),
  // femaleAge: joi.string().required(),
  // matchDate: joi.date().required(),
  weddingDate: joi.date().iso().optional(),
  maleFile: joi.string().optional(), // Add this line
  femaleFile: joi.string().optional(),
});

module.exports = {
  successStoriesSchema,
};
