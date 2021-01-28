const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const ingredientSchema = new Schema({
    ingredientName:{
        type: String,
        required: true
    },
    quantity:{
        type: Number,
        required: true
    },
    units:{
        type: String,
        required: true
    }
});

const recipeSchema = new Schema({
    recipeTitle: {
        type: String,
        required: true
    }, 
    description:{
        type: String,
        required: true
    },
    cuisineType:{
        type: String,
        required: true
    },
    mealType:{
        type: String,
        required: true
    },
    dietType:{
        type: String,
        required: false
    },
    preparationTime:{
        type: Number,
        required: false
    },
    servings:{
        type: Number,
        required: false
    },
    dishLevel:{
        type: String,
        required: false
    },
    picture:{
        type: String,
        required: false
    },
    cloudinaryId: {
        type: String,
        required: false
    },
    steps:{
        type: Array,
        required: true
    },
    calories:{
        type: Number,
        required: true
    },
    writer:{
        type: String,
        required: true
    },
    likes:{
        type: Number,
        required: true,
        default: 0,
        validate(value){
            if(value < 0) throw new Error('can not be negative');
        }
    },
    ingredients: [ ingredientSchema ],

})
recipeSchema.index({recipeTitle: 'text', description: 'text' });
const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe

