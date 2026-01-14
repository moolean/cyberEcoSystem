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
  const border = "+".repeat(headers.reduce((sum, h, i) => sum + colWidths[i] + 3, 1))

  let table = border + "\n"
  table += "| " + headers.map((h, i) => coloredText(h.padEnd(colWidths[i]), "cyan")).join(" | ") + " |\n"
  table += border + "\n"

  data.forEach((row) => {
    table +=
      "| " +
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
        .join(" | ") +
      " |\n"
  })

  table += border
  return table
}

export function clearScreen() {
  console.clear()
}

export function getTerminalWidth() {
  return process.stdout.columns || 80
}
