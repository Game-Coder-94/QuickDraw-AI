import React, { useRef, useState, useEffect } from "react";

export default function App() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lineWidth, setLineWidth] = useState(30);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [prediction, setPrediction] = useState(null);
  const [probs, setProbs] = useState(null);

  // Canvas drawing size (CSS pixels)
  const CANVAS_SIZE = 280;

  // Initialize canvas (DPR-aware) and fill white background
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const DPR = window.devicePixelRatio || 1;
    canvas.width = CANVAS_SIZE * DPR;
    canvas.height = CANVAS_SIZE * DPR;
    canvas.style.width = `${CANVAS_SIZE}px`;
    canvas.style.height = `${CANVAS_SIZE}px`;

    ctx.setTransform(1, 0, 0, 1, 0, 0); // reset
    ctx.scale(DPR, DPR);

    // Fill white background (in CSS pixels after scaling)
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // default stroke settings (don't reference external state here to avoid eslint dependency warnings)
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []); // run once

  // helper to get mouse/touch coords relative to canvas (CSS pixels)
  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    setIsDrawing(true);
    // prevent scrolling on touch
    if (e.preventDefault) e.preventDefault();
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    // Keep path alive so stroke doesn't jump
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    if (e.preventDefault) e.preventDefault();
  };

  const stopDrawing = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.stroke();
    ctx.beginPath();
    setIsDrawing(false);
    if (e && e.preventDefault) e.preventDefault();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const DPR = window.devicePixelRatio || 1;

    // reset transform and rescale to avoid accumulation
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    canvas.width = CANVAS_SIZE * DPR; // clearing by resetting width
    canvas.height = CANVAS_SIZE * DPR;
    ctx.scale(DPR, DPR);

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;

    setPrediction(null);
    setProbs(null);
  };

  // Update stroke color or width live
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = strokeColor;
  }, [strokeColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = lineWidth;
  }, [lineWidth]);

  // Convert canvas content to data URL and POST to backend
  const handlePredict = async () => {
    const canvas = canvasRef.current;
    // ensure we send the full-resolution pixel data (toDataURL uses canvas pixel buffer)
    const imageData = canvas.toDataURL("image/png");
    console.log("Sending imageData length:", imageData.length);

    try {
      const response = await fetch("https://quickdraw-ai-ja90.onrender.com/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image_data: imageData }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Server error:", response.status, text);
        return;
      }

      const data = await response.json();
      // Backend returns { predicted_digit, probs, top3 }
      setPrediction(data.predicted_digit ?? data.predicted ?? null);
      setProbs(data.probs ?? null);
      console.log("Prediction response:", data);
    } catch (err) {
      console.error("Error sending request:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center p-6 bg-gray-100">
      <div className="w-full max-w-xl bg-white p-6 rounded-2xl shadow">
        <h1 className="text-2xl font-bold text-center mb-4">Digit Recognizer</h1>

        <div className="flex flex-col items-center gap-4">
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="border border-gray-300 rounded-md touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            style={{ cursor: "crosshair" }}
          />

          <div className="w-full flex flex-col items-center gap-2">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Line Width: {lineWidth}px</label>
              <input
                id="lineWidth"
                type="range"
                min={20}
                max={60}
                value={lineWidth}
                onChange={(e) => setLineWidth(Number(e.target.value))}
                className=""
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Pen Color:</label>
              <input
                id="stroke"
                type="color"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
                title="Choose pen color"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={clearCanvas}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
            >
              Clear
            </button>

            <button
              onClick={handlePredict}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
            >
              Predict
            </button>
          </div>

          {prediction !== null && (
            <div className="mt-3 text-lg font-semibold">
              Predicted Digit: <span className="text-blue-600">{prediction}</span>
              {probs && (
                <div className="text-sm mt-2">
                  Probabilities: {probs.map((p, i) => `${i}:${p.toFixed(3)}`).join(" ")}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
