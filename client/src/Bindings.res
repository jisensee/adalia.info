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

module Location = {
  @val @scope("location") external reload: unit => unit = "reload"
}

module Document = {
  type keyEventHandler = ReactEvent.Keyboard.t => unit
  @val @scope("document")
  external addKeyEventListener: (string, keyEventHandler, bool) => unit = "addEventListener"

  let onKeyDown = handler => addKeyEventListener("keydown", handler, false)
}
