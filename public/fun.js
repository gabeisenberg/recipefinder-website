// Globals
let currIndex = 0;
let gRecipes = [];
let page = 0;

function displayInput() {
    const userInput = document.getElementById('input').value;
    const menuContainer = document.querySelector('.container');

    ingredientsContainer = document.createElement('div');
    ingredientsContainer.setAttribute('class', 'ingredients-container');
    
    const outputDisplay = document.createElement('h4');
    outputDisplay.innerHTML = 'You entered:';
    outputDisplay.setAttribute('id', 'ingredients-title');

    const orderList = document.createElement('ol');

    const ingredients = userInput.split(',').map(item => item.trim()); //array of ingredients

   

    // Create Ingredient Card
    ingredients.forEach(item => {
        const it = document.createElement('li');
        it.textContent = item;
        orderList.appendChild(it);
    });

    ingredientsContainer.append(outputDisplay);
    ingredientsContainer.append(orderList);
    menuContainer.append(ingredientsContainer);
    
 


    localStorage.setItem('foodList', JSON.stringify(ingredients));
    return ingredients;
}

function removeInput() {
    const ingredientsContainer = document.querySelector('.ingredients-container')
    ingredientsContainer.remove()
}

// function to post data to server 
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

// function to get page from server
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

// when user submits ingredients list
function onSubmit() {
    // showLoad();
    const ingredientsContainer = document.querySelector('.ingredients-container')
    if(ingredientsContainer !== null) {
        removeInput();
    }
    
    let merge = 0
    // Values of radio buttons
    const radios = document.getElementsByName('sort');
    radios.forEach(radio => {
        if(radio.checked) {
            if(radio.value === 'Merge') {
                merge = 1;
            }
            if(radio.value === 'Heap') {
                merge = 0;
            }
        }
    })
    console.log(merge)

    // removeInput();
    const list = displayInput();
    const recipeObj = {
        "neededIngredients": list,
        "merge": merge
    };
    // Post request that sends ingredients
    postData('http://localhost:3000/recipes', recipeObj).then((data) => {
        data.json().then(list => {
            console.log(list['time']);
            showRecipes(list['results']);
            const results = document.querySelector('.recipeTitle');
            const timeSelect = document.querySelector('#time');
            if(timeSelect !== null) {
                removeTime();
            }
            const time = document.createElement('h4')
            time.innerHTML = 'Time for sort: ' + list['time']
            time.setAttribute('id', 'time')
            results.append(time)
            page = 1;
        });
    });
    // hideLoad();
}

function removeTime() {
    const time = document.querySelector('#time');
    time.remove();
}

function showLoad() {
    document.getElementById('load').style.visibility = 'visible';
}

function hideLoad() {
    document.getElementById('load').style.visibility = 'hidden';
}

function showRecipes(recipeList) {
    console.log(recipeList[0]);
    showRecipe(recipeList[0]);
}

function goBack() {
    getData(`http://localhost:3000/recipes?page=${page--}&limit=1`).then(data => {
            data.json().then(list => {
                console.log(list);
                showRecipes(list['results']);
            
            });
        });
    clearList();
}

function goNext() {
    // Send request for next page
    getData(`http://localhost:3000/recipes?page=${page++}&limit=1`).then(data => {
            data.json().then(list => {
                console.log(list);
                showRecipes(list['results']);
            
            });
        });
    clearList();
    
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
