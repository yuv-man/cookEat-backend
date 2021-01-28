const router = require('express').Router();
const User = require('../models/users'); //path for DB Schema
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { registerValidation, loginValidation } = require('../functionalities/validations'); //path for DB validation

router.post('/signup', async (req, res) => {
	//Validation for creating new user
	// const { error } = registerValidation(req.body);
	// if (error) return res.status(400).send({ err: error.details[0].message });

	//Check if email already in the DB
	const emailExist = await User.findOne({ email: req.body.email });
	if (emailExist) return res.status(400).send({ err: 'Email already exists' });

	//Hash the password
	const salt = bcrypt.genSaltSync(10);
	const hashPassword = bcrypt.hashSync(req.body.password, salt);

	//Create new user
	console.log(req.body);
	const user = new User({
		userName: req.body.userName,
		email: req.body.email,
		password: hashPassword,
		recipes: [],
		recipesSaved: [],
		culinaryLevel: req.body.culinaryLevel,
		specialDiet: req.body.specialDiet,
		culinaryType: req.body.culinaryType,
	});
	try {
		const savedUser = await user.save();
		// res.send({ user: user.id });
		const token = jwt.sign({ user }, process.env.TOKEN_SECRET);
		res.send(token);
	} catch (err) {
		res.status(400).send({ err: err });
	}
});

//LogIn
router.post('/login', async (req, res) => {
	//Validation for login
	// const { error } = loginValidation(req.body);
	// if (error) return res.status(400).send(error.details[0].message);

	//Check if email in the DB

	const user = await User.findOne({ email: req.body.email });
	if (!user) return res.status(400).send({ err: 'Email or password is incorrect' });
	//Check if password is correct
	const validPass = bcrypt.compareSync(req.body.password, user.password);
	if (!validPass) {
		return res.status(400).send({ err: 'Email or password is incorrect' });
	}
	//Create and assign a token
	const token = jwt.sign({ user }, process.env.TOKEN_SECRET);
	res.send(token);
});

module.exports = router;
