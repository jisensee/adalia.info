open Recharts

@react.component
let make = (~className="", ~counts, ~totalCount) => {
  open Fragments.SpectralTypeCounts
  let c = counts
  let data = [
    {
      "name": "C",
      "value": c.c,
    },
    {
      "name": "CM",
      "value": c.cm,
    },
    {
      "name": "CI",
      "value": c.cs,
    },
    {
      "name": "CS",
      "value": c.cs,
    },
    {
      "name": "CMS",
      "value": c.cms,
    },
    {
      "name": "CIS",
      "value": c.cis,
    },
    {
      "name": "S",
      "value": c.s,
    },
    {
      "name": "SM",
      "value": c.sm,
    },
    {
      "name": "SI",
      "value": c.si,
    },
    {
      "name": "M",
      "value": c.m,
    },
    {
      "name": "I",
      "value": c.i,
    },
  ]->Belt.Array.keep(e => e["value"] > 0)

  <Chart className title="Spectral types">
    <PieChart>
      <Pie
        data
        label={Chart.renderPieLabel(_, totalCount)}
        dataKey="value"
        nameKey="name"
        cx=Prc(50.)
        cy=Prc(50.)
        outerRadius=Prc(80.)
        isAnimationActive={false}>
        {data
        ->Chart.mapColors((i, _, color) => <Cell key={Belt.Int.toString(i)} fill={color} />)
        ->React.array}
      </Pie>
      <Tooltip />
    </PieChart>
  </Chart>
}
