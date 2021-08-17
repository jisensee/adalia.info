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
    <label className="font-bold" key={key->columnToString}>
      <input className="mr-2" type_="checkbox" checked={active} onChange={_ => toggleActive(key)} />
      {key->columnToString->React.string}
    </label>

  <div className={`bg-gray border-cyan border rounded-xl p-2 flex flex-col ${className}`}>
    {columns->Belt.Array.map(makeCheckbox)->React.array}
  </div>
}
