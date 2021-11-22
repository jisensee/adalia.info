open Recharts
open Belt

type e = {
  value: int,
  name: string,
  x: float,
  y: float,
}

type tickElement = {
  x: float,
  y: float,
  orientation: string,
  textAnchor: string,
  payload: {"value": string},
}

@react.component
let make = (~className, ~counts, ~totalCount) => {
  open Fragments.RarityCounts
  let data = [
    {
      "name": "Common",
      "value": counts.common,
      "color": "grey",
    },
    {
      "name": "Uncommon",
      "value": counts.uncommon,
      "color": "#043f4f",
    },
    {
      "name": "Rare",
      "value": counts.rare,
      "color": "#003dcc",
    },
    {
      "name": "Superior",
      "value": counts.superior,
      "color": "#340070",
    },
    {
      "name": "Exceptional",
      "value": counts.exceptional,
      "color": "#612700",
    },
    {
      "name": "Incomparable",
      "value": counts.incomparable,
      "color": "#4a4000",
    },
  ]
  let barLabel = e => {
    let percent = Format.formatFloat(Int.toFloat(e.value) /. Int.toFloat(totalCount) *. 100., 2)
    let x = Float.toString(e.x +. 20.)
    let y = Float.toString(e.y +. 24.)
    let text = `${e.value->Int.toFloat->Format.formatFloat(0)} (${percent}%)`
    <text
      key={e.value->Int.toString} className="text-foreground fill-current" x y textAnchor="center">
      {switch e.value === 0 {
      | true => React.null
      | false => text->React.string
      }}
    </text>
  }
  let axisTick = e => {
    let y = Float.toString(e.y +. 4.)
    <text
      x={e.x->Float.toString}
      y={y}
      className="text-foreground fill-current"
      orientation=e.orientation
      textAnchor=e.textAnchor>
      {e.payload["value"]->React.string}
    </text>
  }
  <Chart className title="Rarities">
    <BarChart data layout={#vertical}>
      <Bar dataKey="value" fill="grey" label=barLabel>
        {data->Array.map(d => <Cell key={d["name"]} fill={d["color"]} />)->React.array}
      </Bar>
      <XAxis _type={#number} tick={false} tickLine={false} />
      <YAxis _type={#category} width={125} dataKey="name" tickLine={false} tick={axisTick} />
    </BarChart>
  </Chart>
}
