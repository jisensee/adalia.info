open Recharts
open Belt

type entry = {
  name: string,
  value: int,
  x: float,
  y: float,
  cx: int,
  cy: int,
  midAngle: float,
  maxRadius: float,
  percient: float,
  middleRadius: float,
  innerRadius: float,
  outerRadius: float,
}

let colors = ["red", "green", "blue", "yellow", "orange", "teal"]

let mapColors = (data, mapper) =>
  data->Array.mapWithIndex((index, element) => {
    let colorCount = colors->Array.length
    let color = colors->Array.getUnsafe(mod(index, colorCount))
    mapper(index, element, color)
  })

let renderWhiteLabel = e =>
  <text className="text-white fill-current"> {e.name->React.string} </text>

let renderPieLabel = (e, totalCount) => {
  let p = Format.formatFloat(e.value->Int.toFloat /. totalCount->Int.toFloat *. 100., 0)
  let t = `${e.name} (${p}%)`->React.string
  <text
    className="text-white fill-current"
    x={e.x->Float.toString}
    y={e.y->Float.toString}
    textAnchor={e.x > Belt.Int.toFloat(e.cx) ? "start" : "end"}
    dominantBaseline="center">
    {t}
  </text>
}

@react.component
let make = (~children, ~className="", ~title) =>
  <div
    className={`flex flex-col space-y-3 h-96 w-full p-3 bg-fill border border-primary-std rounded-2xl ${className}`}>
    <h3> {title->React.string} </h3>
    <ResponsiveContainer height=Prc(100.) width=Prc(100.)> {children} </ResponsiveContainer>
  </div>
