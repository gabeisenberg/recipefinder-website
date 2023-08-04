const fs = require("fs")
const sort = require("./sort.js")

const updateRecipes = (recipes) => {
    recipes.then((recipes_list) => {
        sorted_recipes = sort.mergeSort(recipes_list)
    
        // Write to JSON File
        sorted_recipes_list = []
        sorted_recipes.forEach(recipe => {
          const recipeObj = {
            'ingredients': recipe.ingredients,
            'neededIngredients': recipe.neededIngredients,
            'direction': recipe.directions,
            'name': recipe.name,
            'ration': recipe.ratio
          }
          sorted_recipes_list.push(recipeObj)
        })
  
        let data = JSON.stringify(sorted_recipes_list, null, 2)
        fs.writeFile('recipes.json', data, 'utf8', (err) => {
          if (err) throw err;
          console.log("DB Updated")
        })
    })
}

const readRecipesPaginated = (page, limit) => {
    const startIndex = (page - 1) * limit
    const endIndex = page * limit

    fs.readFile('recipes.json')

}

module.exports = {
    updateRecipes
}