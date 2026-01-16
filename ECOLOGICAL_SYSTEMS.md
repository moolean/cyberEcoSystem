# Ecological Systems Documentation

## Overview
The ecosystem simulation has been enhanced with realistic ecological systems that create a more dynamic and interconnected environment. Animals, plants, soil, oxygen, and water now interact in a closed-loop system similar to a real terrarium or ecological box.

## New Systems

### 1. Soil Nutrition System 🌱

**Purpose**: Simulates the nutrient cycle where dead organisms return nutrients to the soil.

**Mechanics**:
- Soil nutrition level: 0-200 scale (starts at 100)
- Dead animals are added to a decomposition queue
- Over 20 ticks, dead animals gradually decompose
- Decomposition adds nutrition to soil (15 points per fully decomposed animal)
- Plants consume soil nutrition to grow (0.05 per plant per tick)
- Low soil nutrition (< 30) reduces plant spawn rate by 30%
- Soil naturally depletes at 0.1 per tick

**Impact**:
- Creates a feedback loop: animals die → soil enriched → more plants grow → more food for animals
- Prevents infinite plant growth without nutrient source
- Makes death meaningful to the ecosystem

### 2. Oxygen System 💨

**Purpose**: Simulates atmospheric oxygen production and consumption.

**Mechanics**:
- Oxygen level: 0-200 scale (starts at 100)
- Plants produce oxygen (0.3 per plant per tick)
- Animals consume oxygen (0.5 per animal per tick)
- Low oxygen (< 30) causes animals to lose 2 health per tick
- Creates balance between plant and animal populations

**Impact**:
- Too many animals without plants → oxygen drops → animals die
- Plants needed for animal survival, not just food
- Simulates the critical role of photosynthesis

### 3. Water System 💧

**Purpose**: Simulates water resource management and weather effects.

**Mechanics**:
- Water level: 0-200 scale (starts at 100)
- Animals consume water (0.3 per animal per tick)
- Plants consume water (0.2 per plant per tick)
- Weather system affects water availability
- Low water (< 20) damages animal health (1.5 per tick)
- Critical drought (< 10) kills plants (20% chance per tick)
- Water slowly regenerates in clear weather (0.5 per tick)

**Impact**:
- Creates scarcity that affects survival
- Weather becomes critically important
- Balances ecosystem population

### 4. Weather System 🌦️

**Purpose**: Simulates dynamic weather patterns that affect resources.

**Weather Types**:
1. **Clear ☀️**: Normal conditions, slow water regeneration
2. **Rainy 🌧️**: Adds 30 water to ecosystem
3. **Drought 🌵**: Removes 20 water from ecosystem

**Mechanics**:
- Weather changes every 50 ticks
- 30% chance of rain
- 20% chance of drought  
- 50% chance of clear weather

**Impact**:
- Creates resource variability
- Adds unpredictability to ecosystem
- Can trigger population booms or crashes

## UI Improvements

### Beautiful Unicode Box-Drawing

The UI now uses professional Unicode box-drawing characters instead of simple ASCII:

**Before**:
```
+++++++++++++++++++++++++
| Header | Value |
+++++++++++++++++++++++++
```

**After**:
```
╔═══════════════════════════════════╗
║ Header          │ Value           ║
╠═════════════════╬═════════════════╣
║ Data            │ 100             ║
╚═══════════════════════════════════╝
```

**Characters Used**:
- `╔` `╗` - Top corners
- `╚` `╝` - Bottom corners
- `║` - Vertical borders
- `═` - Horizontal borders
- `╠` `╣` - Left/right connectors
- `╬` - Cross connectors
- `│` - Column separators

### Enhanced Statistics Display

New metrics are displayed in the Statistics (View 2) and Ecosystem (View 4) views:
- Soil Nutrition with 🌱 emoji
- Oxygen Level with 💨 emoji
- Water Level with 💧 emoji
- Weather status with appropriate emoji (☀️🌧️🌵)
- Decomposing bodies count with ⚰️ emoji
- Separate plant 🌿 and meat 🥩 counts

## Ecosystem Interactions

The systems create multiple interconnected feedback loops:

### Positive Loops (Self-Reinforcing)
1. **Growth Cycle**: Animals die → Soil enriched → Plants grow → More food → Animals thrive
2. **Oxygen Cycle**: Plants grow → Oxygen increases → Animals survive → Create waste → Soil enriched

### Negative Loops (Self-Balancing)
1. **Population Control**: Too many animals → Low oxygen + Low water → Animals die → Population decreases
2. **Resource Limits**: Many plants → Soil depletes → Fewer plants spawn → Balance restored
3. **Weather Events**: Drought → Water drops → Deaths increase → Population shrinks

## Game Balance

The systems are balanced to create sustainable ecosystems:
- Average of 10-30 animals can be sustained
- Plant production scales with soil nutrition
- Oxygen and water create natural population caps
- Weather adds variability without being catastrophic
- Decomposition ensures nutrients cycle back

## Future Enhancements

Possible additions:
- Temperature system affecting metabolic rates
- Food chains with multiple trophic levels
- Pollution from overpopulation
- Seasonal variations in weather
- Migration patterns based on resources
- Symbiotic relationships between species
- Disease spread based on population density

## Technical Implementation

### Key Files Modified
1. **src/Ecosystem.js**: Core ecological systems logic
2. **src/TerminalUI.js**: Display of new metrics
3. **src/utils.js**: Beautiful Unicode box-drawing in tables

### New Ecosystem Properties
```javascript
this.soilNutrition = 100  // 0-200 scale
this.oxygenLevel = 100    // 0-200 scale  
this.waterLevel = 100     // 0-200 scale
this.weather = "clear"    // "clear", "rainy", "drought"
this.deadAnimals = []     // Decomposition queue
```

### Update Cycle
Each tick calls:
1. `updateWeather()` - Check for weather changes
2. `updateDecomposition()` - Process decomposing bodies
3. `updateOxygen()` - Calculate oxygen production/consumption
4. `updateSoilAndPlants()` - Update soil and plant growth
5. `updateWater()` - Calculate water consumption

## Conclusion

These ecological systems transform the simulation from a simple animal survival game into a complex, interconnected ecosystem. Every action has consequences, and the health of the ecosystem depends on maintaining balance between all systems. The beautiful Unicode UI makes monitoring these systems a pleasure.
