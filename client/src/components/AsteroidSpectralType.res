@react.component
let make = (~spectralType: string) =>
  <span>
    <span className="text-cyan text-xl font-bold"> {spectralType->React.string} </span>
    {"-type"->React.string}
  </span>
