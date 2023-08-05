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

function onSubmit() {
    const list = displayInput();
    const recipeObj = {
        "neededIngredients": list
    };
    postData("http://localhost:3000/recipes", recipeObj).then((data) => {
        console.log(data); // JSON data parsed by `data.json()` call
    });
    showRecipes(list);
}

/*function revealBox() { //isnt working
    const box = document.getElementById("res");
    box.classList.toggle("hidden");
}*/

let currIndex=0;
const recipe1 = [["Milk","Eggs"], ["Sugar", "Flour", "Syrup"], ["Heat", "Pour", "Flip", "Serve"], "Pancakes"];
const recipe2 = [["Lettuce", "Spinach"], ["Onions", "Tomatoes"], ["Chop", "Mix", "Serve"], "Salad"];
const recipe3 = [["Flour, Eggs"], ["Sugar", "Sprinkles", "Frosting"], ["Preheat", "Mix", "Pour", "Bake", "Frost"], "Cake"];
const recipes = [recipe1, recipe2, recipe3];

function showRecipes(...recipeList) {
    //const list = displayInput();
    //import Recipe from './sort.js'; , import doesnt work
    showRecipe();
}

function goBack() {
    if (currIndex>0) {
        --currIndex;
    }
    clearList();
    showRecipe();
}

function goNext() {
    if (currIndex<2) { //size of recipes - 1, not working
        ++currIndex;
    }
    clearList();
    showRecipe();
}

function clearList() {
    const list = document.getElementById("ingredients");
    list.innerHTML = "";
    const dir = document.getElementById("directions");
    dir.innerHTML = "";
}

function showRecipe() {
    //show name
    const currentRecipe = document.getElementById("current-recipe");
    currentRecipe.textContent = recipes[currIndex][3];
    //show ingredients
    const currentStuff = document.getElementById("ingredients");
    const orderList = document.createElement('ol');
    recipes[currIndex][0].forEach(item => {
        const it = document.createElement('li');
        it.textContent = item;
        orderList.appendChild(it);
    });
    currentStuff.appendChild(orderList);
    //show directions
    const currDirections = document.getElementById("directions");
    const dirList = document.createElement('ol');
    recipes[currIndex][2].forEach(item => {
        const it = document.createElement('li');
        it.textContent = item;
        dirList.appendChild(it);
    });
    currDirections.appendChild(dirList);
}
