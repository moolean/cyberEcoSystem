export class Ecosystem {
  constructor(width = 100, height = 100, mode = "basic") {
    this.width = width
    this.height = height
    this.animals = []
    this.food = []
    this.deadAnimals = [] // Track dead animals for decomposition
    this.time = 0
    this.mode = mode
    this.rules = this.getRulesByMode(mode)
    
    // New ecological systems
    this.soilNutrition = 100 // 0-200 scale
    this.oxygenLevel = 100 // 0-200 scale
    this.waterLevel = 100 // 0-200 scale
    this.weather = "clear" // clear, rainy, drought
  }

  getRulesByMode(mode) {
    if (mode === "advanced") {
      return {
        energyDecay: 1.5,
        healthDecay: 0.8,
        foodSpawnRate: 0.25,
        maxFood: 75,
        climate: "temperate",
        season: "spring",
        disasterChance: 0.02,
        reproductionThreshold: 75,
        agingRate: 0.15,
        predationEfficiency: 0.7,
        diseaseSpread: 0.1,
        migrationPattern: true,
        competitionFactor: 0.3,
        weatherVariability: 0.4,
        resourceRegeneration: 0.6
      }
    } else {
      return {
        energyDecay: 2,
        healthDecay: 1,
        foodSpawnRate: 0.3,
        maxFood: 50,
        climate: "temperate",
        season: "spring",
        disasterChance: 0.01,
        reproductionThreshold: 70,
        agingRate: 0.1,
        predationEfficiency: 0.5,
        diseaseSpread: 0.05,
        migrationPattern: false,
        competitionFactor: 0.2,
        weatherVariability: 0.2,
        resourceRegeneration: 0.4
      }
    }
  }

  addAnimal(animal) {
    animal.position.x = Math.random() * this.width
    animal.position.y = Math.random() * this.height
    this.animals.push(animal)
  }

  spawnFood() {
    if (this.food.length < this.rules.maxFood && Math.random() < this.rules.foodSpawnRate) {
      this.food.push({
        id: Date.now() + Math.random(),
        type: Math.random() > 0.5 ? "plant" : "meat",
        position: {
          x: Math.random() * this.width,
          y: Math.random() * this.height,
        },
        energy: 20,
        health: 10,
      })
    }
  }

  findFood(position, diet) {
    const range = 5
    return this.food.find((f) => {
      const distance = Math.sqrt(Math.pow(f.position.x - position.x, 2) + Math.pow(f.position.y - position.y, 2))
      return (
        distance < range &&
        (diet === "omnivore" ||
          (diet === "herbivore" && f.type === "plant") ||
          (diet === "carnivore" && f.type === "meat"))
      )
    })
  }

  findPrey(position) {
    const range = 8
    return this.animals.find((a) => {
      if (!a.alive || a.species === "carnivore") return false
      const distance = Math.sqrt(Math.pow(a.position.x - position.x, 2) + Math.pow(a.position.y - position.y, 2))
      return distance < range
    })
  }

  consumeFood(food) {
    const index = this.food.indexOf(food)
    if (index > -1) {
      this.food.splice(index, 1)
    }
  }

  updateSeason() {
    const seasons = ["spring", "summer", "autumn", "winter"]
    const currentIndex = seasons.indexOf(this.rules.season)
    this.rules.season = seasons[(currentIndex + 1) % 4]

    this.applySeasonalEffects()
  }

  // Weather system for water resource management
  updateWeather() {
    // Change weather every 50 ticks
    if (this.time % 50 === 0) {
      const weatherChance = Math.random()
      if (weatherChance < 0.3) {
        this.weather = "rainy"
        this.waterLevel = Math.min(200, this.waterLevel + 30) // Rain adds water
      } else if (weatherChance < 0.5) {
        this.weather = "drought"
        this.waterLevel = Math.max(0, this.waterLevel - 20) // Drought reduces water
      } else {
        this.weather = "clear"
      }
    }
    
    // Water slowly regenerates in clear weather
    if (this.weather === "clear" && this.waterLevel < 100) {
      this.waterLevel = Math.min(100, this.waterLevel + 0.5)
    }
  }

  // Decomposition system: dead animals become soil nutrition
  updateDecomposition() {
    // Process dead animals
    this.deadAnimals.forEach((deadAnimal, index) => {
      deadAnimal.decompositionProgress = (deadAnimal.decompositionProgress || 0) + 1
      
      // Takes 20 ticks to fully decompose
      if (deadAnimal.decompositionProgress >= 20) {
        // Add nutrition to soil based on animal size
        const nutritionGain = 15
        this.soilNutrition = Math.min(200, this.soilNutrition + nutritionGain)
        this.deadAnimals.splice(index, 1)
      } else {
        // Gradual decomposition adds small amounts
        this.soilNutrition = Math.min(200, this.soilNutrition + 0.5)
      }
    })
  }

  // Oxygen system: plants produce oxygen, animals consume it
  updateOxygen() {
    // Plants (food items) produce oxygen
    const plantCount = this.food.filter(f => f.type === "plant").length
    const oxygenProduction = plantCount * 0.3
    this.oxygenLevel = Math.min(200, this.oxygenLevel + oxygenProduction)
    
    // Animals consume oxygen
    const oxygenConsumption = this.animals.length * 0.5
    this.oxygenLevel = Math.max(0, this.oxygenLevel - oxygenConsumption)
    
    // Low oxygen damages animal health
    if (this.oxygenLevel < 30) {
      this.animals.forEach(animal => {
        animal.health -= 2 // Animals suffer when oxygen is low
      })
    }
  }

  // Soil nutrition affects plant growth
  updateSoilAndPlants() {
    // Soil nutrition slowly depletes naturally
    this.soilNutrition = Math.max(0, this.soilNutrition - 0.1)
    
    // Plants consume soil nutrition to grow
    const plantCount = this.food.filter(f => f.type === "plant").length
    this.soilNutrition = Math.max(0, this.soilNutrition - plantCount * 0.05)
    
    // If soil nutrition is low, reduce plant spawn rate
    if (this.soilNutrition < 30) {
      this.rules.foodSpawnRate *= 0.7
    }
  }

  // Water consumption by animals and plants
  updateWater() {
    // Animals and plants consume water
    const waterConsumption = (this.animals.length * 0.3) + (this.food.length * 0.2)
    this.waterLevel = Math.max(0, this.waterLevel - waterConsumption)
    
    // Low water damages health
    if (this.waterLevel < 20) {
      this.animals.forEach(animal => {
        animal.health -= 1.5
      })
      // Plants die in severe drought
      if (this.waterLevel < 10 && Math.random() < 0.2) {
        if (this.food.length > 0) {
          this.food.splice(Math.floor(Math.random() * this.food.length), 1)
        }
      }
    }
  }

  getTimeOfDay(time) {
    const hour = (time % 240) / 10
    if (hour >= 5 && hour < 8) return "dawn"
    if (hour >= 8 && hour < 18) return "day"
    if (hour >= 18 && hour < 21) return "dusk"
    return "night"
  }

  applyTimeBasedRules() {
    const timeOfDay = this.getTimeOfDay(this.time)
    
    switch (timeOfDay) {
      case "dawn":
        this.rules.foodSpawnRate *= 1.2
        this.rules.energyDecay *= 0.9
        break
      case "day":
        this.rules.foodSpawnRate *= 1.5
        this.rules.energyDecay *= 1.1
        break
      case "dusk":
        this.rules.foodSpawnRate *= 0.8
        this.rules.energyDecay *= 1.0
        break
      case "night":
        this.rules.foodSpawnRate *= 0.3
        this.rules.energyDecay *= 0.8
        break
    }
  }

  applySeasonalEffects() {
    switch (this.rules.season) {
      case "spring":
        this.rules.foodSpawnRate = 0.4
        this.rules.energyDecay = 1.5
        break
      case "summer":
        this.rules.foodSpawnRate = 0.5
        this.rules.energyDecay = 2
        break
      case "autumn":
        this.rules.foodSpawnRate = 0.3
        this.rules.energyDecay = 2.5
        break
      case "winter":
        this.rules.foodSpawnRate = 0.1
        this.rules.energyDecay = 3
        break
    }
  }

  triggerDisaster() {
    if (Math.random() < this.rules.disasterChance) {
      const disasters = this.mode === "advanced" 
        ? ["drought", "flood", "disease", "predator_surge", "wildfire", "earthquake", "blizzard", "heatwave"]
        : ["drought", "flood", "disease", "predator_surge"]
      
      const disaster = disasters[Math.floor(Math.random() * disasters.length)]

      switch (disaster) {
        case "drought":
          this.rules.foodSpawnRate *= 0.2
          this.rules.resourceRegeneration *= 0.3
          break
        case "flood":
          this.animals.forEach((a) => (a.health -= 20))
          this.rules.maxFood *= 0.7
          break
        case "disease":
          this.animals.forEach((a) => {
            if (Math.random() < this.rules.diseaseSpread * 3) a.health -= 30
          })
          break
        case "predator_surge":
          this.rules.energyDecay *= 1.5
          this.rules.predationEfficiency *= 1.3
          break
        case "wildfire":
          this.rules.foodSpawnRate *= 0.1
          this.animals.filter(a => a.species === "herbivore").forEach(a => a.health -= 25)
          break
        case "earthquake":
          this.animals.forEach(a => a.health -= 15)
          this.rules.maxFood *= 0.8
          break
        case "blizzard":
          this.rules.foodSpawnRate *= 0.05
          this.animals.forEach(a => a.energy -= 10)
          break
        case "heatwave":
          this.rules.energyDecay *= 1.8
          this.rules.waterAvailability *= 0.4
          break
      }

      return disaster
    }
    return null
  }

  update() {
    this.time++

    if (this.time % 100 === 0) {
      this.updateSeason()
    }

    // Update new ecological systems
    this.updateWeather()
    this.updateDecomposition()
    this.updateOxygen()
    this.updateSoilAndPlants()
    this.updateWater()

    this.applyTimeBasedRules()
    this.spawnFood()

    const disaster = this.triggerDisaster()
    if (disaster) {
      console.log(`🌩️  Disaster: ${disaster}!`)
    }

    this.animals.forEach((animal) => animal.update(this))

    const newAnimals = []
    this.animals.forEach((animal) => {
      if (animal.alive) {
        const offspring = animal.reproduce()
        if (offspring) {
          newAnimals.push(offspring)
        }
      }
    })

    newAnimals.forEach((baby) => this.addAnimal(baby))

    // Move dead animals to decomposition queue
    const newlyDead = this.animals.filter(a => !a.alive)
    newlyDead.forEach(deadAnimal => {
      this.deadAnimals.push({
        ...deadAnimal,
        decompositionProgress: 0,
        diedAt: this.time
      })
    })

    this.animals = this.animals.filter((a) => a.alive)
  }

  getStatistics() {
    const stats = {
      total: this.animals.length,
      herbivores: 0,
      carnivores: 0,
      omnivores: 0,
      averageEnergy: 0,
      averageHealth: 0,
      averageAge: 0,
      food: this.food.length,
      season: this.rules.season,
      time: this.time,
      // New ecological data
      soilNutrition: this.soilNutrition,
      oxygenLevel: this.oxygenLevel,
      waterLevel: this.waterLevel,
      weather: this.weather,
      decomposingBodies: this.deadAnimals.length,
      plantCount: this.food.filter(f => f.type === "plant").length,
      meatCount: this.food.filter(f => f.type === "meat").length
    }

    if (this.animals.length > 0) {
      this.animals.forEach((animal) => {
        // Map species to plural form
        const speciesKey = animal.species + "s"
        stats[speciesKey]++
        stats.averageEnergy += animal.energy
        stats.averageHealth += animal.health
        stats.averageAge += animal.age
      })

      stats.averageEnergy /= this.animals.length
      stats.averageHealth /= this.animals.length
      stats.averageAge /= this.animals.length
    }

    return stats
  }

  updateRules(newRules) {
    this.rules = { ...this.rules, ...newRules }
  }
}
