import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eraser, PenTool } from "lucide-react";

export default function DigitRecognizer() {
  const canvasRef = useRef(null);
  const [prediction, setPrediction] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lineWidth, setLineWidth] = useState(40);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.strokeStyle = "black";
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setPrediction(null);
  };

  const handlePredict = async () => {
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL("image/png");

    try {
      const response = await fetch("http://localhost:8000/predict/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imageData }),
      });

      const data = await response.json();
      setPrediction(data.prediction);
    } catch (error) {
      console.error("Error sending request:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-lg shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Digit Recognizer
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <canvas
            ref={canvasRef}
            width={280}
            height={280}
            className="border-2 border-gray-400 rounded-lg bg-white"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />

          <div className="w-full flex flex-col items-center gap-2">
            <label className="text-sm font-medium">Line Width: {lineWidth}px</label>
            <input
              type="range"
              min="40"
              max="100"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="w-3/4"
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={clearCanvas} variant="destructive">
              <Eraser className="w-4 h-4 mr-2" /> Clear
            </Button>
            <Button onClick={handlePredict}>
              <PenTool className="w-4 h-4 mr-2" /> Predict
            </Button>
          </div>

          {prediction !== null && (
            <div className="mt-3 text-lg font-semibold">
              Predicted Digit: <span className="text-blue-600">{prediction}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}