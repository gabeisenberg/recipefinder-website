const fs = require("fs"); // Node.js file system
const { parse } = require("csv-parse"); // using the csv-parse module from npm

class Recipe {
    constructor(ingredients, availableIngredients, directions, name){
        this.ingredients = ingredients; // array of ingredients required for this recipe
        this.neededIngredients = ingredients.filter(x => !availableIngredients.some(y => (x.includes(y) && x.length < 2 * y.length))) // array of ingredients that the user is missing for this recipe
        this.directions = directions; // ordered array of directions for this recipe
        this.name = name;
        this.ratio = (ingredients.length - this.neededIngredients.length) / ingredients.length // (# ingredients we have relevant to recipe) / (total # ingredients for this recipe). metric used for sorting
        this.ratio2 = -1;
        if (this.ratio == 1) { // we only care when there are ties between recipes that have a ratio of 1, because then we prioritize recipes that use the most ingredients that the user has
            this.ratio2 = ingredients.length / availableIngredients.length;
        }
    }
}

class MaxHeap {
    constructor(){
        this.heap = []; // heap is modeled by an array
    }
    // some helper functions follow
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
        while(this.heap[p] && (this.heap[p].ratio < this.heap[c].ratio || this.heap[p].ratio2 < this.heap[c].ratio2)) { // heapifyUp algorithm
            this.swap(p ,c);
            c = this.parent(c);
            p = this.parent(c);
        }
    }
    extractMax() { // JavaScript's added capabilites for arrays allow us to heapify down differently than how we would do so in C++
        var max = this.heap.shift(); // removes the front of the array
        this.heap.unshift(this.heap.pop()); // places the last element at the front
        let parent = 0;
        let left = 1;
        let right = 2;
        while((this.heap[left] && (this.heap[left].ratio > this.heap[parent].ratio || this.heap[left].ratio2 > this.heap[parent].ratio2)) || (this.heap[right] && (this.heap[right].ratio > this.heap[parent].ratio || this.heap[right].ratio2 > this.heap[parent].ratio2))) {
            var pos = left; // finding the correct position of the node we put at the front now
            if(this.heap[right] && (this.heap[right].ratio > this.heap[pos].ratio || this.heap[right].ratio2 > this.heap[pos].ratio2)) { // if right child greater than left child, then right child replaces and not left
                pos = right;
            }
            this.swap(pos, parent);
            parent = pos;
            left = this.left(pos);
            right = this.right(pos);
        }
        return max;
    }
}
async function readRecipes(availableIngredients) {
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
                r = new Recipe(ingredients, availableIngredients, directions, row[0])
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
        else if (left[0].ratio < right[0].ratio) {
            sorted.push(right.shift());
        }
        else {
            if (left[0].ratio2 > right[0].ratio2) {
                sorted.push(left.shift());
            }
            else {
                sorted.push(right.shift());
            }
        }
    }
    return [...sorted, ...left, ...right]; // using array spread operators to splice these arrays
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

// Main function used to test out sort.js functions
async function main() {
    const availableIngredients = ["eggs", "water", "sugar", "butter", "salt", "onion", "chicken"] // example
    const recipesArray = await readRecipes(availableIngredients); // await used to ensure the recipe array is actually received before the following code
    //var sorted = heapSort(recipesArray); // comment and uncomment as needed
    var sorted = mergeSort(recipesArray); // comment and uncomment as needed
    console.log(sorted[0]);
    console.log(sorted[1]);
    console.log(sorted[2]);
    console.log(sorted[3]);
    console.log(sorted[4]);
    console.log(sorted[5]);
}
module.exports = {
    mergeSort,
    heapSort,
    readRecipes,
}
