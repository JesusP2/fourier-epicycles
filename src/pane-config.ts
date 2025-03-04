import { Pane } from "tweakpane"

export const PARAMS = {
  frameRate: 60,
  pointsPerSegment: 1,
  drawingColor: "#000000",
  drawingWidth: 5,
  epicycleColor: "#00ff00",
  epicycleWidth: 2,
}

const pane = new Pane({
  title: "Config",
  expanded: true,
})
pane.addBinding(PARAMS, "frameRate")
pane.addBinding(PARAMS, "pointsPerSegment")
pane.addBinding(PARAMS, "drawingColor")
pane.addBinding(PARAMS, "drawingWidth")
pane.addBinding(PARAMS, "epicycleColor")
pane.addBinding(PARAMS, "epicycleWidth")
