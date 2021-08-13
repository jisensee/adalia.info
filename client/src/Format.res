let formatFloat: (float, int) => string = %raw(`
function(n, maximumDecimals) {
  return n.toLocaleString(n, { maximumFractionDigits: maximumDecimals })
}
`)

let radius = formatFloat(_, 0)
let surfaceArea = formatFloat(_, 1)
let semiMajorAxis = formatFloat(_, 3)
let inclination = formatFloat(_, 2)
let orbitalPeriod = formatFloat(_, 0)
let eccentricity = formatFloat(_, 3)
