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
    localStorage.setItem('foodList', JSON, stringify(ingredients));
    //remove hidden box
    const container = document.getElementById('listBox');
    container.classList.remove('hidden');
    return ingredients;
}

function onSubmit() {
    const list = displayInput();
}
