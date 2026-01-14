export class Animal {
  constructor(id, species, name, energy = 100, health = 100, age = 0) {
    this.id = id
    this.species = species
    this.name = name
    this.energy = energy
    this.health = health
    this.age = age
    this.alive = true
    this.position = { x: 0, y: 0 }
    this.traits = {}
  }

  update(ecosystem) {
    if (!this.alive) return

    this.age += 0.1
    this.energy -= ecosystem.rules.energyDecay
    this.health -= ecosystem.rules.healthDecay

    if (this.energy <= 0 || this.health <= 0 || this.age > this.maxAge) {
      this.alive = false
    }

    this.applyTimeBasedBehavior(ecosystem)
    this.move(ecosystem)
    this.feed(ecosystem)
  }

  applyTimeBasedBehavior(ecosystem) {
    const timeOfDay = this.getTimeOfDay(ecosystem.time)
    
    switch (timeOfDay) {
      case "dawn":
        this.energy -= 0.5
        this.traits.speed = (this.traits.speed || 1) * 1.2
        break
      case "day":
        if (this.species === "herbivore") {
          this.energy -= 0.3
        } else if (this.species === "carnivore") {
          this.energy -= 0.8
        }
        break
      case "dusk":
        this.energy -= 0.4
        this.traits.speed = (this.traits.speed || 1) * 0.9
        break
      case "night":
        if (this.species === "carnivore") {
          this.traits.speed = (this.traits.speed || 1) * 1.3
        } else {
          this.energy -= 0.2
          this.traits.speed = (this.traits.speed || 1) * 0.7
        }
        break
    }
  }

  getTimeOfDay(time) {
    const hour = (time % 240) / 10
    if (hour >= 5 && hour < 8) return "dawn"
    if (hour >= 8 && hour < 18) return "day"
    if (hour >= 18 && hour < 21) return "dusk"
    return "night"
  }

  move(ecosystem) {
    const speed = this.traits.speed || 1
    this.position.x += (Math.random() - 0.5) * speed
    this.position.y += (Math.random() - 0.5) * speed

    this.position.x = Math.max(0, Math.min(ecosystem.width, this.position.x))
    this.position.y = Math.max(0, Math.min(ecosystem.height, this.position.y))
  }

  feed(ecosystem) {
    const food = ecosystem.findFood(this.position, this.traits.diet)
    if (food) {
      this.energy = Math.min(100, this.energy + food.energy)
      this.health = Math.min(100, this.health + food.health)
      ecosystem.consumeFood(food)
    }
  }

  reproduce() {
    const threshold = this.ecosystem?.rules?.reproductionThreshold || 70
    if (this.energy > threshold && this.health > threshold && Math.random() < 0.1) {
      const child = new Animal(Date.now(), this.species, `${this.name}_child`, 80, 90, 0)
      child.ecosystem = this.ecosystem
      return child
    }
    return null
  }

  getStatus() {
    return {
      id: this.id,
      species: this.species,
      name: this.name,
      energy: Math.round(this.energy),
      health: Math.round(this.health),
      age: Math.round(this.age),
      alive: this.alive,
      position: { ...this.position },
    }
  }
}

export class Herbivore extends Animal {
  constructor(id, name) {
    super(id, "herbivore", name)
    this.traits = {
      diet: "herbivore",
      speed: 1.5,
      maxAge: 50,
    }
    this.maxAge = 50
  }
}

export class Carnivore extends Animal {
  constructor(id, name) {
    super(id, "carnivore", name)
    this.traits = {
      diet: "carnivore",
      speed: 2.0,
      maxAge: 40,
    }
    this.maxAge = 40
  }

  feed(ecosystem) {
    const prey = ecosystem.findPrey(this.position)
    if (prey) {
      this.energy = Math.min(100, this.energy + 30)
      this.health = Math.min(100, this.health + 20)
      prey.alive = false
    }
  }
}

export class Omnivore extends Animal {
  constructor(id, name) {
    super(id, "omnivore", name)
    this.traits = {
      diet: "omnivore",
      speed: 1.8,
      maxAge: 45,
    }
    this.maxAge = 45
  }
}
