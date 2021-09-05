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

let radius = bigFloat
let surfaceArea = bigFloat
let semiMajorAxis = formatFloat(_, 3)
let inclination = formatFloat(_, 2)
let orbitalPeriod = formatFloat(_, 0)
let eccentricity = formatFloat(_, 3)
let price = (~showSymbol=true, value, currency) => {
  let getEthDigits = () =>
    switch value {
    | v if v >= 100. => 1
    | v if v >= 10. => 2
    | _ => 3
    }
  let symbol = currency->Currency.toSymbol
  let formatted = switch currency {
  | Currency.ETH => formatFloat(value, getEthDigits())
  | Currency.USD => bigFloat(value)
  }
  switch (currency, showSymbol) {
  | (Currency.ETH, true) => `${formatted} ${symbol}`
  | (Currency.USD, true) => `${symbol}${formatted}`
  | (_, false) => formatted
  }
}
