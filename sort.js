const fs = require("fs")
const { parse } = require("csv-parse");

class Recipe {
    constructor(ingredients, neededIngredients, directions, name){
        this.ingredients = ingredients;
        this.neededIngredients = ingredients.filter(x => !neededIngredients.includes(x));
        this.directions = directions;
        this.name = name;
        this.ratio = (ingredients.length - this.neededIngredients.length) / ingredients.length
    }
}

class MaxHeap {
    constructor(){
        this.heap = [];
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
        while(this.heap[p] && this.heap[p].ratio < this.heap[c].ratio) {
            this.swap(p ,c);
            c = this.parent(c);
            p = this.parent(c);
        }
    }
    extractMax() {
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
    return new Promise((resolve) => {
        const recipesArray = [];
        fs.createReadStream("RAW_recipes.csv")
            .pipe(parse({ delimiter: ","}))
            .on("data", function (row) {
                validJSONStr = row[10].replace(/'/g, '"');
                try {
                    ingredients = JSON.parse(validJSONStr);
                } 
                catch (error) {
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
    //const recipesArray = await readRecipes(neededIngredients);

    for (let i = 0; i < recipesArray.length; i++) {
        heap.insert(recipesArray[i]);
    }

    for (let i = 0; i < recipesArray.length; i++) {
        sorted.push(heap.extractMax());
    }
    return sorted;
}
function merge(left, right) {
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
    //const recipesArray = await readRecipes(neededIngredients);
    if (recipesArray.length <= 1) {
        return recipesArray;
    }
    let middle = Math.floor(recipesArray.length / 2);
    let left = mergeSort(recipesArray.slice(0, middle));
    let right = mergeSort(recipesArray.slice(middle));
    return merge(left, right)
}
async function main() {
    const neededIngredients = ["salt", "garlic", "eggs", "onion", "water", "butter"]
    const recipesArray = await readRecipes(neededIngredients);
    var sorted = heapSort(recipesArray); // comment and uncomment as needed
    //var sorted = mergeSort(recipesArray); // comment and uncomment as needed
    console.log(sorted[0]);
    console.log(sorted[1]);
    console.log(sorted[2]);
}
main()