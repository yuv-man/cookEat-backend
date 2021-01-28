const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const RecipesModel = require("../models/recipes");
const UserModel = require("../models/users");
const cloudinary = require("../util/cloudinary");
const upload = require("../util/multer");

//middlewares
router.use(express.static("imgaes"));
router.use(express.json());

//get all the recipes when no user
router.get("/", async (req, res) => {
  if (req.query.search) {
    //search by title and description and ingidients
    const regex = new RegExp(escapeRegex(req.query.search), "gi");
    const result = await RecipesModel.find(
      {
        $or: [
          { "ingredients.ingredientName": regex },
          { $text: { $search: regex } },
        ],
      },
      { score: { $meta: "textScore" } }
    ).sort({ score: { $meta: "textScore" } });
    res.send(result);
  } else {
    const allRecipes = await RecipesModel.find({});
    res.send(allRecipes);
  }
});

//filter recipe
router.post("/filter", async (req, res) => {
  const { cuisineType, mealType, dietType, dishLevel } = req.body;
  let filters = {};
  if (cuisineType) filters.cuisineType = cuisineType;
  if (mealType) filters.mealType = mealType;
  if (dietType) filters.dietType = dietType;
  if (dishLevel) filters.dishLevel = dishLevel;

  const results = await RecipesModel.find(filters);
  res.send(results);
});

//get recipe by Id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const recipe = await RecipesModel.findById(id);
    res.status(200).send(recipe);
  } catch (err) {
    res.status(400).send("recipe does not exist");
  }
});

//add recipe
router.post("/", upload.single("picture"), async (req, res) => {
  try {
    const recipeData = JSON.parse(req.body.data);
    //add to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);
    const recipeBody = {
      ...req.body,
      recipeTitle: recipeData.recipeTitle,
      description: recipeData.description,
      cuisineType: recipeData.cuisineType,
      dietType: recipeData.dietType,
      preparationTime: recipeData.preparationTime,
      servings: recipeData.servings,
      ingredients: recipeData.ingredients,
      steps: recipeData.steps,
      calories: recipeData.calories,
      dishLevel: recipeData.dishLevel,
      mealType: recipeData.mealType,
      writer: recipeData.writer,
      recipeTitle: recipeData.recipeTitle,
      picture: result.secure_url,
      cloudinaryId: result.public_id,
    };
    let recipe = new RecipesModel(recipeBody);
    //add to database
    await recipe.save();
    res.send(recipe);
  } catch (err) {
    console.log(err);
    res.status(500).send("uff");
  }
});

// remove recipe
router.delete("/:id", async (req, res) => {
  try {
    const result = await RecipesModel.findOne({ _id: req.params.id });
    //delete from cloudinary
    await cloudinary.uploader.destroy(result.cloudinaryId);
    //delete recipe from database
    await result.remove();
    res.status(200).send("recipe has been deleted");
  } catch (err) {
    res.status(500).send(err);
  }
});

// update recipe
router.put("/:id", upload.single("picture"), async (req, res) => {
  const data = JSON.parse(req.body.data);
  try {
    let updateRecipe;
    let recipe = await RecipesModel.findById(req.params.id);
    if (req.file) {
      //remove old picture from cloudinary
      await cloudinary.uploader.destroy(recipe.cloudinaryId);
      //add updated picture to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);
      updateRecipe = {
        ...req.body,
        picture: result.secure_url || recipe.picture,
        cloudinaryId: result.public_id || recipe.cloudinaryId,
      };
    } else {
      updateRecipe = { ...data };
    }
    //update recipe in database
    recipe = await RecipesModel.findByIdAndUpdate(req.params.id, updateRecipe, {
      new: true,
    });
    res.status(200).send(recipe);
  } catch (err) {
    console.log(err);
    res.status(500).send("the recipe did not updated");
  }
});

// add or remove like to recipe
router.put("/likes/:id", async (req, res) => {
  const { id } = req.params;
  const { likes } = req.body;
  try {
    let recipe = await RecipesModel.findById(id);
    let updates = { ...recipe._doc, likes: likes };
    recipe = await RecipesModel.findByIdAndUpdate(id, updates, { new: true });
    res.status(200).send(recipe);
  } catch (err) {
    res.status(500).send("the recipe did not updated");
  }
});

//get my recipes
router.get("/myRecipes/:id", async (req, res) => {
  try {
    const myRecipes = await RecipesModel.find({ writer: req.params.id });
    res.status(201).send(myRecipes);
  } catch (err) {
    res.status(400).send(err);
  }
});

//filter recipe
router.get("/filter/:userId", async (req, res) => {
  try{
    if (req.query.search) {
      //search by title and description and ingidients
      const regex = new RegExp(escapeRegex(req.query.search), "gi");
      const result = await RecipesModel.find(
        {
          $or: [
            { "ingredients.ingredientName": regex },
            { $text: { $search: regex } },
          ],
        },
        { score: { $meta: "textScore" } }
      ).sort({ score: { $meta: "textScore" } });
      res.send(result);
  } else {
  const user = await UserModel.findById(req.params.userId)
  const culinaryType = user.culinaryType;
  const specialDiet = user.specialDiet
  let cuisine = []
  let diet = []
  let dishLevel
  let results
  if(user.culinaryLevel){
    dishLevel = user.culinaryLevel
    results = await RecipesModel.find({dishLevel: dishLevel})
  } else {
    results = await RecipesModel.find({})
  }
  for(let item in culinaryType){
    if(culinaryType[item] === true){
      cuisine.push(item)
    }
  }
  cuisine.shift()
  if(cuisine.length > 0){
    const newRes = results.filter(
      item => {for(let x of cuisine){
        if(item.cuisineType == x){
        return true
        }}})
    results = newRes
  }
  for(let item in specialDiet){
    if(specialDiet[item] === true){
      diet.push(item)
    }
  }
  diet.shift()
  if(diet.length > 0){
    const final = results.filter(item => {
      for(let i of diet){
        if(item.dietType == i){
          return true
        }}})
    results = final
  }
  if(results.length < 2){
    results = await RecipesModel.find({})
  }
  res.status(200).send(results)
  }
} catch (err) {
    res.status(500).send(err)
  }
});

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports = router;

// } else {
//   const user = await UserModel.findById(req.params.userId)
//   const culinaryType = user.culinaryType;
//   const specialDiet = user.specialDiet
//   let cuisine = []
//   let diet = []
//   let dishLevel
//   let results
//   if(user.culinaryLevel){
//     dishLevel = user.culinaryLevel
//     results = await RecipesModel.find({dishLevel: dishLevel})
//   } else {
//     results = await RecipesModel.find({})
//   }
//   for(let item in culinaryType){
//     if(culinaryType[item] === true){
//       cuisine.push(item)
//     }
//   }
//   cuisine.shift()
//   if(cuisine.length > 0){
//     const newRes = results.filter(
//       item => {for(let x of cuisine){
//         if(item.cuisineType == x){
//         return true
//         }}})
//     results = newRes
//   }
//   for(let item in specialDiet){
//     if(specialDiet[item] === true){
//       diet.push(item)
//     }
//   }
//   diet.shift()
//   if(diet.length > 0){
//     const final = results.filter(item => {
//       for(let i of diet){
//         if(item.dietType == i){
//           return true
//         }}})
//     results = final
//   }
//   res.status(200).send(results)
//   }
// } catch (err) {
//     res.status(500).send(err)
//   }
// });
