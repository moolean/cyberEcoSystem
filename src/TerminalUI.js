import { coloredText, createTable, clearScreen, getTerminalWidth } from "./utils.js"

export class TerminalUI {
  constructor() {
    this.width = getTerminalWidth()
    this.height = process.stdout.rows || 24
    this.currentView = "animals"
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
    this.buffer = []
    this.lastBuffer = []
    this.initialized = false
    this.views = {
      "1": "animals", 
      "2": "statistics",
      "3": "rules",
      "4": "ecosystem",
      "5": "performance"
    }
  }

  clear() {
    if (!this.initialized) {
      process.stdout.write('\x1b[2J\x1b[H')
      this.initialized = true
    } else {
      clearScreen()
    }
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

  renderBuffer() {
    // Only update changed lines for smooth rendering
    for (let i = 0; i < this.buffer.length; i++) {
      if (this.lastBuffer[i] !== this.buffer[i]) {
        this.moveTo(1, i + 1)
        this.clearLine()
        process.stdout.write(this.buffer[i])
      }
    }
    
    // Clear any leftover lines from previous render
    if (this.lastBuffer.length > this.buffer.length) {
      for (let i = this.buffer.length; i < this.lastBuffer.length; i++) {
        this.moveTo(1, i + 1)
        this.clearLine()
      }
    }
    
    this.lastBuffer = [...this.buffer]
    
    // Ensure cursor is hidden at the end
    this.hideCursor()
  }

  addToBuffer(line) {
    this.buffer.push(line)
  }

  moveTo(x, y) {
    process.stdout.write(`\x1b[${y};${x}H`)
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

  drawHeader(ecosystem, paused = false) {
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

    const separator = "=".repeat(this.width)
    const pausedText = paused ? coloredText(" [PAUSED]", "yellow") : ""
    
    this.addToBuffer(coloredText(separator, "cyan"))
    this.addToBuffer(coloredText("  🌍 VIRTUAL ECOSYSTEM SIMULATOR 🌍", "bold") + pausedText)
    this.addToBuffer(coloredText(separator, "cyan"))
    this.addToBuffer(coloredText(`  Season: ${seasonEmoji[stats.season]} ${stats.season.toUpperCase()} | Time: ${timeEmoji[timeOfDay]} ${timeOfDay.toUpperCase()} | FPS: ${this.fps}`, "yellow"))
    this.addToBuffer(coloredText(`  Tick: ${stats.time} | View: ${this.currentView.toUpperCase()} (Press 1-5) | Animals: ${stats.total}`, "blue"))
    this.addToBuffer("")
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

    this.addToBuffer(coloredText("  📊 ECOSYSTEM STATISTICS", "bold"))
    this.addToBuffer("")

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

    const table = createTable(headers, data)
    table.split('\n').forEach(line => this.addToBuffer("  " + line))
    this.addToBuffer("")
  }

  drawAnimals(ecosystem) {
    const maxDisplay = Math.min(20, this.height - 10)
    const animals = ecosystem.animals.slice(this.scrollOffset, this.scrollOffset + maxDisplay)

    if (animals.length === 0) {
      this.addToBuffer(coloredText("  ❌ No animals alive in the ecosystem!", "red"))
      return
    }

    this.addToBuffer(coloredText("  🐾 ANIMAL STATUS", "bold"))
    this.addToBuffer("")

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

    const table = createTable(headers, data)
    table.split('\n').forEach(line => this.addToBuffer("  " + line))

    if (ecosystem.animals.length > maxDisplay) {
      this.addToBuffer("")
      this.addToBuffer(coloredText(`  Showing ${this.scrollOffset + 1}-${Math.min(this.scrollOffset + maxDisplay, ecosystem.animals.length)} of ${ecosystem.animals.length} | Use ↑↓ to scroll`, "white"))
    }
    this.addToBuffer("")
  }

  drawRules(ecosystem) {
    this.addToBuffer(coloredText("  ⚙️  ECOSYSTEM RULES", "bold"))
    this.addToBuffer("")

    const rules = ecosystem.rules
    const headers = ["Rule", "Value"]
    const data = [
      ["Mode", ecosystem.mode.toUpperCase()],
      ["Energy Decay", `${(rules.energyDecay || 0).toFixed(2)}/tick`],
      ["Health Decay", `${rules.healthDecay || 0}/tick`],
      ["Food Spawn Rate", `${((rules.foodSpawnRate || 0) * 100).toFixed(0)}%`],
      ["Max Food", rules.maxFood || 0],
      ["Climate", rules.climate || "unknown"],
      ["Season", rules.season || "unknown"],
      ["Disaster Chance", `${((rules.disasterChance || 0) * 100).toFixed(1)}%`],
    ]

    if (ecosystem.mode === "advanced") {
      data.push(
        ["Reproduction Threshold", `${rules.reproductionThreshold || 0}%`],
        ["Aging Rate", (rules.agingRate || 0).toString()],
        ["Predation Efficiency", `${((rules.predationEfficiency || 0) * 100).toFixed(0)}%`],
        ["Disease Spread", `${((rules.diseaseSpread || 0) * 100).toFixed(0)}%`],
        ["Migration Pattern", rules.migrationPattern ? "Enabled" : "Disabled"],
        ["Competition Factor", `${((rules.competitionFactor || 0) * 100).toFixed(0)}%`],
        ["Weather Variability", `${((rules.weatherVariability || 0) * 100).toFixed(0)}%`],
        ["Resource Regeneration", `${((rules.resourceRegeneration || 0) * 100).toFixed(0)}%`]
      )
    }

    const table = createTable(headers, data)
    table.split('\n').forEach(line => this.addToBuffer("  " + line))
    this.addToBuffer("")
  }

  drawControls() {
    const controls = [
      "[Space] Pause",
      "[1-5] Switch Views", 
      "[R] Edit Rules",
      "[M] Toggle Mode",
      "[Q] Quit",
      "[↑↓] Scroll",
      "[S] Sort"
    ]
    
    const separator = "=".repeat(this.width)
    this.addToBuffer(coloredText(separator, "cyan"))
    this.addToBuffer(coloredText("  🎮 CONTROLS: " + controls.join(" • "), "white"))
  }

  drawPerformanceView(ecosystem) {
    const stats = ecosystem.getStatistics()
    
    this.addToBuffer(coloredText("  ⚡ PERFORMANCE METRICS", "bold"))
    this.addToBuffer("")
    
    const perfData = [
      ["FPS", this.fps.toString()],
      ["Update Interval", "1000ms"],
      ["Animals Processed", stats.total.toString()],
      ["Food Items", stats.food.toString()],
      ["Memory Usage", `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`],
      ["CPU Time", `${(process.cpuUsage().user / 1000000).toFixed(2)}s`],
      ["Total Ticks", stats.time.toString()],
      ["Current Season", stats.season]
    ]
    
    const table = createTable(["Metric", "Value"], perfData)
    table.split('\n').forEach(line => this.addToBuffer("  " + line))
    this.addToBuffer("")
  }

  drawEcosystemView(ecosystem) {
    const stats = ecosystem.getStatistics()
    
    this.addToBuffer(coloredText("  🌍 ECOSYSTEM OVERVIEW", "bold"))
    this.addToBuffer("")
    
    const data = [
      ["Population", stats.total.toString()],
      ["Herbivores", `${stats.herbivores} 🌱`],
      ["Carnivores", `${stats.carnivores} 🦁`],
      ["Omnivores", `${stats.omnivores} 🐻`],
      ["Food Supply", stats.food.toString()],
      ["Avg Energy", `${Math.round(stats.averageEnergy)}%`],
      ["Avg Health", `${Math.round(stats.averageHealth)}%`],
      ["Avg Age", Math.round(stats.averageAge).toString()],
      ["Season", `${stats.season} ${this.getSeasonEmoji(stats.season)}`],
      ["Time of Day", this.getTimeOfDay(stats.time)],
      ["Climate", ecosystem.rules.climate],
      ["Ticks Elapsed", stats.time.toString()],
    ]
    
    const table = createTable(["Attribute", "Value"], data)
    table.split('\n').forEach(line => this.addToBuffer("  " + line))
    this.addToBuffer("")
  }

  getSeasonEmoji(season) {
    const seasonEmoji = {
      spring: "🌸",
      summer: "☀️",
      autumn: "🍂",
      winter: "❄️",
    }
    return seasonEmoji[season] || "🌍"
  }

  switchView(viewNumber) {
    if (this.views[viewNumber]) {
      this.currentView = this.views[viewNumber]
      this.scrollOffset = 0
      return true
    }
    return false
  }

  draw(ecosystem, paused = false) {
    this.updateFPS()
    
    // Reset buffer to build fresh screen content
    // The renderBuffer() method will compare with lastBuffer for differential updates
    this.buffer = []
    this.hideCursor()
    
    this.drawHeader(ecosystem, paused)
    
    // Each view shows only ONE table
    switch (this.currentView) {
      case "animals":
        this.drawAnimals(ecosystem)
        break
      case "statistics":
        this.drawStatistics(ecosystem)
        break
      case "rules":
        this.drawRules(ecosystem)
        break
      case "ecosystem":
        this.drawEcosystemView(ecosystem)
        break
      case "performance":
        this.drawPerformanceView(ecosystem)
        break
    }
    
    this.drawControls()
    
    // Render only changed lines for smooth updates
    this.renderBuffer()
    this.showCursor()
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
    // Messages are shown inline within the buffer
    const colors = {
      info: "blue",
      success: "green",
      warning: "yellow",
      error: "red",
    }
    
    // Add message to buffer if we're currently rendering
    if (this.buffer.length > 0) {
      this.addToBuffer("")
      this.addToBuffer(coloredText(`  📢 ${message}`, colors[type]))
      this.addToBuffer("")
    }
  }
}
