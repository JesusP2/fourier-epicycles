import { useRef } from "react";
import { Canvas } from "./components/canvas"

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

  // Sort by amplitude (importance)
  X.sort((a, b) => b.amplitude - a.amplitude);

  return X;
}

function drawEpicycles(ctx: CanvasRenderingContext2D, x: number, y: number, fourier: FourierPoint[], time: number) {
  for (let i = 0; i < fourier.length; i++) {
    const { frequency, amplitude, phase } = fourier[i];

    const prevX = x;
    const prevY = y;

    // Calculate position based on frequency, amplitude and phase
    const phi = frequency * time + phase;
    x += amplitude * Math.cos(phi);
    y += amplitude * Math.sin(phi);

    // Draw the circle
    ctx.beginPath();
    ctx.arc(prevX, prevY, amplitude, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw the connecting line
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  return { x, y };
}



function App() {
  const ref = useRef<HTMLCanvasElement>(null)
  function onDrawingFinished() {
    const canvas = ref.current
    if (!canvas) return
    const first = strokes[0]
    const last = strokes[strokes.length - 1]
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.beginPath()
    ctx.strokeStyle = "#00ff00"
    ctx.lineWidth = 5
    ctx.moveTo(first.x, first.y)
    ctx.lineTo(last.x, last.y)
    ctx.stroke()

    fourierX = computeDFT(strokes);
    animate();
  }

  function animate() {
    const canvas = ref.current
    const ctx = canvas?.getContext("2d")
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Use the first point of the original drawing instead of canvas center
    const x = strokes[0].x;
    const y = strokes[0].y;

    // Calculate and draw epicycles
    const point = drawEpicycles(ctx, x, y, fourierX, time);

    // Add the current endpoint to the path
    path.push(point);

    // Draw the path
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.stroke();

    // Increment time 
    time += (2 * Math.PI) / fourierX.length;

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
