@react.component
let make = (~address: string) => {
  switch address {
  | "" => "-"->React.string
  | add => add->React.string
  }
}
