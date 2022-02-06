@react.component
let make = (~className="", ~columns, ~onChange, ~columnToString) => {
  let toggleActive = targetKey =>
    columns
    ->Belt.Array.map(((key, active)) =>
      switch key === targetKey {
      | true => (key, !active)
      | false => (key, active)
      }
    )
    ->onChange

  let makeCheckbox = ((key, active)) =>
    <Vechai.Checkbox
      size={#lg}
      key={key->columnToString}
      className="mr-2"
      checked={active}
      onChange={_ => toggleActive(key)}>
      {key->columnToString->React.string}
    </Vechai.Checkbox>

  <div className={`border-primary-std border rounded-xl p-2 flex flex-col space-y-1 ${className}`}>
    {columns->Belt.Array.map(makeCheckbox)->React.array}
  </div>
}
