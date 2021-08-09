module Timer = {
  @val external start: (unit => unit, int) => unit = "setTimeout"
}

module Clipboard = {
  @val external write: string => Promise.t<unit> = "navigator.clipboard.writeText"
}

module Web3 = {
  @module("./web3") external requestTx: string => Promise.t<unit> = "requestTx"
}
