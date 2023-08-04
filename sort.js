const fs = require("fs") // Node.js file system
const { parse } = require("csv-parse"); // using the csv-parse module from npm

class Recipe {
    constructor(ingredients, neededIngredients, directions, name){
        this.ingredients = ingredients; // array of ingredients required for this recipe
        this.neededIngredients = ingredients.filter(x => !neededIngredients.includes(x)); // array of ingredients that the user is missing for this recipe
        this.directions = directions; // ordered array of directions for this recipe
        this.name = name;
        this.ratio = (ingredients.length - this.neededIngredients.length) / ingredients.length // (# ingredients we have relevant to recipe) / (total # ingredients for this recipe). metric used for sorting
    }
}

class MaxHeap {
    constructor(){
        this.heap = []; // heap is modeled by an array
    }
    parent(child) {
        return Math.floor((child-1)/2);
    }
    left(parent) {
        return 2*parent + 1;
    }
    right(parent) {
        return 2*parent + 2;
    }
    swap(a, b) {
        let temp = this.heap[a];
        this.heap[a] = this.heap[b];
        this.heap[b] = temp;
    }
    insert(node) {
        this.heap.push(node);
        let c = this.heap.length - 1;
        let p = this.parent(c);
        while(this.heap[p] && this.heap[p].ratio < this.heap[c].ratio) { // heapifyUp algorithm
            this.swap(p ,c);
            c = this.parent(c);
            p = this.parent(c);
        }
    }
    extractMax() { // JavaScript's added capabilites for arrays allow us to heapify down differently than how we would do so in C++
        var max = this.heap.shift();
        this.heap.unshift(this.heap.pop());
        let p = 0;
        let left = 1;
        let right = 2;
        while((this.heap[left] && this.heap[left].ratio > this.heap[p].ratio) || (this.heap[right] && this.heap[right].ratio > this.heap[p].ratio)) {
            var v = left;
            if(this.heap[right] && this.heap[right].ratio > this.heap[v].ratio) {
                v = right;
            }
            this.swap(v, p);
            p = v;
            left = this.left(max);
            right = this.right(max);
        }
        return max;
    }
}
async function readRecipes(neededIngredients) {
    return new Promise((resolve) => { // we need to use an asynchronous method to return the recipe array, since the parsing takes place at the same time as the code that follows it
        const recipesArray = [];
        fs.createReadStream("RAW_recipes.csv")
            .pipe(parse({ delimiter: ","}))
            .on("data", function (row) {
                validJSONStr = row[10].replace(/'/g, '"'); // the strings in the csv file are not in the correct JSON format so this is corrected here
                try {
                    ingredients = JSON.parse(validJSONStr); // string representation of an array can be parsed into an actual array if in JSON format
                } 
                catch (error) { // some of the recipes have directions that use "" quotes within a direction, so we will not use these samples as we would still have >100k sample size anyway
                    return;
                }
                validJSONStr = row[8].replace(/'/g, '"');
                try {
                    directions = JSON.parse(validJSONStr);
                } 
                catch (error) {
                    return;
                }
                r = new Recipe(ingredients, neededIngredients, directions, row[0])
                recipesArray.push(r);
            })
            .on("end", function () {
                resolve(recipesArray);
            });
    });
}
function heapSort(recipesArray) {
    var sorted = [];
    var heap = new MaxHeap();

    for (let i = 0; i < recipesArray.length; i++) { // build max heap
        heap.insert(recipesArray[i]);
    }

    for (let i = 0; i < recipesArray.length; i++) { // extract sorted elements into array, one-by-one
        sorted.push(heap.extractMax());
    }
    return sorted;
}
function merge(left, right) { // helper function for mergeSort()
    let sorted = [];
    while (left.length && right.length) {
        if (left[0].ratio > right[0].ratio) {
            sorted.push(left.shift());
        }
        else {
            sorted.push(right.shift());
        }
    }
    return [...sorted, ...left, ...right];
}
function mergeSort(recipesArray) {
    if (recipesArray.length <= 1) { // base case
        return recipesArray;
    }
    let middle = Math.floor(recipesArray.length / 2); // JavaScript has convenient slicing functions for arrays
    let left = mergeSort(recipesArray.slice(0, middle)); // recursive calls
    let right = mergeSort(recipesArray.slice(middle));
    return merge(left, right)
}
async function main() {
    const neededIngredients = ["salt", "garlic", "eggs", "onion", "water", "butter"] // example
    const recipesArray = await readRecipes(neededIngredients); // await used to ensure the recipe array is actually received before the following code
    var sorted = heapSort(recipesArray); // comment and uncomment as needed
    //var sorted = mergeSort(recipesArray); // comment and uncomment as needed
    console.log(sorted[0]);
    console.log(sorted[1]);
    console.log(sorted[2]);
}
main()
