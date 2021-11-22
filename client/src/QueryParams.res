open Belt

type pushReplaceHistory = {
  push: Bindings.Location.t => unit,
  replace: Bindings.Location.t => unit,
  location: Bindings.Location.t,
}
let history = {
  push: l => RescriptReactRouter.push(l.Bindings.Location.pathname ++ l.search),
  replace: l => RescriptReactRouter.replace(l.Bindings.Location.pathname ++ l.search),
  location: Bindings.location,
}

module Provider = {
  @module("use-query-params") @react.component
  external make: (~children: React.element, ~history: pushReplaceHistory) => React.element =
    "QueryParamProvider"
}

type paramType<'a> = {
  encode: option<'a> => option<string>,
  decode: option<string> => option<'a>,
}

type updateType = [
  | #pushIn
  | #push
  | #replaceInIn
  | #replaceIn
]

type set<'a> = ('a, updateType) => unit
@module("use-query-params")
external use: (string, paramType<'a>) => (option<'a>, set<'a>) = "useQueryParam"

let useWithDefault = (key, paramType, default) => {
  let (value, setValue) = use(key, paramType)
  let actualValue = switch value {
  | Some(v) => v
  | None => default
  }

  React.useEffect1(() => {
    if value === None {
      setValue(default, #replaceIn)
    }
    None
  }, [value])

  (actualValue, setValue)
}

let encoder = (encoder, value) =>
  switch value {
  | Some(value) => encoder(value)
  | None => Some("")
  }

let decoder = (decoder, str) =>
  switch str {
  | Some(str) => decoder(str)
  | None => None
  }

@module("use-query-params") @val external stringParam: paramType<string> = "StringParam"
@module("use-query-params") @val external intParam: paramType<int> = "NumberParam"
@module("use-query-params") @val external floatParam: paramType<float> = "NumberParam"
@module("use-query-params") @val external boolParam: paramType<bool> = "BooleanParam"
@module("use-query-params") @val
external stringArrayParam: paramType<array<string>> = "ArrayParam"

let floatRangeParam: paramType<(float, float)> = {
  encode: encoder(((a, b)) => `${a->Float.toString}-${b->Float.toString}`->Some),
  decode: decoder(str =>
    switch str->Js.String2.split("-")->List.fromArray {
    | list{from, to_} =>
      Float.fromString(from)->Option.flatMap(f => Float.fromString(to_)->Option.map(t => (f, t)))
    | _ => None
    }
  ),
}

let legacyBoolParam: paramType<bool> = {
  encode: encoder(b => Some(b ? "1" : "0")),
  decode: decoder(str =>
    switch str {
    | "true" | "1" => Some(true)
    | _ => Some(false)
    }
  ),
}

module SortMode = {
  type t = Ascending | Descending
  let toString = mode =>
    switch mode {
    | Ascending => "asc"
    | Descending => "desc"
    }
  let fromString = str =>
    switch str {
    | "asc" => Some(Ascending)
    | "desc" => Some(Descending)
    | _ => None
    }
}
type sortingType = {
  field: string,
  mode: SortMode.t,
}
let sortingParam: paramType<sortingType> = {
  encode: encoder(sort => `${sort.field}:${sort.mode->SortMode.toString}`->Some),
  decode: decoder(str =>
    switch str->Js.String2.split(":")->List.fromArray {
    | list{field, mode} => mode->SortMode.fromString->Option.map(m => {field: field, mode: m})
    | _ => None
    }
  ),
}

let setDefault = (~updateType: updateType=#replaceIn, value, setter, default) => {
  if value === None {
    setter(default, updateType)
  }
}
