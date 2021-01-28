const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const UserModel = require('../models/users');
const cloudinary = require('../util/cloudinary');
const upload = require('../util/multer');

//middlewares
router.use(express.static('imgaes'));
router.use(express.json());

//get all the recipes
router.get('/', async (req, res) => {
	try {
		const allUsers = await UserModel.find({});
		res.send(allUsers);
	} catch (err) {
		res.status(401).send('there is a problem');
	}
});

//get user by Id
router.get('/:id', async (req, res) => {
	const { id } = req.params;
	try {
		const user = await UserModel.findById(id);
		res.status(200).send(user);
	} catch (err) {
		res.status(400).send('user does not exist');
	}
});

// remove user
router.delete('/:id', async (req, res) => {
	try {
		const result = await UserModel.findOne({ _id: req.params.id });
		//delete from cloudinary
		if (result.cloudinaryId) {
			await cloudinary.uploader.destroy(result.cloudinaryId);
		}
		//delete user from database
		await result.remove();
		res.status(200).send('user has been deleted');
	} catch (err) {
		res.status(400).send(err);
	}
});

// update user
router.put('/:id', upload.single('profileImage'), async (req, res) => {
	try {
		let user = await UserModel.findById(req.params.id);
		//remove old picture from cloudinary
		if (user.cloudinaryId) {
			await cloudinary.uploader.destroy(user.cloudinaryId);
		}
		let updateUser;
		//add updated picture to cloudinary
		if (req.file) {
			const result = await cloudinary.uploader.upload(req.file.path);
			updateUser = {
				...req.body,
				profileImage: result.secure_url || user.profileImage,
				cloudinaryId: result.public_id || user.cloudinaryId,
			};
		} else {
			updateUser = { ...req.body };
			console.log(updateUser)
		}
		//update user in database
		user = await UserModel.findByIdAndUpdate(req.params.id, updateUser, { new: true });
		res.status(200).send(user);
	} catch (err) {
		console.log(err);
		res.status(500).send('user has not been updated');
	}
});

//update saved recipes for user
router.put('/likes/:id', async (req, res) => {
	const { recipeId } = req.body;
	try {
		let user = await UserModel.findById(req.params.id);
		if (!user.recipesSaved.includes(recipeId)) {
			user = await UserModel.findByIdAndUpdate(
				req.params.id,
				{ $push: { recipesSaved: recipeId } },
				{ new: true }
			);
			res.status(200).send('Recipe saved succesfully');
		} else {
			user = await UserModel.findByIdAndUpdate(
				req.params.id,
				{ $pull: { recipesSaved: recipeId } },
				{ new: true }
			);
			res.status(201).send('The recipe deleted from your list');
		}
	} catch (err) {
		console.log(err)
		res.status(500).send(err);
	}
});

//update my recipes for user
router.put('/myRecipes/:id', async (req, res) => {
	const { recipeId } = req.body;
	try {
		let user = await UserModel.findById(req.params.id);
		user = await UserModel.findByIdAndUpdate(req.params.id, { $push: { recipes: recipeId } }, { new: true });
		res.status(200).send(user);
	} catch (err) {
		res.status(500).send(err);
	}
});

//remove recipe
router.put('/removeRecipe/:id', async(req, res) => {
	const recipeId = req.params.id
	try{
		let user = await UserModel.findOneAndUpdate({ recipes: { $in: recipeId}}, 
			{ $pull: { recipes: recipeId }}, {new:true} )
		let likedUser = await UserModel.updateMany({ recipesSaved: { $in: recipeId}}, 
			{ $pull: { recipesSaved: recipeId }}, {new:true} )
		res.status(200).send('recipe deleted')
	} catch (err){
		console.log(err)
		res.status(500).send(err)
	}
})

module.exports = router;
