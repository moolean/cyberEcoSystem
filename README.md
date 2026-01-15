# Virtual Ecosystem Simulator

A beautiful terminal-based ecosystem simulation where animals survive based on configurable rules.

## Features

- 🌍 **Dynamic Ecosystem**: Watch animals live, eat, reproduce, and die in real-time
- 🐾 **Multiple Species**: Herbivores, Carnivores, and Omnivores with unique behaviors
- ⚙️ **Configurable Rules**: Modify ecosystem parameters like energy decay, food spawn rates, and disaster chances
- 🌦️ **Seasonal Changes**: Experience spring, summer, autumn, and winter with different effects
- 🌩️ **Random Disasters**: Droughts, floods, diseases, and predator surges
- 📊 **Beautiful Terminal UI**: Real-time statistics and animal status displays
- 🎮 **Interactive Controls**: Pause, add animals, trigger disasters, and modify rules

## Installation

```bash
npm install
```

## Usage

```bash
npm start
```

## Controls

- **1-5**: Switch between views (Animals, Statistics, Rules, Ecosystem, Performance)
- **Space**: Pause/Resume simulation
- **R**: Modify ecosystem rules
- **M**: Toggle mode (Basic/Advanced)
- **A**: Add random animal
- **F**: Add food
- **D**: Trigger random disaster
- **S**: Sort animals
- **↑/↓**: Scroll through lists
- **Q**: Quit simulation

## Views

### View 1: Animals (Press '1')
Displays a real-time table of all animals in the ecosystem with their status, energy, health, and age.

### View 2: Statistics (Press '2')
Shows ecosystem-wide statistics including population counts, averages, and food availability.

### View 3: Rules (Press '3')
Displays all current ecosystem rules and parameters that govern the simulation.

### View 4: Ecosystem (Press '4')
Shows a comprehensive overview of the ecosystem including season, climate, and time.

### View 5: Performance (Press '5')
Displays performance metrics including FPS, memory usage, and processing statistics.

## Ecosystem Rules

The ecosystem operates based on configurable parameters:

- **Energy Decay**: How much energy animals lose per tick
- **Health Decay**: How much health animals lose per tick
- **Food Spawn Rate**: Probability of food appearing each tick
- **Max Food**: Maximum food items in the ecosystem
- **Disaster Chance**: Probability of random disasters

## Animal Types

### 🌱 Herbivores

- Eat plants only
- Moderate speed (1.5)
- Live up to 50 time units

### 🦁 Carnivores

- Hunt other animals
- Fast speed (2.0)
- Live up to 40 time units

### 🐻 Omnivores

- Eat both plants and animals
- Balanced speed (1.8)
- Live up to 45 time units

## Seasonal Effects

- 🌸 **Spring**: High food spawn, low energy decay
- ☀️ **Summer**: Maximum food spawn, normal decay
- 🍂 **Autumn**: Moderate food, increased decay
- ❄️ **Winter**: Low food spawn, high energy decay

## Configuration

Edit `config.json` to customize:

- Initial animal count
- Species characteristics
- UI settings
- Seasonal effects
- Disaster parameters

## License

MIT
