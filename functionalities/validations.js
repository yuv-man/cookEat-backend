//VALIDIATION
const Joi = require('@hapi/joi');

//Register Validation
const registerValidation = (data) => {
	const schema = Joi.object({
		userName: Joi.string().min(2).max(15).required(),
		email: Joi.string().required().email(),
		password: Joi.string().min(6).required(),
	});

	//validate data before creating user
	return schema.validate(data);
};

const loginValidation = (data) => {
	const schema = Joi.object({
		email: Joi.string().required().email(),
		password: Joi.string().min(6).required(),
	});
	return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
