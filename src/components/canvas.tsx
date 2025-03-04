import type { MouseEvent, RefObject } from "react"

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
    ctx.strokeStyle = "#00ff00"
    ctx.lineWidth = 5
    ctx.moveTo(mouse.x, mouse.y)
    ctx.lineTo(x, y)
    ctx.stroke()

    mouse.x = x
    mouse.y = y
    strokes.push({ x, y })
  }

  return <canvas height={window.innerHeight} width={window.innerWidth} className="w-full h-full" ref={ref} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} />
}
