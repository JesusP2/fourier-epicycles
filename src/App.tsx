import { useEffect, useRef } from "react";
import { Canvas } from "./components/canvas"
import { PARAMS } from "./pane-config";

function interpolateStrokes(originalStrokes: { x: number; y: number }[], pointsPerSegment: number) {
  // If we have fewer than 2 points, we can't interpolate
  if (originalStrokes.length < 2) return originalStrokes;

  const interpolatedStrokes = [];

  for (let i = 0; i < originalStrokes.length - 1; i++) {
    const startPoint = originalStrokes[i];
    const endPoint = originalStrokes[i + 1];

    // add the start point
    interpolatedStrokes.push(startPoint);

    // Add intermediate points
    for (let j = 1; j < pointsPerSegment; j++) {
      // Calculate t as a value between 0 and 1
      const t = j / pointsPerSegment;

      // Linear interpolation formula
      const x = startPoint.x + t * (endPoint.x - startPoint.x);
      const y = startPoint.y + t * (endPoint.y - startPoint.y);
      interpolatedStrokes.push({ x, y });
    }
  }

  interpolatedStrokes.push(originalStrokes[originalStrokes.length - 1]);
  return interpolatedStrokes;
}

type FourierPoint = {
  real: number;
  imag: number;
  amplitude: number;
  phase: number;
  frequency: number;
};

type Point = {
  x: number;
  y: number;
};

const strokes: Point[] = []
let fourierX: FourierPoint[] = []
// The trace of the drawing
const path: Point[] = [];
let time = 0;
let lastFrameTime = 0;


function computeDFT(points: { x: number; y: number }[]) {
  const N = points.length;
  const X = [];

  for (let k = 0; k < N; k++) {
    let real = 0;
    let imag = 0;

    for (let n = 0; n < N; n++) {
      const phi = (2 * Math.PI * k * n) / N;
      real += points[n].x * Math.cos(phi) + points[n].y * Math.sin(phi);
      imag += points[n].y * Math.cos(phi) - points[n].x * Math.sin(phi);
    }

    real /= N;
    imag /= N;

    const amplitude = Math.sqrt(real * real + imag * imag);
    const phase = Math.atan2(imag, real);
    const frequency = k;

    X.push({ real, imag, amplitude, phase, frequency });
  }

  X.sort((a, b) => b.amplitude - a.amplitude);

  return X;
}

function drawEpicycles(ctx: CanvasRenderingContext2D, x: number, y: number, fourier: FourierPoint[], time: number) {
  for (let i = 1; i < fourier.length; i++) {
    const { frequency, amplitude, phase } = fourier[i];

    const prevX = x;
    const prevY = y;

    // Calculate position based on frequency, amplitude and phase
    const phi = frequency * time + phase;
    x += amplitude * Math.cos(phi);
    y += amplitude * Math.sin(phi);

    ctx.beginPath();
    ctx.strokeStyle = PARAMS.epicycleColor;
    ctx.lineWidth = PARAMS.epicycleWidth;
    ctx.arc(prevX, prevY, amplitude, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.beginPath();
    // gray
    ctx.strokeStyle = 'oklch(0.553 0.013 58.071)';
    ctx.lineWidth = 2;
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  return { x, y };
}



function App() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (!ref.current) return
    const canvas = ref.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }, [ref.current])

  function onDrawingFinished() {
    fourierX = computeDFT(interpolateStrokes(strokes, PARAMS.pointsPerSegment));
    const height = fourierX[1].amplitude * 2;
    if (height > window.innerHeight) {
      if (!ref.current) return;
      const canvas = ref.current;
      canvas.height = height;
      const width = height / window.innerHeight * window.innerWidth;
      canvas.width = width;
    }
    animate();
  }

  function animate() {
    if (Date.now() - lastFrameTime < 1000 / PARAMS.frameRate) {
      requestAnimationFrame(animate);
      return;
    };
    lastFrameTime = Date.now();
    const canvas = ref.current
    const ctx = canvas?.getContext("2d")
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const x = canvas.getBoundingClientRect().x + canvas.width / 2;
    const y = canvas.getBoundingClientRect().y + canvas.height / 2;

    // Calculate and draw epicycles
    const point = drawEpicycles(ctx, x, y, fourierX, time);

    // Add the current endpoint to the path
    path.push(point);

    // Draw the path
    ctx.beginPath();
    ctx.strokeStyle = PARAMS.drawingColor;
    ctx.lineWidth = PARAMS.drawingWidth;
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.stroke();

    // Increment time 
    time += (2 * Math.PI) / (fourierX.length);

    // Reset when one cycle is complete
    if (time > 2 * Math.PI) {
      time = 0;
      path.length = 0;
    }

    requestAnimationFrame(animate);
  }

  return (
    <div>
      <Canvas ref={ref} strokes={strokes} />
      <button onClick={onDrawingFinished} className="bg-blue-500 text-white w-[144px] py-2 rounded-md absolute bottom-2 left-[calc(50%-144px)]">
        Finish Drawing
      </button>
    </div>
  )
}

export default App
