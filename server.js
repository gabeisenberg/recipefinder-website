const sort = require("./sort.js")
const fs = require("fs")

const express = require("express");
const app = express();
const port = 3000;

app.use(express.json())
app.use(express.static('public'))

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/recipes", (req, res, next) => {
    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)

    const startIndex = (page - 1) * limit
    const endIndex = page * limit

    readRecipes('recipes.json', (err, recipes) => {
      if(err) throw err

      // Create results object to store page results
      const results = {}

      // If next results exist add to object
      if(endIndex < recipes.length) {
        results.next = {
          page: page + 1,
          limit: limit
        }
      }
      
      // If prev results exist add to object
      if(startIndex > 0) {
        results.prev = {
          page: page - 1,
          limit: limit
        }
      }
      
      results.results = recipes.slice(startIndex, endIndex)
      res.json(results)
    })
})

app.post("/recipes", (req, res) => {
  let ingredients = req.body["neededIngredients"]

  const getRecipes = async (ingredients) => {
        const recipes = await sort.readRecipes(ingredients) 
        return recipes
  }

  const recipes = getRecipes(ingredients)
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
      res.send('DB updated')
    })
})
  
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});


// Middle Ware Functions

const readRecipes = (filePath, cb) => {
  fs.readFile(filePath, 'utf-8', (err, jsonString) => {
    if(err) {
      return cb && cb(err)
    }
    try {
      const data = JSON.parse(jsonString)
      return cb && cb(null, data)
    }
    catch(err) {
      return cb && cb(err)
    }
    
  })
}
