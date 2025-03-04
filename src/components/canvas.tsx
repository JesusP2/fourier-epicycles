import { Pane } from 'tweakpane';
const pane = new Pane({
  title: 'Config',
  expanded: true,
});
import type { MouseEvent, RefObject } from "react"
import { PARAMS } from '../pane-config';

const mouse = {
  pressed: false,
  x: 0,
  y: 0,
}

export function Canvas({ strokes, ref }: { strokes: { x: number; y: number }[]; ref: RefObject<HTMLCanvasElement | null> }) {
  function onMouseDown(event: MouseEvent<HTMLCanvasElement>) {
    mouse.pressed = true
    mouse.x = event.clientX
    mouse.y = event.clientY
  }

  function onMouseUp() {
    mouse.pressed = false
  }

  function onMouseMove(event: MouseEvent<HTMLCanvasElement>) {
    if (!mouse.pressed) return
    const canvas = ref.current

    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.beginPath()
    ctx.strokeStyle = PARAMS.drawingColor;
    ctx.lineWidth = PARAMS.drawingWidth;
    ctx.moveTo(mouse.x, mouse.y)
    ctx.lineTo(x, y)
    ctx.stroke()

    mouse.x = x
    mouse.y = y
    strokes.push({ x, y })
  }

  return <canvas className="w-full h-full" ref={ref} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} />
}
