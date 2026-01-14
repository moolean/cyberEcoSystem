import { Simulation } from "./Simulation.js"

import { coloredText } from "./utils.js"

console.log(coloredText("🌍 Starting Virtual Ecosystem Simulator...", "cyan"))
console.log()

const simulation = new Simulation()
simulation.start()
