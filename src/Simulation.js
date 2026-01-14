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
              this.ui.drawMessage(`Switched to ${this.ui.currentView} view`, "success")
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
    this.ui.drawMessage(this.paused ? "Simulation paused" : "Simulation resumed", this.paused ? "warning" : "success")
  }

  addRandomAnimal() {
    const types = [Herbivore, Carnivore, Omnivore]
    const names = ["Leo", "Mia", "Max", "Luna", "Charlie", "Bella", "Cooper", "Lucy"]
    const Type = types[Math.floor(Math.random() * types.length)]
    const name = names[Math.floor(Math.random() * names.length)]

    const animal = new Type(Date.now(), name)
    this.ecosystem.addAnimal(animal)
    this.ui.drawMessage(`Added ${animal.species}: ${name}`, "success")
  }

  addFood() {
    for (let i = 0; i < 5; i++) {
      this.ecosystem.spawnFood()
    }
    this.ui.drawMessage("Added 5 food items", "success")
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

    this.ui.drawMessage(`🌩️  Disaster triggered: ${disaster}!`, "error")
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
    
    this.ui.drawMessage(`Sorting by ${this.ui.sortBy}`, "info")
  }

  toggleMode() {
    this.mode = this.mode === "basic" ? "advanced" : "basic"
    this.ui.drawMessage(`Switched to ${this.mode} mode - restart to apply`, "warning")
  }

  async showRulesMenu() {
    this.paused = true
    this.ui.drawMessage("Rules menu - modify ecosystem parameters", "info")

    console.log(coloredText("\nAvailable rules to modify:", "yellow"))
    console.log("1. Energy Decay (current: " + this.ecosystem.rules.energyDecay + ")")
    console.log("2. Health Decay (current: " + this.ecosystem.rules.healthDecay + ")")
    console.log("3. Food Spawn Rate (current: " + this.ecosystem.rules.foodSpawnRate + ")")
    console.log("4. Max Food (current: " + this.ecosystem.rules.maxFood + ")")
    console.log("5. Disaster Chance (current: " + this.ecosystem.rules.disasterChance + ")")
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
          this.ui.drawMessage("Invalid choice", "error")
      }
    } catch (error) {
      // User cancelled
    } finally {
      rl.close()
      this.paused = false
      this.ui.drawMessage("Rules updated - simulation resumed", "success")
    }
  }

  start() {
    this.running = true
    this.ui.drawMessage("Simulation started - Press Space to pause, R for rules, Q to quit", "info")

    const gameLoop = () => {
      if (!this.running) return

      if (!this.paused) {
        this.ecosystem.update()
        this.ui.draw(this.ecosystem)

        if (this.ecosystem.animals.length === 0) {
          this.ui.drawMessage("🦴 All animals have perished! Ecosystem collapsed.", "error")
          this.stop()
          return
        }
      }

      setTimeout(gameLoop, this.updateInterval)
    }

    gameLoop()
  }

  stop() {
    this.running = false
    this.ui.drawMessage("Simulation stopped. Thanks for playing!", "info")
    process.stdin.setRawMode(false)
    process.exit(0)
  }
}
