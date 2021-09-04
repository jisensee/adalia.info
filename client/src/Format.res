let formatFloat: (float, int) => string = %raw(`
function(n, maximumDecimals) {
  return n.toLocaleString(n, { maximumFractionDigits: maximumDecimals })
}
`)

let bigFloat = n => {
  let (trimmed, suffix, decimals) = switch n {
  | n if n >= 1_000_000. => (n /. 1_000_000., "M", 2)
  | n if n >= 100_000. => (n /. 1_000., "K", 0)
  | n if n >= 10_000. => (n /. 1_000., "K", 1)
  | _ => (n, "", 0)
  }
  trimmed->formatFloat(decimals) ++ suffix
}

let radius = formatFloat(_, 0)
let surfaceArea = formatFloat(_, 0)
let semiMajorAxis = formatFloat(_, 3)
let inclination = formatFloat(_, 2)
let orbitalPeriod = formatFloat(_, 0)
let eccentricity = formatFloat(_, 3)
let price = (value, currency) => {
  let getEthDigits = () =>
    switch value {
    | v if v >= 100. => 1
    | v if v >= 10. => 2
    | _ => 3
    }
  switch currency {
  | Currency.ETH => `${formatFloat(value, getEthDigits())} ETH`
  | Currency.USD => `$${bigFloat(value)}`
  }
}
