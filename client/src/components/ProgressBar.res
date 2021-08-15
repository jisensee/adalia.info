open Belt

@send external toLocaleString: float => string = "toLocaleString"

let getText = (~count, ~total, ~percent) => {
  let countStr = count->Int.toFloat->toLocaleString
  let totalStr = total->Int.toFloat->toLocaleString
  let percentStr = percent->toLocaleString
  `${countStr} / ${totalStr} (${percentStr} %)`
}

let getPercent = (~count, ~total) => {
  let percent = count->Int.toFloat /. total->Int.toFloat *. 100.
  Js.Math.round(percent *. 100.) /. 100.
}

@react.component
let make = (~count, ~total, ~prefixText) => {
  let percent = getPercent(~count, ~total)
  let width = `${percent->Float.toString}%`
  let text = prefixText ++ getText(~count, ~total, ~percent)

  <svg className="w-full h-10">
    <rect width="100%" height="100%" className=" text-gray-lighter fill-current" />
    <rect width height="100%" className="text-cyan fill-current">
      <animate attributeName="width" from="0" to_=width dur="0.5s" />
    </rect>
    <text
      x="50%"
      y="50%"
      dominantBaseline="middle"
      textAnchor="middle"
      className="text-black fill-current text-xl text-gray-dark">
      {text->React.string}
    </text>
  </svg>
}
