const { date } = require('@hapi/joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
	userName: {
		type: String,
		required: true,
		validate(value) {
			if (value.length < 2) throw new Error('user name is invalid');
		},
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
		validate(value) {
			if (value.length < 6 || value.length > 100) throw new Error('password is invalid');
		},
	},
	profileImage: {
		type: String,
		required: false,
	},
	cloudinaryId: {
		type: String,
		required: false,
	},
	recipes: {
		type: Array,
		required: true,
		default: 0,
	},
	recipesSaved: {
		type: Array,
		required: true,
		default: 0,
	},
	birthDate: {
		type: Date,
	},
	country: {
		type: String,
	},
	culinaryLevel: {
		type: String,
	},
	specialDiet: {
		glutenFree: {
			type: Boolean,
			default: false,
		},
		halal: {
			type: Boolean,
			default: false,
		},
		keto: {
			type: Boolean,
			default: false,
		},
		kosher: {
			type: Boolean,
			default: false,
		},
		paleo: {
			type: Boolean,
			default: false,
		},
		pescaterian: {
			type: Boolean,
			default: false,
		},
		vegeterian: {
			type: Boolean,
			default: false,
		},
		vegan: {
			type: Boolean,
			default: false,
		},
	},
	culinaryType: {
		american: {
			type: Boolean,
			default: false,
		},
		brazilian: {
			type: Boolean,
			default: false,
		},
		caribbean: {
			type: Boolean,
			default: false,
		},
		chinese: {
			type: Boolean,
			default: false,
		},
		english: {
			type: Boolean,
			default: false,
		},
		ethiopian: {
			type: Boolean,
			default: false,
		},
		french: {
			type: Boolean,
			default: false,
		},
		filipino: {
			type: Boolean,
			default: false,
		},
		georgian: {
			type: Boolean,
			default: false,
		},
		german: {
			type: Boolean,
			default: false,
		},
		greek: {
			type: Boolean,
			default: false,
		},
		indian: {
			type: Boolean,
			default: false,
		},
		indonesian: {
			type: Boolean,
			default: false,
		},
		italian: {
			type: Boolean,
			default: false,
		},
		jamaican: {
			type: Boolean,
			default: false,
		},
		japanese: {
			type: Boolean,
			default: false,
		},
		jewish: {
			type: Boolean,
			default: false,
		},
		korean: {
			type: Boolean,
			default: false,
		},
		mexican: {
			type: Boolean,
			default: false,
		},
		polish: {
			type: Boolean,
			default: false,
		},
		persian: {
			type: Boolean,
			default: false,
		},
		portuguese: {
			type: Boolean,
			default: false,
		},
		russian: {
			type: Boolean,
			default: false,
		},
		spanish: {
			type: Boolean,
			default: false,
		},
		thai: {
			type: Boolean,
			default: false,
		},
		vietnamese: {
			type: Boolean,
			default: false,
		},
	},
});

const User = mongoose.model('User', userSchema);

module.exports = User;
