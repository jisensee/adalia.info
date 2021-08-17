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
      ReactEvent.Form.currentTarget(e)["value"]->Float.fromString->Option.forEach(onChange)

    <input
      className
      type_="number"
      value={value->Float.toString}
      onChange=onValueChange
      disabled={!enabled}
    />
  }
}

module NumberRangeInput = {
  @react.component
  let make = (~className="", ~inputClassName="", ~value, ~onChange, ~enabled) => {
    let (lower, upper) = value

    <div className={`flex flex-row items-center space-x-3 ${className}`}>
      <NumberInput
        className=inputClassName
        value=lower
        onChange={newLower => onChange((newLower, upper))}
        enabled
      />
      <Icon className="text-cyan" kind={Icon.Fas("minus")} />
      <NumberInput
        className=inputClassName
        value=upper
        onChange={newUpper => onChange((lower, newUpper))}
        enabled
      />
    </div>
  }
}

module Popover = {
  @module("@headlessui/react") @react.component
  external make: (~className: string=?, ~children: React.element) => React.element = "Popover"

  module Button = {
    @module("@headlessui/react") @scope("Popover") @react.component
    external make: (~className: string=?, ~children: React.element) => React.element = "Button"
  }

  module Panel = {
    @module("@headlessui/react") @scope("Popover") @react.component
    external make: (~className: string=?, ~children: React.element) => React.element = "Panel"
  }
}

module Transition = {
  @module("@headlessui/react") @react.component
  external make: (
    ~children: React.element,
    ~className: string=?,
    ~show: bool=?,
    ~appear: bool=?,
    ~enter: string=?,
    ~enterFrom: string=?,
    ~enterTo: string=?,
    ~leave: string=?,
    ~leaveFrom: string=?,
    ~leaveTo: string=?,
  ) => React.element = "Transition"
}
