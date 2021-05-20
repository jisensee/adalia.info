open Belt

module LoadingSpinner = {
  @react.component
  let make = (~className="", ~text) => {
    <Icon kind={Icon.Fas("spinner")} className={`${className} animate-spin`}>
      {text->React.string}
    </Icon>
  }
}

module Select = {
  @react.component
  let make = (
    ~className="",
    ~value,
    ~onChange,
    ~options,
    ~toString,
    ~fromString,
    ~enabled=true,
  ) => {
    let onSelectChange = e => {
      ReactEvent.Form.currentTarget(e)["value"]->fromString->onChange
      e->ReactEvent.Form.preventDefault->ignore
    }
    <select className value={value->toString} onChange=onSelectChange disabled={!enabled}>
      {options
      ->Belt.Array.map(((val, display)) =>
        <option key=val value=val> {display->React.string} </option>
      )
      ->React.array}
    </select>
  }
}

module NumberInput = {
  @react.component
  let make = (~className="", ~value, ~onChange, ~enabled=true) => {
    let onValueChange = e =>
      ReactEvent.Form.currentTarget(e)["value"]->Int.fromString->Option.forEach(onChange)

    <input
      className
      type_="number"
      value={value->Int.toString}
      onChange=onValueChange
      disabled={!enabled}
    />
  }
}
