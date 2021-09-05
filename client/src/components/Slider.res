@module("rc-slider") @react.component
external make: (
  ~className: string=?,
  ~value: (float, float),
  ~onChange: ((float, float)) => unit,
  ~min: float=?,
  ~max: float=?,
  ~step: float=?,
  ~allowCross: bool=?,
  ~pushable: float=?,
  ~disabled: bool=?,
) => React.element = "Range"

@val @scope("Math") external pow: (float, float) => float = "pow"

type props = {
  min: float,
  max: float,
  step: float,
  value: (float, float),
  revertValue: ((float, float)) => (float, float),
}
let getLogProps = (~min, ~max, ~value) => {
  let newMin = Js.Math.log(min +. 1.)
  let newMax = Js.Math.log(max +. 1.)
  let (left, right) = value
  {
    min: newMin,
    max: newMax,
    step: (newMax -. newMin) /. 100.,
    value: (Js.Math.log(left +. 1.), Js.Math.log(right +. 1.)),
    revertValue: ((l, r)) => (Js.Math.exp(l) -. 1., Js.Math.exp(r) -. 1.),
  }
}
