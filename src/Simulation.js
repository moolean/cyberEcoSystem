import readline from "readline"
import { Ecosystem } from "./Ecosystem.js"
import { Herbivore, Carnivore, Omnivore } from "./Animal.js"
import { TerminalUI } from "./TerminalUI.js"
import { coloredText } from "./utils.js"

export class Simulation {
  constructor(mode = "basic") {
    this.ecosystem = new Ecosystem(100, 100, mode)
    this.ui = new TerminalUI()
    this.running = false
    this.paused = false
    this.updateInterval = 1000
    this.mode = mode

    this.setupKeyboardControls()
    this.initializeEcosystem()
  }

  initializeEcosystem() {
    const animals = [
      new Herbivore(1, "Bambi"),
      new Herbivore(2, "Thumper"),
      new Herbivore(3, "Flower"),
      new Carnivore(4, "Simba"),
      new Carnivore(5, "ShereKhan"),
      new Omnivore(6, "Baloo"),
      new Omnivore(7, "Winnie"),
      new Herbivore(8, "Rabbit"),
      new Carnivore(9, "Mowgli"),
      new Omnivore(10, "Yogi"),
    ]

    animals.forEach((animal) => this.ecosystem.addAnimal(animal))

    for (let i = 0; i < 20; i++) {
      this.ecosystem.spawnFood()
    }
  }

  setupKeyboardControls() {
    if (process.stdin.setRawMode) {
      readline.emitKeypressEvents(process.stdin)
      process.stdin.setRawMode(true)

      process.stdin.on("keypress", (str, key) => {
        if (key.ctrl && key.name === "c") {
          this.stop()
          return
        }

        switch (key.name) {
          case "space":
            this.togglePause()
            break
          case "r":
            this.showRulesMenu()
            break
          case "q":
            this.stop()
            break
          case "c":
            this.ui.draw(this.ecosystem)
            break
          case "a":
            this.addRandomAnimal()
            break
          case "f":
            this.addFood()
            break
          case "d":
            this.triggerDisaster()
            break
          case "1":
          case "2":
          case "3":
          case "4":
          case "5":
            if (this.ui.switchView(key.name)) {
              // View switched successfully, no need to show message
              // Message will be visible in the header showing current view
            }
            break
          case "up":
            this.ui.scrollOffset = Math.max(0, this.ui.scrollOffset - 1)
            break
          case "down":
            this.ui.scrollOffset = Math.min(this.ecosystem.animals.length - 15, this.ui.scrollOffset + 1)
            break
          case "s":
            this.toggleSort()
            break
          case "m":
            this.toggleMode()
            break
        }
      })
    }
  }

  togglePause() {
    this.paused = !this.paused
    // Status will be shown in the next render cycle
  }

  addRandomAnimal() {
    const types = [Herbivore, Carnivore, Omnivore]
    const names = ["Leo", "Mia", "Max", "Luna", "Charlie", "Bella", "Cooper", "Lucy"]
    const Type = types[Math.floor(Math.random() * types.length)]
    const name = names[Math.floor(Math.random() * names.length)]

    const animal = new Type(Date.now(), name)
    this.ecosystem.addAnimal(animal)
    // Animal added, will be visible in next render
  }

  addFood() {
    for (let i = 0; i < 5; i++) {
      this.ecosystem.spawnFood()
    }
    // Food added, will be visible in next render
  }

  triggerDisaster() {
    const disasters = ["drought", "flood", "disease", "predator_surge"]
    const disaster = disasters[Math.floor(Math.random() * disasters.length)]

    switch (disaster) {
      case "drought":
        this.ecosystem.rules.foodSpawnRate = 0.05
        break
      case "flood":
        this.ecosystem.animals.forEach((a) => (a.health -= 20))
        break
      case "disease":
        this.ecosystem.animals.forEach((a) => {
          if (Math.random() < 0.3) a.health -= 30
        })
        break
      case "predator_surge":
        this.ecosystem.rules.energyDecay *= 1.5
        break
    }
    // Disaster triggered, effects will be visible in next render
  }

  toggleSort() {
    const sortOptions = ["name", "species", "energy", "health", "age"]
    const currentIndex = sortOptions.indexOf(this.ui.sortBy)
    this.ui.sortBy = sortOptions[(currentIndex + 1) % sortOptions.length]
    
    this.ecosystem.animals.sort((a, b) => {
      if (this.ui.sortOrder === "asc") {
        return a[this.ui.sortBy] > b[this.ui.sortBy] ? 1 : -1
      } else {
        return a[this.ui.sortBy] < b[this.ui.sortBy] ? 1 : -1
      }
    })
    // Sorted, will be visible in next render
  }

  toggleMode() {
    this.mode = this.mode === "basic" ? "advanced" : "basic"
    // Mode switched, restart to apply
  }

  async showRulesMenu() {
    this.paused = true
    
    // Clear screen for menu
    process.stdout.write('\x1b[2J\x1b[H')

    console.log(coloredText("\nAvailable rules to modify:", "yellow"))
    console.log("1. Energy Decay (current: " + this.ecosystem.rules.energyDecay.toFixed(2) + ")")
    console.log("2. Health Decay (current: " + this.ecosystem.rules.healthDecay + ")")
    console.log("3. Food Spawn Rate (current: " + this.ecosystem.rules.foodSpawnRate.toFixed(2) + ")")
    console.log("4. Max Food (current: " + this.ecosystem.rules.maxFood + ")")
    console.log("5. Disaster Chance (current: " + this.ecosystem.rules.disasterChance.toFixed(3) + ")")
    console.log("0. Exit menu")

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve))

    try {
      const choice = await question("\nEnter choice (0-5): ")

      switch (choice) {
        case "1":
          const energyDecay = parseFloat(await question("Enter new energy decay: "))
          this.ecosystem.rules.energyDecay = energyDecay
          break
        case "2":
          const healthDecay = parseFloat(await question("Enter new health decay: "))
          this.ecosystem.rules.healthDecay = healthDecay
          break
        case "3":
          const foodSpawnRate = parseFloat(await question("Enter new food spawn rate (0-1): "))
          this.ecosystem.rules.foodSpawnRate = Math.max(0, Math.min(1, foodSpawnRate))
          break
        case "4":
          const maxFood = parseInt(await question("Enter new max food: "))
          this.ecosystem.rules.maxFood = maxFood
          break
        case "5":
          const disasterChance = parseFloat(await question("Enter new disaster chance (0-1): "))
          this.ecosystem.rules.disasterChance = Math.max(0, Math.min(1, disasterChance))
          break
        case "0":
          break
        default:
          console.log("Invalid choice")
      }
    } catch (error) {
      // User cancelled
    } finally {
      rl.close()
      this.paused = false
      // Re-initialize display after menu
      this.ui.initialized = false
    }
  }

  start() {
    this.running = true
    
    // Show initial message
    process.stdout.write('\x1b[2J\x1b[H')
    console.log(coloredText("🌍 Starting Virtual Ecosystem Simulator...", "cyan"))
    console.log(coloredText("Press Space to pause, R for rules, 1-5 to switch views, Q to quit", "white"))
    console.log()
    
    setTimeout(() => {
      const gameLoop = () => {
        if (!this.running) return

        if (!this.paused) {
          this.ecosystem.update()
        }
        
        // Always render, showing current state and paused status
        this.ui.draw(this.ecosystem, this.paused)

        if (this.ecosystem.animals.length === 0) {
          this.ui.buffer = []
          this.ui.addToBuffer("")
          this.ui.addToBuffer(coloredText("  🦴 All animals have perished! Ecosystem collapsed.", "red"))
          this.ui.addToBuffer("")
          this.ui.renderBuffer()
          this.stop()
          return
        }

        setTimeout(gameLoop, this.updateInterval)
      }

      gameLoop()
    }, 2000)
  }

  stop() {
    this.running = false
    process.stdout.write('\x1b[2J\x1b[H')
    console.log(coloredText("\n🌍 Simulation stopped. Thanks for playing!", "cyan"))
    console.log()
    process.stdin.setRawMode(false)
    process.exit(0)
  }
}
