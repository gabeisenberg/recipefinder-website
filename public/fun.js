function displayInput() {
    const userInput = document.getElementById('input').value;
    const ingredients = userInput.split(',').map(item => item.trim()); //array of ingredients
    const outputDisplay = document.getElementById('output');
    outputDisplay.innerHTML = 'You entered:';
    const orderList = document.createElement('ol')
    ingredients.forEach(item => {
        const it = document.createElement('li');
        it.textContent = item;
        orderList.appendChild(it);
    });
    outputDisplay.appendChild(orderList);
    localStorage.setItem('foodList', JSON.stringify(ingredients));
    return ingredients;
}

async function postData(url, data) {
    const response = await fetch(url, {
        method: "POST",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    return response;
}

async function getData(url) {
    const response = await fetch(url, {
        method: "GET",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json"
        },
    });
    return response;
}

let currIndex = 0;
let gRecipes = [];
function onSubmit() {
    showLoad();
    const list = displayInput();
    const recipeObj = {
        "neededIngredients": list
    };
    postData('http://localhost:3000/recipes', recipeObj).then((data) => {
        data.json().then(list => {
            let recipes = JSON.parse(list)
            gRecipes = recipes
            console.log(recipes)
            currIndex = 0
            showRecipes(recipes)
        }); // JSON data parsed by `data.json()` call
    });
    hideLoad();
}

function showLoad() {
    document.getElementById('load').style.visibility = 'visible';
}

function hideLoad() {
    document.getElementById('load').style.visibility = 'hidden';
}

function showRecipes(recipeList) {
    console.log(recipeList[currIndex]);
    showRecipe(recipeList[currIndex]);
}

function goBack() {
    if (currIndex > 0) {
        --currIndex;
    }
    clearList();
    showRecipe(gRecipes[currIndex]);
}

function goNext() {
    if (currIndex < 5) { //size of recipes page
        ++currIndex;
    }
    clearList();
    showRecipe(gRecipes[currIndex]);
}

function clearList() {
    const list = document.getElementById("ingredients");
    list.innerHTML = "";
    const dir = document.getElementById("directions");
    dir.innerHTML = "";
}

function showRecipe(recipe) {
    //show name
    const currentRecipe = document.getElementById("current-recipe");
    currentRecipe.textContent = recipe.name;
    //show ingredients
    const currentStuff = document.getElementById("ingredients");
    const orderList = document.createElement('ul');
    console.log(recipe.ingredients);
    recipe.ingredients.forEach(item => {
        const it = document.createElement('li');
        it.textContent = item;
        orderList.appendChild(it);
    });
    currentStuff.appendChild(orderList);
    //show directions
    const currDirections = document.getElementById("directions");
    const dirList = document.createElement('ol');
    console.log(recipe.directions);
    recipe.directions.forEach(item => {
        const it = document.createElement('li');
        it.textContent = item;
        dirList.appendChild(it);
    });
    currDirections.appendChild(dirList);
    //show match
    const currentMatch = document.getElementById("match");
    const temp = parseFloat(recipe.ratio) * 100;
    currentMatch.textContent = temp.toString() + "% match!";
    //display titles
    document.getElementById("iTitle").textContent = "Ingredients:";
    document.getElementById("iDir").textContent = "Directions:";
}
