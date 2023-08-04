const sort = require("./sort.js")
const db = require("./db.js")
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
    
})

app.post("/recipes", (req, res) => {
  let ingredients = req.body["neededIngredients"]

  const getRecipes = async (ingredients) => {
        const recipes = await sort.readRecipes(ingredients) 
        return recipes
  }

  const recipes = getRecipes(ingredients)
  db.updateRecipes(recipes)
  
  
  res.send('Created')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
