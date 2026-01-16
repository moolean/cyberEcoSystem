export function coloredText(text, color) {
  const colors = {
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    bold: "\x1b[1m",
    reset: "\x1b[0m",
  }

  const colorCode = colors[color] || colors.white
  return `${colorCode}${text}${colors.reset}`
}

export function createTable(headers, data) {
  if (!headers || !data || data.length === 0) return ""

  const colWidths = headers.map((h) => 15)
  
  // Use beautiful Unicode box-drawing characters
  const totalWidth = headers.reduce((sum, h, i) => sum + colWidths[i] + 3, 1)
  const topBorder = "╔" + "═".repeat(totalWidth - 2) + "╗"
  const midBorder = "╠" + "═".repeat(totalWidth - 2) + "╣"
  const bottomBorder = "╚" + "═".repeat(totalWidth - 2) + "╝"
  
  // Build column separators for mid border
  let midSeparator = "╠"
  headers.forEach((h, i) => {
    midSeparator += "═".repeat(colWidths[i] + 2)
    if (i < headers.length - 1) {
      midSeparator += "╬"
    }
  })
  midSeparator += "╣"

  let table = coloredText(topBorder, "cyan") + "\n"
  table += coloredText("║", "cyan") + " " + headers.map((h, i) => coloredText(h.padEnd(colWidths[i]), "bold")).join(coloredText(" │ ", "cyan")) + " " + coloredText("║", "cyan") + "\n"
  table += coloredText(midSeparator, "cyan") + "\n"

  data.forEach((row) => {
    table +=
      coloredText("║", "cyan") + " " +
      row
        .map((cell, i) => {
          const cellStr = String(cell).padEnd(colWidths[i])
          const cellString = String(cell)
          if (cellString.includes("✓") || (cellString.includes("%") && parseInt(cellString) > 70)) {
            return coloredText(cellStr, "green")
          } else if (cellString.includes("✗") || (cellString.includes("%") && parseInt(cellString) < 30)) {
            return coloredText(cellStr, "red")
          } else if (cellString.includes("%") && parseInt(cellString) >= 30 && parseInt(cellString) <= 70) {
            return coloredText(cellStr, "yellow")
          }
          return cellStr
        })
        .join(coloredText(" │ ", "cyan")) +
      " " + coloredText("║", "cyan") + "\n"
  })

  table += coloredText(bottomBorder, "cyan")
  return table
}

export function clearScreen() {
  // Move cursor to home position without clearing
  process.stdout.write('\x1b[H')
}

export function clearScreenFull() {
  // Only use when really needed (e.g., initial render)
  process.stdout.write('\x1b[2J\x1b[H')
}

export function getTerminalWidth() {
  return process.stdout.columns || 80
}
