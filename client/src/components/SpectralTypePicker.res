module Button = {
  @react.component
  let make = (~spectralType: SpectralType.t, ~onActiveChange, ~active, ~enabled) => {
    let onClick = _ =>
      switch enabled {
      | true => onActiveChange(!active)
      | false => ()
      }

    let borderColor = switch active {
    | true => "border-cyan"
    | false => "border-gray-500 "
    }
    let enabledStyle = switch enabled {
    | true => "opacity-100 cursor-pointer"
    | false => "opacity-30"
    }

    <div
      className={`w-12 text-center py-1 border border-solid rounded-2xl ${borderColor} ${enabledStyle}`}
      onClick>
      {(spectralType :> string)->React.string}
    </div>
  }
}

let types: array<SpectralType.t> = [#C, #CI, #CIS, #CM, #CMS, #CS, #I, #M, #S, #SI, #SM]

@react.component
let make = (~selected, ~onChange, ~enabled) => {
  let onActiveChange = (t: SpectralType.t, active) =>
    onChange(
      switch active {
      | true => selected->Belt.Array.concat([t])
      | false => selected->Belt.Array.keep(v => v !== t)
      },
    )
  let toButton = t => {
    <Button
      key={(t :> string)}
      spectralType=t
      active={selected->Js.Array2.includes(t)}
      onActiveChange={onActiveChange(t)}
      enabled
    />
  }
  <div className="grid grid-cols-4 gap-3"> {types->Belt.Array.map(toButton)->React.array} </div>
}
