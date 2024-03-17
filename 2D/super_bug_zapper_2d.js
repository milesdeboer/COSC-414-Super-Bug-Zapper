var VSHADER_SOURCE =
    'precision mediump float;\n' +
    'attribute vec4 a_Position;\n' +
    'attribute vec3 a_Color;\n' +
    'varying vec3 fragmentColor;\n' +
    'void main() {\n' +
    '   fragmentColor = a_Color;\n' +
    '   gl_Position = a_Position;\n' +
    '}\n';

var FSHADER_SOURCE = 
    'precision mediump float;\n' +
    'varying vec3 fragmentColor;\n' +
    'void main() {\n' +
    '   gl_FragColor = vec4(fragmentColor, 1.0);\n' +
    '}\n';

var GROWING_RATE = 0.03;    
var GROWING_LIMIT = 0.5;

var bacteriaCenters = [];  
var bacteriaVisibility = [];   
var currentScale = 0.01; 
var score = 0;
var lost = false;

function main() {
    // Get the canvas element from the HTML
    var canvas = document.getElementById('canvas');

    // Get the WebGL rendering context
    var gl = getWebGLContext(canvas);
    if (!gl) {
        // If failed to get the context, log an error and exit
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Set the clear color for the canvas
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Initialize shaders and check for success
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // Generate initial positions for bacteria
    bacteriaCenters = generateBacteriaStartLocations();
    // Generate colors for bacteria
    var bacteriaColors = generateBacteriaColors();

    // Initialize visibility array for bacteria
    for (var i = 0; i < bacteriaCenters.length; i+=2){
        bacteriaVisibility[i/2] = true;
    }

    // Event listener for mouse clicks on canvas
    canvas.onmousedown = function(ev) { click(ev, canvas); };

    // Animation loop
    var tick = function() {
        // Check if the current scale reaches the growing limit
        if (currentScale >= GROWING_LIMIT)
            isGameWon();
        else
            // Otherwise, continue animating
            currentScale = animate(currentScale);
        // Draw the scene
        draw(gl, currentScale, bacteriaCenters, bacteriaColors);
        // Request the next animation frame
        requestAnimationFrame(tick, canvas);
    }
    // Start the animation loop
    tick();
}

// Function to draw a bacteria at a specified location with a given color and scale
function drawBacteria(gl, x, y, colorArray, scale) {
    // Generate vertices for the bacteria circle based on the location and scale
    var vertices = generateBacteriaVertices(x, y, scale);
    // Extract the colors for the bacteria from the color array
    var colors = colorArray;

    // Initialize vertex and color buffers
    let n = initVertexBuffers(gl, vertices, vertices.length / 2);
    let m = initColorBuffers(gl, colors, colors.length);
    
    // Check if initialization was successful
    if (n < 0 || m < 0) {
        console.log('Failed to set the positions/colors of the vertices for the bacteria circle.');
        return;
    }

    // Draw the bacteria circle using triangle fan primitive
    gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length / 2);
}

// Function to draw the scene
function draw(gl, currentSize, bacteriaLocations, bacteriaColors) {
    // Store the current scale
    var scale = currentSize;

    // Clear the color buffer with the specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw the background disk
    drawDisk(gl);

    // Loop through all bacteria locations
    for (var i = 0; i < bacteriaLocations.length; i += 2) {
        // Check if the bacteria at this location should be visible
        if (bacteriaVisibility[i/2] === true)
            // If visible, draw the bacteria at the specified location with the corresponding color and scale
            drawBacteria(gl, bacteriaLocations[i], bacteriaLocations[i+1], bacteriaColors[i/2], scale);
    }
}

// Function to draw the background disk
function drawDisk(gl) {
    // Generate vertices for the disk circle
    var vertices = generateDiskVertices();
    // Generate colors for the disk circle
    var colors = generateCircleColors(1, 1, 1);

    // Initialize vertex and color buffers
    let n = initVertexBuffers(gl, vertices, vertices.length / 2);
    let m = initColorBuffers(gl, colors, colors.length / 3);

    // Check if initialization was successful
    if (n < 0 || m < 0) {
        console.log('Failed to set the positions or colors of the vertices for the disk circle.');
        return;
    }

    // Draw the disk circle using triangle fan primitive
    gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length / 2);
}

// Variable to store the last time when animation occurred
var g_last = Date.now();

// Function to animate the growth of the bacteria
function animate(size) {
    // Get the current time
    var now = Date.now();
    // Calculate the elapsed time since the last animation
    var elapsed = now - g_last;
    // Update the last time to the current time
    g_last = now;
    // Calculate the new size of the bacteria based on growth rate and elapsed time
    var newSize = size + (GROWING_RATE * elapsed) / 1000.0;
    // Return the new size
    return newSize;
}

// Function to generate random start locations for bacteria
function generateBacteriaStartLocations() {
    // Array to store bacteria center coordinates
    var bacteriaCenters = [];
    // Generate 10 bacteria
    for (var i = 0; i < 10; i++) {
        // Generate a random angle in radians
        var theta = (Math.floor(Math.random() * 360) + 1) * Math.PI / 180;
        // Calculate x and y coordinates based on the angle and a radius of 0.85
        var x = Math.sin(theta).toFixed(2) * 0.85;
        var y = Math.cos(theta).toFixed(2) * 0.85;
        // Add the coordinates to the bacteriaCenters array
        bacteriaCenters = bacteriaCenters.concat(x);
        bacteriaCenters = bacteriaCenters.concat(y);
    }
    // Return the array of bacteria center coordinates
    return bacteriaCenters;
}

// Function to generate vertices for a bacteria circle based on a center point, scale, and number of vertices
function generateBacteriaVertices(x, y, scale) {
    // Array to store vertices
    var vertices = [];
    // Center vertex
    var v_0 = [x, y];
    vertices = vertices.concat(v_0);
    // Loop through angles from 0 to 360 degrees
    for (var i = 0; i <= 360; i++) {
        // Calculate angle in radians
        var theta = i * Math.PI / 180;
        // Calculate vertex position based on the angle and scale
        var v = [
            x + Math.sin(theta) * scale,
            y + Math.cos(theta) * scale
        ];
        // Add the vertex to the vertices array
        vertices = vertices.concat(v);
    }
    // Return the array of vertices
    return vertices;
}

// Function to generate random colors for bacteria
function generateBacteriaColors() {
    // Array to store bacteria colors
    var bacteriaColors = [];

    // Generate colors for 10 bacteria
    for (var i = 0; i < 10; i++) {
        // Generate random red, green, and blue components
        var redIn = Math.random();
        var greenIn = Math.random();
        var blueIn = Math.random();
        // Generate colors for the bacteria using generateCircleColors function
        bacteriaColors[i] = generateCircleColors(redIn, greenIn, blueIn);
    }

    // Return the array of bacteria colors
    return bacteriaColors;
}

// Function to generate vertices for a disk circle
function generateDiskVertices() {
    // Array to store circle vertices
    var circleVertices = [];
    // Center vertex
    var v_0 = [0, 0];
    circleVertices = circleVertices.concat(v_0);
    // Loop through angles from 0 to 360 degrees
    for (var i = 0; i <= 360; i++) {
        // Calculate angle in radians
        var theta = i * Math.PI / 180;
        // Calculate vertex position on the circle boundary
        var v = [
            Math.sin(theta) * 0.85,
            Math.cos(theta) * 0.85
        ];
        // Add the vertex to the circleVertices array
        circleVertices = circleVertices.concat(v);
    }
    // Return the array of circle vertices
    return circleVertices;
}

// Function to generate colors for a circle with given red, green, and blue components
function generateCircleColors(r, g, b) {
    // Array to store colors
    var colors = [];
    // Center color
    var v_0 = [r, g, b];
    colors = colors.concat(v_0);
    // Loop through angles from 0 to 360 degrees
    for (var i = 0; i <= 360; i++) {
        // Create a color with the same red, green, and blue components
        var v = [r, g, b];
        // Add the color to the colors array
        colors = colors.concat(v);
    }
    // Return the array of colors
    return colors;
}

// Function to initialize vertex buffers
function initVertexBuffers(gl, vertexArray, numVertices) {
    // Convert vertex array to Float32Array
    var vertices = new Float32Array(vertexArray);
    // Number of vertices
    var n = numVertices;

    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create vertex buffer');
        return -1;
    }

    // Bind the buffer object to the target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Write data into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Get the storage location of a_Position
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }
    // Assign the buffer object to the attribute variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    // Return the number of vertices
    return n;
}

// Function to initialize color buffers
function initColorBuffers(gl, colorArray, numVertices) {
    // Convert color array to Float32Array
    var colors = new Float32Array(colorArray);
    // Number of vertices
    var n = numVertices;

    // Create a buffer object
    var colorBuffer = gl.createBuffer();
    if (!colorBuffer) {
        console.log('Failed to create the color buffer');
        return -1;
    }

    // Bind the buffer object to the target
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    // Write data into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    // Get the storage location of a_Color
    var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if (a_Color < 0) {
        console.log('Failed to get the storage location of a_Color');
        return -1;
    }

    // Assign the buffer object to the attribute variable
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 0, 0);
    // Enable the assignment to a_Color variable
    gl.enableVertexAttribArray(a_Color);

    // Return the number of vertices
    return n;
}

// Function to handle mouse clicks on the canvas
function click(ev, canvas) {
    // Get the score element from the HTML
    var scoreElement = document.getElementById("score");
    // Get the position of the canvas relative to the viewport
    var rect = ev.target.getBoundingClientRect();
    // Calculate the normalized device coordinates of the click position
    var cx = (ev.clientX - rect.left) / canvas.width * 2 - 1;
    var cy = (ev.clientY - rect.top) / canvas.height * (-2) + 1;
    // Calculate the points earned based on the current scale
    var points = Math.ceil((1000 / GROWING_LIMIT) * (GROWING_LIMIT - currentScale));
    // If the game is lost, return without further processing
    if (lost) return;
    // Loop through all bacteria centers
    for (var i = 0; i < bacteriaCenters.length; i += 2) {
        // Check if the click position is within the range of a bacteria and it is visible
        if (Math.sqrt(Math.pow(Math.abs(cx - bacteriaCenters[i]), 2) + Math.pow(Math.abs(cy - bacteriaCenters[i + 1]), 2)) < currentScale && bacteriaVisibility[i / 2]) {
            // Mark the bacteria as invisible
            bacteriaVisibility[i / 2] = false;
            // Update the score based on earned points
            score += points > 0 ? points : 0;
            // Update the score display in the HTML
            scoreElement.textContent = score;
            // Check if the game is won after clicking
            isGameWon();
        }
    }
}

// Function to check if the game is won or lost
function isGameWon() {
    // Get the state element from the HTML
    var stateElement = document.getElementById("state");
    // Check if all bacteria are invisible
    if (!bacteriaVisibility.includes(true)) {
        // Display "YOU WIN :)" if all bacteria are eaten
        stateElement.textContent = 'YOU WIN :)';
    } else if (currentScale >= GROWING_LIMIT) {
        // If the current scale exceeds the growing limit, mark the game as lost
        lost = true;
        // Display "YOU LOSE :(" if the game is lost
        stateElement.textContent = 'YOU LOSE :(';
    }
}