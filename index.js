const canvas = document.getElementById('drawing-board');
const toolbar = document.getElementById('toolbar');
const ctx = canvas.getContext('2d');

const canvasOffsetX = canvas.offsetLeft;
const canvasOffsetY = canvas.offsetTop;

// This sets up the canvas dimensions to match the window
canvas.width = window.innerWidth - canvasOffsetX;
canvas.height = window.innerHeight - canvasOffsetY;

let isPainting = false;
let lineWidth = 5;

toolbar.addEventListener('click', e => {
    if (e.target.id === 'clear') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Reset the stroke color to black when the canvas is cleared
        ctx.strokeStyle = '#000000'; 
    }
});

toolbar.addEventListener('change', e => {
    if(e.target.id === 'stroke') {
        ctx.strokeStyle = e.target.value;
    }
    if(e.target.id === 'lineWidth') {
        lineWidth = e.target.value;
    }
});

// This function draws the line
const draw = (e) => {
    if(!isPainting) {
        return;
    }
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineTo(e.clientX - canvasOffsetX, e.clientY - canvasOffsetY);
    ctx.stroke();
}

// This starts a new drawing path on mousedown
canvas.addEventListener('mousedown', (e) => {
    isPainting = true;
    ctx.beginPath();
    ctx.moveTo(e.clientX - canvasOffsetX, e.clientY - canvasOffsetY);
});

// This ends the drawing path on mouseup
canvas.addEventListener('mouseup', e => {
    isPainting = false;
    ctx.stroke();
});

// This handles the drawing motion
canvas.addEventListener('mousemove', draw);

// This function sends the prediction request
async function sendPredictionRequest() {
    // Get the canvas element by its correct ID
    const canvas = document.getElementById('drawing-board');

    // Convert the canvas content to a base64 encoded string
    const imageData = canvas.toDataURL('image/png');

    // The URL of your local FastAPI API
    const apiUrl = 'http://127.0.0.1:8000/predict';

    const payload = {
        image_data: imageData
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const result = await response.json();
        console.log('Prediction:', result.predicted_digit);

        // This uses the correct template literal syntax
        document.getElementById('result-div').innerText = `Prediction: ${result.predicted_digit}`;

    } catch (error) {
        console.error('Error', error);
    }
}

document.getElementById('predictButton').addEventListener('click', sendPredictionRequest);