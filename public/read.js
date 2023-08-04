function displayInput() {
    const list = document.getElementById('input').value;
    const output = document.getElementById('output');
    output.innerHTML = 'You entered: ' + list;
}