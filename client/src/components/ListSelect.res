module Button = {
  @react.component
  let make = (~option, ~onActiveChange, ~optionToString, ~active, ~enabled, ~width="") => {
    let onClick = _ =>
      switch enabled {
      | true => onActiveChange(!active)
      | false => ()
      }

    let borderColor = switch active {
    | true => "border-primary-std"
    | false => "border-gray-500 "
    }
    let enabledStyle = switch enabled {
    | true => "opacity-100 cursor-pointer"
    | false => "opacity-disabled"
    }

    <div className="p-1">
      <div
        className={`${width} p-4 text-center py-1 border border-solid rounded-2xl ${borderColor} ${enabledStyle}`}
        onClick>
        {option->optionToString->React.string}
      </div>
    </div>
  }
}

@react.component
let make = (~options, ~selected, ~onChange, ~optionToString, ~enabled, ~elementWidth="") => {
  let onActiveChange = (option, active) =>
    onChange(
      switch active {
      | true => selected->Belt.Array.concat([option])
      | false => selected->Belt.Array.keep(v => v !== option)
      },
    )
  let toButton = option => {
    <Button
      key={option->optionToString}
      option
      active={selected->Js.Array2.includes(option)}
      onActiveChange={onActiveChange(option)}
      optionToString
      enabled
      width=elementWidth
    />
  }
  <div className="flex flex-row flex-wrap items-center">
    {options->Belt.Array.map(toButton)->React.array}
  </div>
}
