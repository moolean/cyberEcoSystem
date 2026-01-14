import { coloredText, createTable, clearScreen, getTerminalWidth } from "./utils.js"

export class TerminalUI {
  constructor() {
    this.width = getTerminalWidth()
    this.height = process.stdout.rows || 24
    this.currentView = "overview"
    this.logs = []
    this.maxLogs = 50
    this.sortBy = "name"
    this.sortOrder = "asc"
    this.lastRender = 0
    this.fps = 0
    this.frameCount = 0
    this.fpsUpdateTime = 0
    this.cursor = { x: 0, y: 0 }
    this.scrollOffset = 0
    this.views = {
      "1": "overview",
      "2": "animals", 
      "3": "statistics",
      "4": "rules",
      "5": "performance"
    }
  }

  clear() {
    clearScreen()
  }

  moveTo(x, y) {
    process.stdout.write(`\x1b[${y};${x}H`)
  }

  clearLine() {
    process.stdout.write('\x1b[K')
  }

  hideCursor() {
    process.stdout.write('\x1b[?25l')
  }

  showCursor() {
    process.stdout.write('\x1b[?25h')
  }

  updateFPS() {
    const now = Date.now()
    this.frameCount++
    
    if (now - this.fpsUpdateTime >= 1000) {
      this.fps = this.frameCount
      this.frameCount = 0
      this.fpsUpdateTime = now
    }
  }

  drawHeader(ecosystem) {
    const stats = ecosystem.getStatistics()
    const seasonEmoji = {
      spring: "🌸",
      summer: "☀️",
      autumn: "🍂",
      winter: "❄️",
    }

    const timeOfDay = this.getTimeOfDay(stats.time)
    const timeEmoji = {
      dawn: "🌅",
      day: "☀️",
      dusk: "🌆",
      night: "🌙"
    }

    this.moveTo(1, 1)
    console.log(coloredText("=".repeat(this.width), "cyan"))
    this.moveTo(1, 2)
    console.log(coloredText("🌍 VIRTUAL ECOSYSTEM SIMULATOR 🌍", "bold"))
    this.moveTo(1, 3)
    console.log(coloredText("=".repeat(this.width), "cyan"))
    
    this.moveTo(1, 4)
    console.log(coloredText(`Season: ${seasonEmoji[stats.season]} ${stats.season.toUpperCase()} | Time: ${timeEmoji[timeOfDay]} ${timeOfDay.toUpperCase()} | FPS: ${this.fps}`, "yellow"))
    this.moveTo(1, 5)
    console.log(coloredText(`Tick: ${stats.time} | View: ${this.currentView.toUpperCase()} | Animals: ${stats.total}`, "blue"))
    console.log()
  }

  getTimeOfDay(time) {
    const hour = (time % 240) / 10
    if (hour >= 5 && hour < 8) return "dawn"
    if (hour >= 8 && hour < 18) return "day"
    if (hour >= 18 && hour < 21) return "dusk"
    return "night"
  }

  drawStatistics(ecosystem) {
    const stats = ecosystem.getStatistics()

    const headers = ["Metric", "Value"]
    const data = [
      ["Total Animals", stats.total],
      ["Herbivores 🌱", stats.herbivores],
      ["Carnivores 🦁", stats.carnivores],
      ["Omnivores 🐻", stats.omnivores],
      ["Food Available", stats.food],
      ["Avg Energy", `${Math.round(stats.averageEnergy)}%`],
      ["Avg Health", `${Math.round(stats.averageHealth)}%`],
      ["Avg Age", Math.round(stats.averageAge)],
    ]

    console.log(coloredText("📊 ECOSYSTEM STATISTICS", "bold"))
    console.log(createTable(headers, data))
    console.log()
  }

  drawAnimals(ecosystem) {
    const animals = ecosystem.animals.slice(0, 20)

    if (animals.length === 0) {
      console.log(coloredText("❌ No animals alive in the ecosystem!", "red"))
      return
    }

    const headers = ["Name", "Species", "Energy", "Health", "Age", "Status"]
    const data = animals.map((animal) => {
      const status = animal.alive ? "✓ Alive" : "✗ Dead"

      const speciesEmoji = {
        herbivore: "🌱",
        carnivore: "🦁",
        omnivore: "🐻",
      }

      return [
        animal.name,
        `${speciesEmoji[animal.species]} ${animal.species}`,
        `${Math.round(animal.energy)}%`,
        `${Math.round(animal.health)}%`,
        `${Math.round(animal.age)}`,
        status,
      ]
    })

    console.log(coloredText("🐾 ANIMAL STATUS", "bold"))
    console.log(createTable(headers, data))

    if (ecosystem.animals.length > 20) {
      console.log(coloredText(`... and ${ecosystem.animals.length - 20} more animals`, "white"))
    }
    console.log()
  }

  drawRules(ecosystem) {
    this.moveTo(1, 7)
    console.log(coloredText("⚙️  ECOSYSTEM RULES", "bold"))

    const rules = ecosystem.rules
    const headers = ["Rule", "Value"]
    const basicData = [
      ["Mode", ecosystem.mode.toUpperCase()],
      ["Energy Decay", `${rules.energyDecay}/tick`],
      ["Health Decay", `${rules.healthDecay}/tick`],
      ["Food Spawn Rate", `${(rules.foodSpawnRate * 100).toFixed(0)}%`],
      ["Max Food", rules.maxFood],
      ["Climate", rules.climate],
      ["Disaster Chance", `${(rules.disasterChance * 100).toFixed(1)}%`],
    ]

    const advancedData = ecosystem.mode === "advanced" ? [
      ["Reproduction Threshold", `${rules.reproductionThreshold}%`],
      ["Aging Rate", rules.agingRate.toString()],
      ["Predation Efficiency", `${(rules.predationEfficiency * 100).toFixed(0)}%`],
      ["Disease Spread", `${(rules.diseaseSpread * 100).toFixed(0)}%`],
      ["Migration Pattern", rules.migrationPattern ? "Enabled" : "Disabled"],
      ["Competition Factor", `${(rules.competitionFactor * 100).toFixed(0)}%`],
      ["Weather Variability", `${(rules.weatherVariability * 100).toFixed(0)}%`],
      ["Resource Regeneration", `${(rules.resourceRegeneration * 100).toFixed(0)}%`]
    ] : []

    this.moveTo(1, 9)
    console.log(createTable(headers, basicData))
    
    if (advancedData.length > 0) {
      this.moveTo(1, 17)
      console.log(coloredText("🔬 ADVANCED PARAMETERS", "bold"))
      this.moveTo(1, 19)
      console.log(createTable(headers, advancedData))
    }
  }

  drawControls() {
    const controls = [
      "[Space] Pause/Resume",
      "[1-5] Switch Views", 
      "[R] Rules",
      "[M] Mode",
      "[Q] Quit",
      "[↑↓] Scroll",
      "[S] Sort"
    ]
    
    this.moveTo(1, this.height - 2)
    console.log(coloredText("🎮 CONTROLS", "bold"))
    this.moveTo(1, this.height - 1)
    console.log(coloredText(controls.join("  "), "white"))
  }

  drawPerformanceView(ecosystem) {
    const stats = ecosystem.getStatistics()
    
    this.moveTo(1, 7)
    console.log(coloredText("⚡ PERFORMANCE METRICS", "bold"))
    
    const perfData = [
      ["FPS", this.fps.toString()],
      ["Update Interval", "1000ms"],
      ["Animals Processed", stats.total.toString()],
      ["Food Items", stats.food.toString()],
      ["Memory Usage", `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`],
      ["CPU Time", `${(process.cpuUsage().user / 1000000).toFixed(2)}s`]
    ]
    
    this.moveTo(1, 9)
    console.log(createTable(["Metric", "Value"], perfData))
  }

  switchView(viewNumber) {
    if (this.views[viewNumber]) {
      this.currentView = this.views[viewNumber]
      this.scrollOffset = 0
      return true
    }
    return false
  }

  draw(ecosystem) {
    this.updateFPS()
    this.clear()
    this.hideCursor()
    
    this.drawHeader(ecosystem)
    
    switch (this.currentView) {
      case "overview":
        this.drawStatistics(ecosystem)
        this.drawAnimals(ecosystem)
        this.drawRules(ecosystem)
        break
      case "animals":
        this.drawDetailedAnimals(ecosystem)
        break
      case "statistics":
        this.drawDetailedStatistics(ecosystem)
        break
      case "rules":
        this.drawDetailedRules(ecosystem)
        break
      case "performance":
        this.drawPerformanceView(ecosystem)
        break
    }
    
    this.drawControls()
    this.showCursor()
  }

  drawDetailedAnimals(ecosystem) {
    const animals = ecosystem.animals.slice(this.scrollOffset, this.scrollOffset + 15)
    
    this.moveTo(1, 7)
    console.log(coloredText("🐾 DETAILED ANIMAL STATUS", "bold"))
    
    if (animals.length === 0) {
      console.log(coloredText("❌ No animals to display!", "red"))
      return
    }
    
    const headers = ["Name", "Species", "Energy", "Health", "Age", "Pos", "Behavior"]
    const data = animals.map((animal) => {
      const behavior = this.getAnimalBehavior(animal, ecosystem)
      return [
        animal.name,
        animal.species,
        `${Math.round(animal.energy)}%`,
        `${Math.round(animal.health)}%`,
        `${Math.round(animal.age)}`,
        `(${Math.round(animal.position.x)},${Math.round(animal.position.y)})`,
        behavior
      ]
    })
    
    this.moveTo(1, 9)
    console.log(createTable(headers, data))
    
    if (ecosystem.animals.length > 15) {
      this.moveTo(1, this.height - 4)
      console.log(coloredText(`Showing ${this.scrollOffset + 1}-${Math.min(this.scrollOffset + 15, ecosystem.animals.length)} of ${ecosystem.animals.length}`, "white"))
    }
  }

  drawDetailedStatistics(ecosystem) {
    const stats = ecosystem.getStatistics()
    
    this.moveTo(1, 7)
    console.log(coloredText("📊 DETAILED STATISTICS", "bold"))
    
    const basicData = [
      ["Total Animals", stats.total.toString()],
      ["Herbivores", stats.herbivores.toString()],
      ["Carnivores", stats.carnivores.toString()],
      ["Omnivores", stats.omnivores.toString()],
      ["Food Available", stats.food.toString()],
      ["Avg Energy", `${Math.round(stats.averageEnergy)}%`],
      ["Avg Health", `${Math.round(stats.averageHealth)}%`],
      ["Avg Age", Math.round(stats.averageAge).toString()]
    ]
    
    const advancedData = ecosystem.mode === "advanced" ? [
      ["Mode", ecosystem.mode.toUpperCase()],
      ["Reproduction Threshold", `${ecosystem.rules.reproductionThreshold}%`],
      ["Aging Rate", ecosystem.rules.agingRate.toString()],
      ["Predation Efficiency", `${(ecosystem.rules.predationEfficiency * 100).toFixed(0)}%`],
      ["Disease Spread", `${(ecosystem.rules.diseaseSpread * 100).toFixed(0)}%`],
      ["Competition Factor", `${(ecosystem.rules.competitionFactor * 100).toFixed(0)}%`],
      ["Weather Variability", `${(ecosystem.rules.weatherVariability * 100).toFixed(0)}%`],
      ["Resource Regeneration", `${(ecosystem.rules.resourceRegeneration * 100).toFixed(0)}%`]
    ] : []
    
    this.moveTo(1, 9)
    console.log(createTable(["Metric", "Value"], basicData))
    
    if (advancedData.length > 0) {
      this.moveTo(1, 18)
      console.log(coloredText("⚙️ ADVANCED RULES", "bold"))
      this.moveTo(1, 20)
      console.log(createTable(["Rule", "Value"], advancedData))
    }
  }

  getAnimalBehavior(animal, ecosystem) {
    const timeOfDay = this.getTimeOfDay(ecosystem.time)
    const behaviors = {
      herbivore: {
        dawn: "foraging",
        day: "grazing", 
        dusk: "resting",
        night: "sleeping"
      },
      carnivore: {
        dawn: "hunting",
        day: "patrolling",
        dusk: "stalking", 
        night: "hunting"
      },
      omnivore: {
        dawn: "foraging",
        day: "opportunistic",
        dusk: "gathering",
        night: "resting"
      }
    }
    
    return behaviors[animal.species]?.[timeOfDay] || "active"
  }

  drawMessage(message, type = "info") {
    const colors = {
      info: "blue",
      success: "green",
      warning: "yellow",
      error: "red",
    }

    console.log(coloredText(`📢 ${message}`, colors[type]))
    console.log()
  }
}
