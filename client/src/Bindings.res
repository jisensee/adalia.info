module Timer = {
  @val external start: (unit => unit, int) => unit = "setTimeout"
}

module Interval = {
  @val external run: (unit => unit, int) => unit = "setInterval"
}

module Clipboard = {
  @val external write: string => Promise.t<unit> = "navigator.clipboard.writeText"
}

module Web3 = {
  @module("./web3") external requestTx: string => Promise.t<unit> = "requestTx"
}

module LocalStorage = {
  @val @scope("localStorage") external set: (~key: string, ~value: string) => unit = "setItem"
  @val @scope("localStorage") external get: string => option<string> = "getItem"
}
